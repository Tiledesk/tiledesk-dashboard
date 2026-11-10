import { ExecutionRow } from '../executions.models';
import { AGENT_RING_RMAX, agentFootprint, buildExecutionGraph, fanOffsets, FAILED_WINDOW_MS, MAX_LIVE, MAX_PER_AGENT } from './execution-graph.model';

const NOW = Date.parse('2026-11-10T12:00:00.000Z');

function row(p: Partial<ExecutionRow> & { _id: string }): ExecutionRow {
  return {
    agent_id: 'a1', agent_name: 'Agent 1', status: 'running', end_reason: null, trigger: { type: 'message' },
    started_at: new Date(NOW - 60000).toISOString(), duration_ms: null, steps_count: 2, failure_conditions: 0,
    vars_changed: 0, trace_complete: null, test: false, ...p
  } as ExecutionRow;
}
const agents = (n: number) => Array.from({ length: n }, (_, i) => ({ id: 'a' + (i + 1), name: 'Agent ' + (i + 1) }));
const dist = (p: { x: number; y: number }, q = { x: 0, y: 0 }) => Math.hypot(p.x - q.x, p.y - q.y);

describe('buildExecutionGraph', () => {
  it('project node at the centre and one node per agent on the ring', () => {
    const g = buildExecutionGraph({ projectName: 'P', agents: agents(3), live: [], failed: [], now: NOW });
    expect(g.nodes.length).toBe(4);
    const project = g.nodes.find(n => n.kind === 'project');
    expect(project.position).toEqual({ x: 0, y: 0 });
    g.nodes.filter(n => n.kind === 'agent').forEach(n => expect(Math.abs(dist(n.position) - 170)).toBeLessThan(0.5));
    expect(g.edges.filter(e => e.source === 'project').length).toBe(3);
  });

  it('live executions attach to their agent with their status', () => {
    const g = buildExecutionGraph({ projectName: 'P', agents: agents(2), live: [row({ _id: 'e1', status: 'waiting' })], failed: [], now: NOW });
    const e = g.nodes.find(n => n.id === 'exec:e1');
    expect(e.kind).toBe('execution');
    expect(e.status).toBe('waiting');
    expect(e.agentId).toBe('a1');
    expect(g.edges.some(x => x.source === 'agent:a1' && x.target === 'exec:e1')).toBe(true);
    expect(e.tooltip).toEqual({ kind: 'execution', status: 'waiting', startedAt: new Date(NOW - 60000).toISOString(), trigger: 'message', steps: 2 });
  });

  it('failed older than 15 minutes is dropped, within 15 minutes is kept', () => {
    const mk = (id: string, endedAgo: number) => row({
      _id: id, status: 'failed', duration_ms: 10000, started_at: new Date(NOW - endedAgo - 10000).toISOString()
    });
    const g = buildExecutionGraph({
      projectName: 'P', agents: agents(1), live: [], now: NOW,
      failed: [mk('in', FAILED_WINDOW_MS - 60000), mk('out', FAILED_WINDOW_MS + 60000)]
    });
    expect(g.nodes.some(n => n.id === 'exec:in')).toBe(true);
    expect(g.nodes.some(n => n.id === 'exec:out')).toBe(false);
    expect(g.counts.failed).toBe(1);
  });

  it('agent aura (red) when a shown execution failed; warn (amber) for failure_conditions > 0 without a failure', () => {
    const failed = (id: string, agent: string) =>
      row({ _id: id, agent_id: agent, status: 'failed', duration_ms: 1000, started_at: new Date(NOW - 5000).toISOString() });
    const g = buildExecutionGraph({
      projectName: 'P', agents: agents(4), now: NOW,
      live: [row({ _id: 'e1', agent_id: 'a2', failure_conditions: 1 }), row({ _id: 'e3', agent_id: 'a2', status: 'waiting', failure_conditions: 2 }),
        row({ _id: 'e4', agent_id: 'a4', failure_conditions: 1 })],
      failed: [failed('e2', 'a1'), failed('e5', 'a4')]
    });
    const node = (id: string) => g.nodes.find(n => n.id === id);
    expect(node('agent:a1').aura).toBe(true);
    expect(node('agent:a1').warn).toBe(false);
    expect(node('agent:a2').aura).toBe(false);
    expect(node('agent:a2').warn).toBe(true);
    expect(node('agent:a3').aura).toBe(false);
    expect(node('agent:a3').warn).toBe(false);
    expect(node('agent:a4').aura).toBe(true);     // a failure wins over the error branch
    expect(node('agent:a4').warn).toBe(false);
    expect(node('exec:e2').aura).toBe(true);
    expect(node('exec:e1').aura).toBe(false);
    // the agent tooltip carries the error-branch count only when there is one
    expect(node('agent:a2').tooltip).toEqual({ kind: 'text', text: 'Agent 2', errorBranches: 3 });
    expect(node('agent:a4').tooltip).toEqual({ kind: 'text', text: 'Agent 4', errorBranches: 1 });
    expect(node('agent:a3').tooltip).toEqual({ kind: 'text', text: 'Agent 3' });
    expect(g.counts).toEqual({ running: 2, waiting: 1, stopping: 0, failed: 2, truncated: false });
  });

  it('idle agent when nothing is shown', () => {
    const g = buildExecutionGraph({ projectName: 'P', agents: agents(2), live: [row({ _id: 'e1' })], failed: [], now: NOW });
    expect(g.nodes.find(n => n.id === 'agent:a1').idle).toBe(false);
    expect(g.nodes.find(n => n.id === 'agent:a2').idle).toBe(true);
  });

  it('unknown agent gets a node from agent_name while the agents list is empty', () => {
    const g = buildExecutionGraph({
      projectName: 'P', agents: [], failed: [], now: NOW,
      live: [row({ _id: 'e1', agent_id: 'zzzzzzzzzzzz', agent_name: 'Gone' }), row({ _id: 'e2', agent_id: 'abcdefghijkl', agent_name: null })]
    });
    expect(g.nodes.find(n => n.id === 'agent:zzzzzzzzzzzz').label).toBe('Gone');
    expect(g.nodes.find(n => n.id === 'agent:abcdefghijkl').label).toBe('abcdefgh');
    expect(g.edges.some(e => e.source === 'project' && e.target === 'agent:abcdefghijkl')).toBe(true);
  });

  it('positions are stable across refreshes while no agent changes bucket', () => {
    const live = [row({ _id: 'e1' }), row({ _id: 'e2', started_at: new Date(NOW - 30000).toISOString() }), row({ _id: 'e4', agent_id: 'a3' })];
    const g1 = buildExecutionGraph({ projectName: 'P', agents: agents(4), live, failed: [], now: NOW });
    const g2 = buildExecutionGraph({ projectName: 'P', agents: agents(4), live: [...live, row({ _id: 'e3', agent_id: 'a3' })], failed: [], now: NOW + 5000 });
    // a3 goes from 1 to 2 shown (same bucket): only a3's own fan is redrawn
    g1.nodes.filter(n => !(n.kind === 'execution' && n.agentId === 'a3'))
      .forEach(n => expect(g2.nodes.find(m => m.id === n.id).position).toEqual(n.position, n.id));
  });

  it('running edges are animated, others are not', () => {
    const g = buildExecutionGraph({
      projectName: 'P', agents: agents(1), failed: [], now: NOW,
      live: [row({ _id: 'r' }), row({ _id: 'w', status: 'waiting' }), row({ _id: 's', status: 'stopping' })]
    });
    const anim = (id: string) => g.edges.find(e => e.target === id).animated;
    expect(anim('exec:r')).toBe(true);
    expect(anim('exec:w')).toBe(false);
    expect(anim('exec:s')).toBe(false);
    expect(g.edges.find(e => e.target === 'agent:a1').animated).toBe(false);
  });

  it('more than 300 live on one agent: draws the cap plus one overflow node, counts.truncated true', () => {
    const live = Array.from({ length: MAX_LIVE + 20 }, (_, i) =>
      row({ _id: 'e' + String(i).padStart(4, '0'), status: i % 2 ? 'waiting' : 'running' }));
    const g = buildExecutionGraph({ projectName: 'P', agents: agents(1), live, failed: [], now: NOW });
    expect(g.nodes.filter(n => n.kind === 'execution').length).toBe(MAX_PER_AGENT);
    expect(g.nodes.find(n => n.id === 'more:a1').label).toBe('+' + (MAX_LIVE + 20 - MAX_PER_AGENT));
    expect(g.counts.truncated).toBe(true);
    expect(g.counts.running + g.counts.waiting).toBe(MAX_LIVE + 20);
  });

  it('caps an agent at 12 by priority, with one +N overflow node and the aura from all rows', () => {
    const waiting = Array.from({ length: 30 }, (_, i) =>
      row({ _id: 'w' + String(i).padStart(2, '0'), status: 'waiting', started_at: new Date(NOW - 600000 + i * 1000).toISOString() }));
    const g = buildExecutionGraph({
      projectName: 'P', agents: agents(3), now: NOW,
      live: [...waiting, row({ _id: 'run', status: 'running', started_at: new Date(NOW - 900000).toISOString() })],
      failed: [row({ _id: 'bad', status: 'failed', duration_ms: 1000, started_at: new Date(NOW - 850000).toISOString() })]
    });
    const execs = g.nodes.filter(n => n.kind === 'execution' && n.agentId === 'a1');
    expect(MAX_PER_AGENT).toBe(12);
    expect(execs.length).toBe(12);
    expect(execs.some(n => n.id === 'exec:run')).toBe(true);
    expect(execs.some(n => n.id === 'exec:bad')).toBe(true);
    // newest first within a status: the 10 newest waiting are drawn
    const drawnWaiting = execs.filter(n => n.status === 'waiting').map(n => n.executionId).sort();
    expect(drawnWaiting).toEqual(Array.from({ length: 10 }, (_, i) => 'w' + (20 + i)));
    const more = g.nodes.filter(n => n.kind === 'more');
    expect(more.length).toBe(1);
    expect(more[0].id).toBe('more:a1');
    expect(more[0].agentId).toBe('a1');
    expect(more[0].label).toBe('+20');
    expect(more[0].tooltip).toEqual({ kind: 'more', hidden: { running: 0, waiting: 20, stopping: 0, failed: 0 } });
    expect(g.edges.some(e => e.source === 'agent:a1' && e.target === 'more:a1')).toBe(true);
    expect(g.nodes.find(n => n.id === 'agent:a1').aura).toBe(true);
    expect(g.counts.waiting).toBe(30);
    expect(g.counts.running).toBe(1);
    expect(g.counts.failed).toBe(1);
  });

  it('priority is failed > stopping > running > waiting', () => {
    const mk = (prefix: string, status: string, n: number) => Array.from({ length: n }, (_, i) => row({ _id: prefix + i, status: status as any }));
    const g = buildExecutionGraph({
      projectName: 'P', agents: agents(1), now: NOW,
      live: [...mk('w', 'waiting', 5), ...mk('r', 'running', 5), ...mk('s', 'stopping', 5)],
      failed: mk('f', 'failed', 0)
    });
    const drawn = g.nodes.filter(n => n.kind === 'execution');
    expect(drawn.filter(n => n.status === 'stopping').length).toBe(5);
    expect(drawn.filter(n => n.status === 'running').length).toBe(5);
    expect(drawn.filter(n => n.status === 'waiting').length).toBe(2);
    expect(g.nodes.find(n => n.id === 'more:a1').tooltip).toEqual({ kind: 'more', hidden: { running: 0, waiting: 3, stopping: 0, failed: 0 } });
  });

  it('a capped-out live row with failure_conditions still gives the agent its warn outline', () => {
    const live = Array.from({ length: 13 }, (_, i) =>
      row({ _id: 'w' + String(i).padStart(2, '0'), status: 'waiting', started_at: new Date(NOW - 600000 + i * 1000).toISOString(),
        failure_conditions: i === 0 ? 2 : 0 }));
    const g = buildExecutionGraph({ projectName: 'P', agents: agents(1), live, failed: [], now: NOW });
    expect(g.nodes.some(n => n.id === 'exec:w00')).toBe(false);
    expect(g.nodes.find(n => n.id === 'agent:a1').aura).toBe(false);
    expect(g.nodes.find(n => n.id === 'agent:a1').warn).toBe(true);
  });

  it('no overflow node at or under the cap', () => {
    const live = Array.from({ length: MAX_PER_AGENT }, (_, i) => row({ _id: 'e' + i, status: 'waiting' }));
    const g = buildExecutionGraph({ projectName: 'P', agents: agents(1), live, failed: [], now: NOW });
    expect(g.nodes.filter(n => n.kind === 'execution').length).toBe(MAX_PER_AGENT);
    expect(g.nodes.some(n => n.kind === 'more')).toBe(false);
  });

  it('agent footprints are bucketed by shown nodes', () => {
    expect(AGENT_RING_RMAX).toBe(74 + 6 * (MAX_PER_AGENT - 8 + 1));
    expect([0, 1, 4, 5, 8, 9, 13].map(agentFootprint)).toEqual([60, 90, 90, 98, 98, AGENT_RING_RMAX + 20, AGENT_RING_RMAX + 20]);
  });

  it('agent ring is sized by the footprints: max(170, sum(2 f + 24) / 2pi), angular width proportional to the footprint', () => {
    [1, 3, 8, 13, 30].forEach(n => {
      const g = buildExecutionGraph({ projectName: 'P', agents: agents(n), live: [], failed: [], now: NOW });
      const want = Math.max(170, n * (2 * 60 + 24) / (2 * Math.PI));
      g.nodes.filter(x => x.kind === 'agent').forEach(x => expect(Math.abs(dist(x.position) - want)).toBeLessThan(0.5, 'n=' + n));
    });
    // 13 agents, one at the cap and one with 3 shown: the ring follows the sum, the busy agent gets a wider slice
    const live = [
      ...Array.from({ length: MAX_PER_AGENT + 5 }, (_, i) => row({ _id: 'c' + String(i).padStart(2, '0'), agent_id: 'a1', status: 'waiting' })),
      ...[0, 1, 2].map(i => row({ _id: 't' + i, agent_id: 'a2', status: 'waiting' })),
    ];
    const list = Array.from({ length: 13 }, (_, i) => ({ id: 'a' + (i + 1), name: 'Agent ' + String(i + 1).padStart(2, '0') }));
    const g = buildExecutionGraph({ projectName: 'P', agents: list, live, failed: [], now: NOW });
    const sum = 2 * (AGENT_RING_RMAX + 20) + 24 + 2 * 90 + 24 + 11 * (2 * 60 + 24);
    const R = sum / (2 * Math.PI);
    const pos = (id: string) => g.nodes.find(x => x.id === 'agent:' + id).position;
    ['a1', 'a2', 'a3', 'a13'].forEach(id => expect(Math.abs(dist(pos(id)) - R)).toBeLessThan(0.5, id));
    const arc = (p: any, q: any) => { let d = Math.abs(Math.atan2(p.y, p.x) - Math.atan2(q.y, q.x)); if (d > Math.PI) { d = 2 * Math.PI - d; } return d * R; };
    expect(arc(pos('a1'), pos('a2'))).toBeCloseTo((AGENT_RING_RMAX + 20) + 90 + 24, 3);
    expect(arc(pos('a3'), pos('a4'))).toBeCloseTo(60 + 60 + 24, 3);
  });

  it('agents move only when a bucket changes: 3 -> 4 shown moves no agent, 4 -> 5 does', () => {
    const mk = (k: number) => buildExecutionGraph({
      projectName: 'P', agents: agents(6), failed: [], now: NOW,
      live: Array.from({ length: k }, (_, i) => row({ _id: 'e' + i, agent_id: 'a2', status: 'waiting' })),
    });
    const agentPos = (g: any) => g.nodes.filter((x: any) => x.kind !== 'execution' && x.kind !== 'more').map((x: any) => ({ id: x.id, p: x.position }));
    expect(agentPos(mk(4))).toEqual(agentPos(mk(3)));
    expect(agentPos(mk(5))).not.toEqual(agentPos(mk(4)));
  });

  it('neighbouring agents at any buckets keep their fans a chip (26 px) plus 10 px apart', () => {
    const ks = [0, 1, 4, 5, 8, 9, 13];
    for (let n = 2; n <= 20; n++) {
      for (const k1 of ks) {
        for (const k2 of ks) {
          for (const rest of [0, 13]) {
            // zero-padded names keep a1 and a2 next to each other on the ring; a3 follows a2
            const list = Array.from({ length: n }, (_, i) => ({ id: 'a' + (i + 1), name: 'Agent ' + String(i + 1).padStart(2, '0') }));
            const want: { [id: string]: number } = {};
            list.forEach((a, i) => { want[a.id] = i === 0 ? k1 : i === 1 ? k2 : rest; });
            const live: ExecutionRow[] = [];
            // k nodes shown: k executions up to the cap, then 12 + one "+N"
            list.forEach(a => {
              const k = want[a.id];
              const rows = k > MAX_PER_AGENT ? MAX_PER_AGENT + 3 : k;
              for (let i = 0; i < rows; i++) { live.push(row({ _id: a.id + '-' + String(i).padStart(2, '0'), agent_id: a.id, status: 'waiting' })); }
            });
            const g = buildExecutionGraph({ projectName: 'P', agents: list, live, failed: [], now: NOW });
            const fan = (id: string) => g.nodes.filter(x => (x.kind === 'execution' || x.kind === 'more') && x.agentId === id);
            const pairs = n > 2 ? [['a1', 'a2'], ['a2', 'a3']] : [['a1', 'a2']];
            pairs.forEach(([x, y]) => {
              let min = Infinity;
              fan(x).forEach(p => fan(y).forEach(q => { min = Math.min(min, dist(p.position, q.position)); }));
              expect(min).toBeGreaterThanOrEqual(26 + 10, `n=${n} ${x}:${want[x]} ${y}:${want[y]}`);
            });
          }
        }
      }
    }
  });

  it('executions sit 74 px from their agent, fanned out on the side away from the project', () => {
    [1, 3, 8, 13].forEach(k => {
      const live = Array.from({ length: k }, (_, i) => row({ _id: 'e' + String(i).padStart(2, '0'), status: 'waiting' }));
      const g = buildExecutionGraph({ projectName: 'P', agents: agents(4), live, failed: [], now: NOW });
      const owner = g.nodes.find(n => n.id === 'agent:a1');
      const out = Math.atan2(owner.position.y, owner.position.x);
      const shown = g.nodes.filter(n => n.kind === 'execution' || n.kind === 'more');
      const r = 74 + 6 * Math.max(0, shown.length - 8);
      shown.forEach(x => {
        expect(Math.abs(dist(x.position, owner.position) - r)).toBeLessThan(0.5, 'k=' + k);
        const a = Math.atan2(x.position.y - owner.position.y, x.position.x - owner.position.x);
        let d = Math.abs(a - out) % (2 * Math.PI);
        if (d > Math.PI) { d = 2 * Math.PI - d; }
        expect(d).toBeLessThan(Math.PI * 0.75, 'k=' + k + ' ' + x.id);   // never on the project side
      });
      if (k === 1) { expect(dist(shown[0].position)).toBeCloseTo(dist(owner.position) + 74, 3); }
    });
  });

  it('chips keep clear of the agent name: at every ring angle (15 deg steps) and k = 1..13', () => {
    // the label: 160 x 18 px, 6 px under the 56 px badge; a chip centre must stay out of it grown by a chip half (13 px)
    const box = { x1: -80 - 13, x2: 80 + 13, y1: 28 + 6 - 13, y2: 28 + 6 + 18 + 13 };
    for (let deg = 0; deg < 360; deg += 15) {
      const theta = deg * Math.PI / 180;
      for (let k = 1; k <= 13; k++) {
        const { r, offsets } = fanOffsets(theta, k);
        expect(offsets.length).toBe(k);
        const pts = offsets.map(o => ({ x: r * Math.cos(theta + o), y: r * Math.sin(theta + o) }));
        pts.forEach(p => {
          const inside = p.x >= box.x1 && p.x <= box.x2 && p.y >= box.y1 && p.y <= box.y2;
          expect(inside).toBe(false, `deg=${deg} k=${k} at ${Math.round(p.x)},${Math.round(p.y)}`);
        });
        // never towards the project, chips of a fan never on top of each other
        offsets.forEach(o => expect(Math.abs(o)).toBeLessThan(Math.PI * 0.75, `deg=${deg} k=${k}`));
        for (let i = 1; i < pts.length; i++) {
          expect(dist(pts[i], pts[i - 1])).toBeGreaterThanOrEqual(30.8, `deg=${deg} k=${k}`);
        }
      }
    }
  });

  it('a fan with nothing in the way keeps the plain outward fan', () => {
    const { r, offsets } = fanOffsets(-Math.PI / 2, 3);   // agent straight above the project
    expect(r).toBe(74);
    expect(offsets.map(o => +o.toFixed(6))).toEqual([-0.42, 0, 0.42]);
  });

  it('agent is active only when something is running or stopping', () => {
    const g = buildExecutionGraph({
      projectName: 'P', agents: agents(4), failed: [], now: NOW,
      live: [row({ _id: 'w', agent_id: 'a1', status: 'waiting' }), row({ _id: 'r', agent_id: 'a2' }), row({ _id: 's', agent_id: 'a3', status: 'stopping' })]
    });
    const agent = (id: string) => g.nodes.find(n => n.id === 'agent:' + id);
    expect(agent('a1').active).toBe(false);
    expect(agent('a1').idle).toBe(false);
    expect(agent('a2').active).toBe(true);
    expect(agent('a3').active).toBe(true);
    expect(agent('a4').active).toBe(false);
    expect(agent('a4').idle).toBe(true);
  });

  it('with a non-empty agents list, rows of other agents are neither drawn nor counted', () => {
    const g = buildExecutionGraph({
      projectName: 'P', agents: agents(2), now: NOW,
      live: [row({ _id: 'mine' }), row({ _id: 'other', agent_id: 'zz', agent_name: 'Automation' }),
        row({ _id: 'otherw', agent_id: 'zz', status: 'waiting' })],
      failed: [row({ _id: 'otherf', agent_id: 'zz', status: 'failed', duration_ms: 1000, started_at: new Date(NOW - 5000).toISOString() })]
    });
    expect(g.nodes.some(n => n.id === 'agent:zz')).toBe(false);
    expect(g.nodes.some(n => n.id === 'exec:other' || n.id === 'exec:otherw' || n.id === 'exec:otherf')).toBe(false);
    expect(g.nodes.filter(n => n.kind === 'agent').length).toBe(2);
    expect(g.counts).toEqual({ running: 1, waiting: 0, stopping: 0, failed: 0, truncated: false });
  });
});
