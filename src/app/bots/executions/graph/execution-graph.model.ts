import { AgentStatusCounts, ExecutionRow, ExecutionStats } from '../executions.models';

export interface GraphAgent { id: string; name: string; }
export type GraphNodeKind = 'project' | 'agent' | 'execution' | 'more';
export type ShownStatus = 'running' | 'waiting' | 'stopping' | 'stopped' | 'failed' | 'completed' | 'destroyed';
export const SHOWN_STATUSES: ShownStatus[] = ['running', 'waiting', 'stopping', 'stopped', 'failed', 'completed', 'destroyed'];
export type GraphStatusCounts = { [S in ShownStatus]: number };
/** An agent's colour, from the executions it has in view (see agentColor). */
export type AgentColor = 'red' | 'blue' | 'amber' | 'green' | 'gray';
export const AGENT_COLORS: AgentColor[] = ['red', 'blue', 'amber', 'green', 'gray'];
/** Tooltip data; the component translates and formats it. */
export type GraphTooltip =
  | { kind: 'text'; text: string; withErrors?: number }
  | { kind: 'execution'; status: ShownStatus; startedAt: string | null; trigger: string | null; steps: number }
  | { kind: 'more'; hidden: GraphStatusCounts };
export interface GraphNode {
  id: string;                  // 'project' | 'agent:<agentId>' | 'exec:<executionId>' | 'more:<agentId>'
  kind: GraphNodeKind;
  label: string;
  status?: ShownStatus;        // executions
  color?: AgentColor;          // agents
  agentId?: string;
  executionId?: string;
  position: { x: number; y: number };
  tooltip: GraphTooltip;
}
export interface GraphEdge { id: string; source: string; target: string; animated: boolean; }
export interface GraphModel { nodes: GraphNode[]; edges: GraphEdge[]; }

/** Executions drawn per agent; the rest are summed up in one "+N" node. */
export const MAX_PER_AGENT = 12;
/** Radius of the largest execution ring around an agent (the cap plus the overflow node). */
export const AGENT_RING_RMAX = execRingRadius(MAX_PER_AGENT + 1);

/**
 * The agent's colour, first match (spec 2026-11-13): red = a failure or an execution with errors
 * (failure_conditions > 0); blue = something running; amber = waiting, stopping or stopped (paused, not finished);
 * gray = only completed or destroyed, at least one destroyed; green = all completed. Null: nothing in view.
 */
export function agentColor(c: AgentStatusCounts): AgentColor | null {
  if (c.failed > 0 || c.failure_conditions > 0) return 'red';
  if (c.running > 0) return 'blue';
  if (c.waiting + c.stopping + c.stopped > 0) return 'amber';
  if (c.destroyed > 0) return 'gray';
  if (c.completed > 0) return 'green';
  return null;
}

const zeroCounts = (): AgentStatusCounts =>
  ({ running: 0, waiting: 0, stopping: 0, stopped: 0, failed: 0, completed: 0, destroyed: 0, failure_conditions: 0 });

const isShown = (s: string): s is ShownStatus => (SHOWN_STATUSES as string[]).indexOf(s) >= 0;

/** Drawing priority: a problem first, then the live runs, the finished ones last. */
const PRIORITY: { [S in ShownStatus]: number } = { failed: 0, stopping: 1, running: 2, waiting: 3, stopped: 4, completed: 5, destroyed: 6 };

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
  if (shown <= 0) return 60;          // badge and label (an agent in view always shows something)
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

/**
 * The graph of the view: the project, the agents with at least one execution in view, their executions.
 * `stats` (same view, exact) decides an agent's colour, error count and "+N" when given; otherwise the rows do.
 * With a non-empty agents list, other agents (deleted ones) are left out; the list also gives the names.
 */
