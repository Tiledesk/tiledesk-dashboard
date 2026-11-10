import { ExecutionRow } from '../executions.models';

export interface GraphAgent { id: string; name: string; }
export type GraphNodeKind = 'project' | 'agent' | 'execution' | 'more';
export type ShownStatus = 'running' | 'waiting' | 'stopping' | 'failed';
export type GraphStatusCounts = { [S in ShownStatus]: number };
/** Tooltip data; the component translates and formats it. */
export type GraphTooltip =
  | { kind: 'text'; text: string }
  | { kind: 'execution'; status: ShownStatus; startedAt: string | null; trigger: string | null; steps: number }
  | { kind: 'more'; hidden: GraphStatusCounts };
export interface GraphNode {
  id: string;                  // 'project' | 'agent:<agentId>' | 'exec:<executionId>' | 'more:<agentId>'
  kind: GraphNodeKind;
  label: string;
  status?: ShownStatus;
  agentId?: string;
  executionId?: string;
  aura: boolean;               // red aura
  idle?: boolean;              // agent with nothing shown
  active?: boolean;            // agent with something running or stopping
  position: { x: number; y: number };
  tooltip: GraphTooltip;
}
export interface GraphEdge { id: string; source: string; target: string; animated: boolean; }
export interface GraphCounts { running: number; waiting: number; stopping: number; failed: number; truncated: boolean; }
export interface GraphModel { nodes: GraphNode[]; edges: GraphEdge[]; counts: GraphCounts; }

export const FAILED_WINDOW_MS = 15 * 60 * 1000;
export const MAX_LIVE = 300;
/** Executions drawn per agent; the rest are summed up in one "+N" node. */
export const MAX_PER_AGENT = 12;
/** Radius of the largest execution ring around an agent (the cap plus the overflow node). */
export const AGENT_RING_RMAX = execRingRadius(MAX_PER_AGENT + 1);

/** Drawing priority: a problem first, waiting last. */
const PRIORITY: { [S in ShownStatus]: number } = { failed: 0, stopping: 1, running: 2, waiting: 3 };

function execRingRadius(k: number): number {
  return 46 + 6 * Math.max(0, k - 8);
}

function cmp(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function tooltipFor(r: ExecutionRow, status: ShownStatus): GraphTooltip {
  const trigger = r.trigger && (r.trigger.type || r.trigger.kind || r.trigger.name);
  return { kind: 'execution', status, startedAt: r.started_at || null, trigger: trigger || null, steps: r.steps_count ?? 0 };
}

export function buildExecutionGraph(input: {
  projectName: string; agents: GraphAgent[]; live: ExecutionRow[]; failed: ExecutionRow[]; now: number;
}): GraphModel {
  const { projectName, agents, now } = input;
  // with the page's own agents list, other agents' rows are neither drawn nor counted;
  // the unknown-agent fallback is only for a list that is not loaded yet
  const listed = new Set(agents.map(a => a.id));
  const keep = (r: ExecutionRow) => listed.size === 0 || listed.has(r.agent_id);
  const live = input.live.filter(keep);
  const failed = input.failed.filter(keep);

  const counts: GraphCounts = { running: 0, waiting: 0, stopping: 0, failed: 0, truncated: live.length > MAX_LIVE };
  for (const r of live) {
    if (r.status === 'running') counts.running++;
    else if (r.status === 'waiting') counts.waiting++;
    else if (r.status === 'stopping') counts.stopping++;
  }

  type Shown = { row: ExecutionRow; status: ShownStatus };
  const shown: Shown[] = [];
  const seen = new Set<string>();
  for (const r of live) {
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
    if (!agentMap.has(id)) agentMap.set(id, { id, name: s.row.agent_name || String(id || '').substring(0, 8) });
  }
  const sortedAgents = Array.from(agentMap.values()).sort((a, b) => cmp(a.name, b.name) || cmp(a.id, b.id));

  const byAgent = new Map<string, Shown[]>();
  for (const s of shown) {
    const list = byAgent.get(s.row.agent_id) || [];
    list.push(s);
    byAgent.set(s.row.agent_id, list);
  }

  const nodes: GraphNode[] = [{
    id: 'project', kind: 'project', label: projectName, aura: false, position: { x: 0, y: 0 },
    tooltip: { kind: 'text', text: projectName }
  }];
  const edges: GraphEdge[] = [];

  // the agent ring depends on the agent count only, so agents keep their place whatever runs
  const n = sortedAgents.length;
  const R = Math.max(260, (n * (2 * AGENT_RING_RMAX + 20)) / (2 * Math.PI));
  sortedAgents.forEach((a, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    const pos = { x: R * Math.cos(angle), y: R * Math.sin(angle) };
    const all = byAgent.get(a.id) || [];
    // aura and activity come from all of the agent's rows, drawn or not
    const aura = all.some(s => s.status === 'failed' || (s.row.failure_conditions || 0) > 0);
    const active = all.some(s => s.status === 'running' || s.status === 'stopping');
    const picked = all.slice().sort((x, y) =>
      PRIORITY[x.status] - PRIORITY[y.status] || cmp(y.row.started_at || '', x.row.started_at || '') || cmp(y.row._id, x.row._id));
    const drawn = picked.slice(0, MAX_PER_AGENT).sort((x, y) =>
      cmp(x.row.started_at || '', y.row.started_at || '') || cmp(x.row._id, y.row._id));
    const hidden = picked.slice(MAX_PER_AGENT);
    const agentNodeId = 'agent:' + a.id;
    nodes.push({
      id: agentNodeId, kind: 'agent', label: a.name, agentId: a.id, aura, idle: all.length === 0, active,
      position: pos, tooltip: { kind: 'text', text: a.name }
    });
    edges.push({ id: 'project->' + agentNodeId, source: 'project', target: agentNodeId, animated: false });

    const k = drawn.length + (hidden.length ? 1 : 0);
    const r = execRingRadius(k);
    const at = (j: number) => {
      const ang = (2 * Math.PI * j) / k;
      return { x: pos.x + r * Math.cos(ang), y: pos.y + r * Math.sin(ang) };
    };
    drawn.forEach((s, j) => {
      const execId = 'exec:' + s.row._id;
      nodes.push({
        id: execId, kind: 'execution', label: s.row._id.substring(0, 8), status: s.status,
        agentId: a.id, executionId: s.row._id, aura: s.status === 'failed',
        position: at(j), tooltip: tooltipFor(s.row, s.status)
      });
      edges.push({ id: agentNodeId + '->' + execId, source: agentNodeId, target: execId, animated: s.status === 'running' });
    });
    if (hidden.length) {
      const counted: GraphStatusCounts = { running: 0, waiting: 0, stopping: 0, failed: 0 };
      hidden.forEach(s => counted[s.status]++);
      const moreId = 'more:' + a.id;
      nodes.push({
        id: moreId, kind: 'more', label: '+' + hidden.length, agentId: a.id, aura: false,
        position: at(k - 1), tooltip: { kind: 'more', hidden: counted }
      });
      edges.push({ id: agentNodeId + '->' + moreId, source: agentNodeId, target: moreId, animated: false });
    }
  });

  return { nodes, edges, counts };
}
