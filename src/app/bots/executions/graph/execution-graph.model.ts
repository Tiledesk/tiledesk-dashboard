import { ExecutionRow } from '../executions.models';

export interface GraphAgent { id: string; name: string; }
export type GraphNodeKind = 'project' | 'agent' | 'execution' | 'more';
export type ShownStatus = 'running' | 'waiting' | 'stopping' | 'failed';
export type GraphStatusCounts = { [S in ShownStatus]: number };
/** Tooltip data; the component translates and formats it. */
export type GraphTooltip =
  | { kind: 'text'; text: string; errorBranches?: number }
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
  warn?: boolean;              // amber outline: an error branch taken, no failure
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

/** Angle between neighbouring executions of a fan, and the widest fan (the side facing the project stays clear). */
const FAN_STEP = 0.42;
const FAN_MAX = 4.5;

function execRingRadius(k: number): number {
  return 74 + 6 * Math.max(0, k - 8);
}

/** The agent's name label relative to the agent centre (160 x 18 px, 6 px under the 56 px badge), grown by a chip half and 2 px. */
const LABEL_KEEP_OUT = { x: 80 + 13 + 2, top: 28 + 6 - 13 - 2, bottom: 28 + 6 + 18 + 13 + 2 };
/** Farthest a chip may sit from the outward direction (rad): the side facing the project stays clear. */
const FAN_LIMIT = 2.35;
/** Closest two chips of a fan may get (centre to centre) when the fan has to squeeze round the label. */
const MIN_CHIP_GAP = 31;
const FAN_SEARCH = Math.PI / 360;

/**
 * Chip angles of a fan, as offsets from the agent's outward angle `theta` (screen coordinates, y down).
 * The plain fan (FAN_STEP apart, centred on `theta`) when it misses the agent's name; otherwise chips are
 * placed outwards from the centre, alternating sides, each skipping past the label, and the step shrinks
 * (down to MIN_CHIP_GAP) until all k fit within FAN_LIMIT. Depends on theta and k only, so it is stable.
 */
export function fanOffsets(theta: number, k: number): { r: number; offsets: number[] } {
  const r = execRingRadius(k);
  const onLabel = (o: number) => {
    const x = r * Math.cos(theta + o), y = r * Math.sin(theta + o);
    return Math.abs(x) <= LABEL_KEEP_OUT.x && y >= LABEL_KEEP_OUT.top && y <= LABEL_KEEP_OUT.bottom;
  };
  const free = (o: number) => Math.abs(o) <= FAN_LIMIT && !onLabel(o);
  const place = (step: number): number[] | null => {
    const offs: number[] = [];
    let right: number, left: number;
    if (k % 2) {
      let centre: number | null = null;
      for (let d = 0; d <= FAN_LIMIT && centre === null; d += FAN_SEARCH) {
        if (free(d)) { centre = d; } else if (free(-d)) { centre = -d; }
      }
      if (centre === null) { return null; }
      offs.push(centre);
      right = left = centre;
    } else {
      right = -step / 2;
      left = step / 2;
    }
    const open = { right: true, left: true };
    while (offs.length < k) {
      if (!open.right && !open.left) { return null; }
      for (const side of [1, -1]) {
        const key = side > 0 ? 'right' : 'left';
        if (offs.length >= k || !open[key]) { continue; }
        let o = side > 0 ? right + step : left - step;
        while (Math.abs(o) <= FAN_LIMIT && !free(o)) { o += side * FAN_SEARCH; }
        if (Math.abs(o) > FAN_LIMIT) { open[key] = false; continue; }
        offs.push(o);
        if (side > 0) { right = o; } else { left = o; }
      }
    }
    return offs.sort((x, y) => x - y);
  };
  const plain = k > 1 ? Math.min(FAN_STEP, FAN_MAX / (k - 1)) : FAN_STEP;
  const minStep = 2 * Math.asin(MIN_CHIP_GAP / 2 / r);
  for (let step = plain; ; step = Math.max(minStep, step * 0.92)) {
    const offs = place(step);
    if (offs) { return { r, offsets: offs }; }
    if (step <= minStep) { break; }
  }
  // cannot happen for k <= MAX_PER_AGENT + 1 (see the spec); keep the plain fan rather than drop chips
  const step = k > 1 ? Math.min(FAN_STEP, FAN_MAX / (k - 1)) : 0;
  return { r, offsets: Array.from({ length: k }, (_, j) => (j - (k - 1) / 2) * step) };
}