export function buildExecutionGraph(input: {
  projectName: string; agents: GraphAgent[]; rows: ExecutionRow[]; stats?: ExecutionStats | null;
}): GraphModel {
  const { projectName, agents } = input;
  const listed = new Set(agents.map(a => a.id));
  const keep = (id: string) => listed.size === 0 || listed.has(id);

  type Shown = { row: ExecutionRow; status: ShownStatus };
  const byAgent = new Map<string, Shown[]>();
  const fromRows = new Map<string, AgentStatusCounts>();
  const names = new Map<string, string>();
  for (const r of input.rows) {
    if (!keep(r.agent_id) || !isShown(r.status)) continue;
    const list = byAgent.get(r.agent_id) || [];
    list.push({ row: r, status: r.status });
    byAgent.set(r.agent_id, list);
    const c = fromRows.get(r.agent_id) || zeroCounts();
    c[r.status]++;
    if ((r.failure_conditions || 0) > 0) c.failure_conditions++;
    fromRows.set(r.agent_id, c);
    if (!names.has(r.agent_id)) names.set(r.agent_id, r.agent_name || String(r.agent_id || '').substring(0, 8));
  }
  const statsAgents = (input.stats && input.stats.agents) || {};
  const countsOf = (id: string): AgentStatusCounts =>
    Object.prototype.hasOwnProperty.call(statsAgents, id) ? { ...zeroCounts(), ...statsAgents[id] } : (fromRows.get(id) || zeroCounts());

  const inView = new Set<string>(byAgent.keys());
  Object.keys(statsAgents).forEach(id => { if (keep(id) && agentColor(countsOf(id))) inView.add(id); });
  const agentMap = new Map<string, GraphAgent>();
  for (const a of agents) if (inView.has(a.id)) agentMap.set(a.id, a);
  inView.forEach(id => { if (!agentMap.has(id)) agentMap.set(id, { id, name: names.get(id) || String(id || '').substring(0, 8) }); });
  const sortedAgents = Array.from(agentMap.values()).sort((a, b) => cmp(a.name, b.name) || cmp(a.id, b.id));

  const nodes: GraphNode[] = [{
    id: 'project', kind: 'project', label: projectName, position: { x: 0, y: 0 },
    tooltip: { kind: 'text', text: projectName }
  }];
  const edges: GraphEdge[] = [];

  type Placed = { agent: GraphAgent; counts: AgentStatusCounts; drawn: Shown[]; hidden: GraphStatusCounts; k: number; width: number };
  const placed: Placed[] = sortedAgents.map(a => {
    const all = byAgent.get(a.id) || [];
    const counts = countsOf(a.id);
    const picked = all.slice().sort((x, y) =>
      PRIORITY[x.status] - PRIORITY[y.status] || cmp(y.row.started_at || '', x.row.started_at || '') || cmp(y.row._id, x.row._id));
    const drawn = picked.slice(0, MAX_PER_AGENT).sort((x, y) =>
      cmp(x.row.started_at || '', y.row.started_at || '') || cmp(x.row._id, y.row._id));
    // not drawn = the agent's count per status (exact with stats) minus the drawn ones
    const hidden = {} as GraphStatusCounts;
    SHOWN_STATUSES.forEach(st => {
      const drawnOf = drawn.filter(d => d.status === st).length;
      hidden[st] = Math.max(0, Math.max(counts[st], all.filter(d => d.status === st).length) - drawnOf);
    });
    const hiddenTotal = SHOWN_STATUSES.reduce((acc, st) => acc + hidden[st], 0);
    const k = drawn.length + (hiddenTotal ? 1 : 0);
    return { agent: a, counts, drawn, hidden, k, width: 2 * agentFootprint(k) + AGENT_GAP };
  });

  // The ring is sized by the agents' footprints, and each agent gets a slice of it proportional to its
  // footprint (sorted order). Footprints are bucketed, so agents move only when an agent's bucket
  // changes or agents are added or removed; within a bucket, only the agent's own fan is redrawn.
  const total = placed.reduce((acc, p) => acc + p.width, 0);
  const R = Math.max(RING_MIN, total / (2 * Math.PI));
  let along = 0;
  placed.forEach(({ agent: a, counts, drawn, hidden, k, width }) => {
    const angle = (2 * Math.PI * (along + width / 2)) / total - Math.PI / 2;
    along += width;
    const pos = { x: R * Math.cos(angle), y: R * Math.sin(angle) };
    const agentNodeId = 'agent:' + a.id;
    nodes.push({
      id: agentNodeId, kind: 'agent', label: a.name, agentId: a.id, color: agentColor(counts) || 'gray', position: pos,
      tooltip: counts.failure_conditions > 0 ? { kind: 'text', text: a.name, withErrors: counts.failure_conditions } : { kind: 'text', text: a.name }
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
        agentId: a.id, executionId: s.row._id, position: at(j), tooltip: tooltipFor(s.row, s.status)
      });
      edges.push({ id: agentNodeId + '->' + execId, source: agentNodeId, target: execId, animated: s.status === 'running' });
    });
    const hiddenTotal = SHOWN_STATUSES.reduce((acc, st) => acc + hidden[st], 0);
    if (hiddenTotal) {
      const moreId = 'more:' + a.id;
      nodes.push({
        id: moreId, kind: 'more', label: '+' + hiddenTotal, agentId: a.id,
        position: at(k - 1), tooltip: { kind: 'more', hidden }
      });
      edges.push({ id: agentNodeId + '->' + moreId, source: agentNodeId, target: moreId, animated: false });
    }
  });

  return { nodes, edges };
}
