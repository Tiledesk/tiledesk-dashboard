import { ExecutionRow } from '../executions.models';

export interface GraphAgent { id: string; name: string; }
export type GraphNodeKind = 'project' | 'agent' | 'execution';
export interface GraphNode {
  id: string;                  // 'project' | 'agent:<agentId>' | 'exec:<executionId>'
  kind: GraphNodeKind;
  label: string;
  status?: 'running' | 'waiting' | 'stopping' | 'failed';
  agentId?: string;
  executionId?: string;
  aura: boolean;               // red aura
  idle?: boolean;              // agent with nothing shown
  position: { x: number; y: number };
  tooltip: string[];
}
export interface GraphEdge { id: string; source: string; target: string; animated: boolean; }
export interface GraphCounts { running: number; waiting: number; stopping: number; failed: number; truncated: boolean; }
export interface GraphModel { nodes: GraphNode[]; edges: GraphEdge[]; counts: GraphCounts; }

export const FAILED_WINDOW_MS = 15 * 60 * 1000;
export const MAX_LIVE = 300;

type ShownStatus = 'running' | 'waiting' | 'stopping' | 'failed';

function cmp(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function tooltipFor(r: ExecutionRow, status: string): string[] {
  const trigger = r.trigger && (r.trigger.type || r.trigger.kind || r.trigger.name);
  return [
    'Status: ' + status,
    'Started: ' + (r.started_at || '-'),
    'Trigger: ' + (trigger || '-'),
    'Steps: ' + (r.steps_count ?? 0)
  ];
}

export function buildExecutionGraph(input: {
  projectName: string; agents: GraphAgent[]; live: ExecutionRow[]; failed: ExecutionRow[]; now: number;
}): GraphModel {
  const { projectName, agents, live, failed, now } = input;

  const counts: GraphCounts = { running: 0, waiting: 0, stopping: 0, failed: 0, truncated: live.length > MAX_LIVE };
  for (const r of live) {
    if (r.status === 'running') counts.running++;
    else if (r.status === 'waiting') counts.waiting++;
    else if (r.status === 'stopping') counts.stopping++;
  }

  const shown: { row: ExecutionRow; status: ShownStatus }[] = [];
  const seen = new Set<string>();
  for (const r of live.slice(0, MAX_LIVE)) {
    if (r.status !== 'running' && r.status !== 'waiting' && r.status !== 'stopping') continue;
    seen.add(r._id);
    shown.push({ row: r, status: r.status });
  }
  for (const r of failed) {
    if (seen.has(r._id) || !r.started_at) continue;
    const start = Date.parse(r.started_at);
    if (isNaN(start)) continue;
    if (now - (start + (r.duration_ms || 0)) > FAILED_WINDOW_MS) continue;
    seen.add(r._id);
    shown.push({ row: r, status: 'failed' });
    counts.failed++;
  }

  const agentMap = new Map<string, GraphAgent>();
  for (const a of agents) agentMap.set(a.id, a);
  for (const s of shown) {
    const id = s.row.agent_id;
    if (!agentMap.has(id)) agentMap.set(id, { id, name: s.row.agent_name || id.substring(0, 8) });
  }
  const sortedAgents = Array.from(agentMap.values()).sort((a, b) => cmp(a.name, b.name) || cmp(a.id, b.id));

  const byAgent = new Map<string, { row: ExecutionRow; status: ShownStatus }[]>();
  for (const s of shown) {
    const list = byAgent.get(s.row.agent_id) || [];
    list.push(s);
    byAgent.set(s.row.agent_id, list);
  }

  const nodes: GraphNode[] = [{
    id: 'project', kind: 'project', label: projectName, aura: false, position: { x: 0, y: 0 }, tooltip: [projectName]
  }];
  const edges: GraphEdge[] = [];

  const n = sortedAgents.length;
  const R = Math.max(260, (70 * n) / Math.PI);
  sortedAgents.forEach((a, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    const pos = { x: R * Math.cos(angle), y: R * Math.sin(angle) };
    const list = (byAgent.get(a.id) || []).slice().sort((x, y) =>
      cmp(x.row.started_at || '', y.row.started_at || '') || cmp(x.row._id, y.row._id));
    const aura = list.some(s => s.status === 'failed' || (s.row.failure_conditions || 0) > 0);
    const agentNodeId = 'agent:' + a.id;
    nodes.push({
      id: agentNodeId, kind: 'agent', label: a.name, agentId: a.id, aura, idle: list.length === 0,
      position: pos, tooltip: [a.name]
    });
    edges.push({ id: 'project->' + agentNodeId, source: 'project', target: agentNodeId, animated: false });

    const k = list.length;
    const r = 46 + 6 * Math.max(0, k - 8);
    list.forEach((s, j) => {
      const ang = (2 * Math.PI * j) / k;
      const execId = 'exec:' + s.row._id;
      nodes.push({
        id: execId, kind: 'execution', label: s.row._id.substring(0, 8), status: s.status,
        agentId: a.id, executionId: s.row._id, aura: s.status === 'failed',
        position: { x: pos.x + r * Math.cos(ang), y: pos.y + r * Math.sin(ang) },
        tooltip: tooltipFor(s.row, s.status)
      });
      edges.push({ id: agentNodeId + '->' + execId, source: agentNodeId, target: execId, animated: s.status === 'running' });
    });
  });

  return { nodes, edges, counts };
}