/** Gap between neighbouring agents' footprints on the ring, and the smallest ring. */
const AGENT_GAP = 24;
const RING_MIN = 170;

/**
 * Space an agent takes on the ring (a radius), bucketed by the nodes it shows (executions plus "+N"),
 * so that a refresh moves agents only when a bucket changes. The cap bucket is wider than the fan
 * radius: a full fan curls round the agent's sides, towards its neighbours.
 */
export function agentFootprint(shown: number): number {
  if (shown <= 0) return 60;          // badge and label
  if (shown <= 4) return 74 + 16;
  if (shown <= 8) return 98;
  return AGENT_RING_RMAX + 20;
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

  type Placed = { agent: GraphAgent; all: Shown[]; drawn: Shown[]; hidden: Shown[]; k: number; width: number };
  const placed: Placed[] = sortedAgents.map(a => {
    const all = byAgent.get(a.id) || [];
    const picked = all.slice().sort((x, y) =>
      PRIORITY[x.status] - PRIORITY[y.status] || cmp(y.row.started_at || '', x.row.started_at || '') || cmp(y.row._id, x.row._id));
    const drawn = picked.slice(0, MAX_PER_AGENT).sort((x, y) =>
      cmp(x.row.started_at || '', y.row.started_at || '') || cmp(x.row._id, y.row._id));
    const hidden = picked.slice(MAX_PER_AGENT);
    const k = drawn.length + (hidden.length ? 1 : 0);
    return { agent: a, all, drawn, hidden, k, width: 2 * agentFootprint(k) + AGENT_GAP };
  });

  // The ring is sized by the agents' footprints, and each agent gets a slice of it proportional to its
  // footprint (sorted order). Footprints are bucketed, so agents move only when an agent's bucket
  // changes or agents are added or removed; within a bucket, only the agent's own fan is redrawn.
  const total = placed.reduce((acc, p) => acc + p.width, 0);
  const R = Math.max(RING_MIN, total / (2 * Math.PI));
  let along = 0;
  placed.forEach(({ agent: a, all, drawn, hidden, k, width }) => {
    const angle = (2 * Math.PI * (along + width / 2)) / total - Math.PI / 2;
    along += width;
    const pos = { x: R * Math.cos(angle), y: R * Math.sin(angle) };
    // aura, warn and activity come from all of the agent's rows, drawn or not:
    // aura for a failure, warn (amber) for an error branch taken without a failure
    const aura = all.some(s => s.status === 'failed');
    const errorBranches = all.reduce((acc, s) => acc + Math.max(0, s.row.failure_conditions || 0), 0);
    const warn = !aura && errorBranches > 0;
    const active = all.some(s => s.status === 'running' || s.status === 'stopping');
    const agentNodeId = 'agent:' + a.id;
    nodes.push({
      id: agentNodeId, kind: 'agent', label: a.name, agentId: a.id, aura, warn, idle: all.length === 0, active,
      position: pos, tooltip: errorBranches > 0 ? { kind: 'text', text: a.name, errorBranches } : { kind: 'text', text: a.name }
    });
    edges.push({ id: 'project->' + agentNodeId, source: 'project', target: agentNodeId, animated: false });

    // a fan centred on the agent's own angle (the side facing away from the project), clear of the agent's name
    const { r, offsets } = fanOffsets(angle, k);
    const at = (j: number) => {
      const ang = angle + offsets[j];
      return { x: pos.x + r * Math.cos(ang), y: pos.y + r * Math.sin(ang) };
    };
    drawn.forEach((s, j) => {
      const execId = 'exec:' + s.row._id;
      nodes.push({
        id: execId, kind: 'execution', label: s.row._id.replace(/-/g, '').slice(-8), status: s.status,
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
