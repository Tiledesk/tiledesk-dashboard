import { ExecutionRow, ExecutionStats } from '../executions.models';
import { AGENT_RING_RMAX, agentColor, agentFootprint, buildExecutionGraph, fanOffsets, MAX_PER_AGENT } from './execution-graph.model';

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
const ZERO = { running: 0, waiting: 0, stopping: 0, stopped: 0, failed: 0, completed: 0, destroyed: 0 };
const counts = (c: any) => ({ ...ZERO, failure_conditions: 0, ...c });
function stats(agentsCounts: { [id: string]: any }): ExecutionStats {
  const agentsOut: any = {};
  const statuses: any = { ...ZERO };
  Object.keys(agentsCounts).forEach(id => {
    agentsOut[id] = counts(agentsCounts[id]);
    Object.keys(ZERO).forEach(s => statuses[s] += agentsOut[id][s]);
  });
  return { range: '24h', from: null, statuses, agents: agentsOut };
}
/** One completed row per agent: puts the agent in view with one chip. */
const oneEach = (ids: string[]) => ids.map(id => row({ _id: 'one-' + id, agent_id: id, status: 'completed' }));

describe('agentColor', () => {
  it('red: at least one failed', () => expect(agentColor(counts({ failed: 1 }))).toBe('red'));
  it('red: with errors (failure_conditions > 0), whatever the statuses', () => {
    expect(agentColor(counts({ completed: 3, failure_conditions: 1 }))).toBe('red');
  });
  it('blue: at least one running, no errors', () => expect(agentColor(counts({ running: 1 }))).toBe('blue'));
  it('amber: waiting, stopping or stopped, no errors', () => {
    expect(agentColor(counts({ waiting: 1 }))).toBe('amber');
    expect(agentColor(counts({ stopping: 1 }))).toBe('amber');
    expect(agentColor(counts({ stopped: 1 }))).toBe('amber');
  });
  it('green: all completed', () => expect(agentColor(counts({ completed: 4 }))).toBe('green'));
  it('gray: all completed or destroyed, at least one destroyed', () => {
    expect(agentColor(counts({ destroyed: 1 }))).toBe('gray');
    expect(agentColor(counts({ completed: 5, destroyed: 1 }))).toBe('gray');
  });
  it('nothing in view: no colour', () => expect(agentColor(counts({}))).toBeNull());

  describe('precedence', () => {
    it('failed beats running', () => expect(agentColor(counts({ failed: 1, running: 5 }))).toBe('red'));
    it('errors beat running', () => expect(agentColor(counts({ running: 2, failure_conditions: 1 }))).toBe('red'));
    it('errors beat waiting / stopped', () => expect(agentColor(counts({ waiting: 1, stopped: 1, failure_conditions: 1 }))).toBe('red'));
    it('errors beat destroyed', () => expect(agentColor(counts({ destroyed: 1, failure_conditions: 1 }))).toBe('red'));
    it('running beats waiting and stopped', () => expect(agentColor(counts({ running: 1, waiting: 3, stopped: 2, stopping: 1 }))).toBe('blue'));
    it('running beats completed and destroyed', () => expect(agentColor(counts({ running: 1, completed: 3, destroyed: 2 }))).toBe('blue'));
    it('waiting beats completed', () => expect(agentColor(counts({ waiting: 1, completed: 9 }))).toBe('amber'));
    it('stopped beats destroyed', () => expect(agentColor(counts({ stopped: 1, destroyed: 9 }))).toBe('amber'));
    it('destroyed beats completed (gray, not green)', () => expect(agentColor(counts({ completed: 9, destroyed: 1 }))).toBe('gray'));
  });
});

describe('buildExecutionGraph', () => {
  it('only agents with an execution in view are drawn (no idle agents)', () => {
    const g = buildExecutionGraph({ projectName: 'P', agents: agents(3), rows: [row({ _id: 'e1', agent_id: 'a2' })] });
    expect(g.nodes.map(n => n.id)).toEqual(['project', 'agent:a2', 'exec:e1']);
    expect(g.edges.filter(e => e.source === 'project').map(e => e.target)).toEqual(['agent:a2']);
    expect(buildExecutionGraph({ projectName: 'P', agents: agents(3), rows: [] }).nodes.map(n => n.id)).toEqual(['project']);
  });

  it('project node at the centre, agents on the ring', () => {
    const g = buildExecutionGraph({ projectName: 'P', agents: agents(3), rows: oneEach(['a1', 'a2', 'a3']) });
    expect(g.nodes.find(n => n.kind === 'project').position).toEqual({ x: 0, y: 0 });
    g.nodes.filter(n => n.kind === 'agent').forEach(n => expect(Math.abs(dist(n.position) - 170)).toBeLessThan(0.5));
  });

  it('the agent node carries its colour, from its rows', () => {
    const g = buildExecutionGraph({
      projectName: 'P', agents: agents(5), rows: [
        row({ _id: 'f', agent_id: 'a1', status: 'failed' }), row({ _id: 'r', agent_id: 'a1', status: 'running' }),
        row({ _id: 'r2', agent_id: 'a2', status: 'running' }), row({ _id: 's', agent_id: 'a2', status: 'stopped' }),
        row({ _id: 'w', agent_id: 'a3', status: 'waiting' }), row({ _id: 'c', agent_id: 'a3', status: 'completed' }),
        row({ _id: 'c2', agent_id: 'a4', status: 'completed' }),
        row({ _id: 'c3', agent_id: 'a5', status: 'completed' }), row({ _id: 'd', agent_id: 'a5', status: 'destroyed' }),
      ]
    });
    const color = (id: string) => g.nodes.find(n => n.id === 'agent:' + id).color;
    expect(['a1', 'a2', 'a3', 'a4', 'a5'].map(color)).toEqual(['red', 'blue', 'amber', 'green', 'gray']);
  });

  it('a row with errors turns its agent red, even completed', () => {
    const g = buildExecutionGraph({ projectName: 'P', agents: agents(1), rows: [row({ _id: 'c', status: 'completed', failure_conditions: 2 })] });
    const a = g.nodes.find(n => n.id === 'agent:a1');
    expect(a.color).toBe('red');
    expect(a.tooltip).toEqual({ kind: 'text', text: 'Agent 1', withErrors: 1 });
  });

  it('the stats, when given, decide the colour, the errors line and the +N count (exact, not capped)', () => {
    const g = buildExecutionGraph({
      projectName: 'P', agents: agents(2), rows: [row({ _id: 'c', status: 'completed' })],
      stats: stats({ a1: { completed: 1, failed: 2, failure_conditions: 2 }, a2: { waiting: 4 } }),
    });
    const a1 = g.nodes.find(n => n.id === 'agent:a1');
    expect(a1.color).toBe('red');
    expect(a1.tooltip).toEqual({ kind: 'text', text: 'Agent 1', withErrors: 2 });
    expect(g.nodes.find(n => n.id === 'more:a1').label).toBe('+2');
    expect(g.nodes.find(n => n.id === 'more:a1').tooltip).toEqual({ kind: 'more', hidden: { ...ZERO, failed: 2 } });
    // a2 has no row fetched (the pages were capped): it is drawn, amber, with its executions in one +N node
    expect(g.nodes.find(n => n.id === 'agent:a2').color).toBe('amber');
    expect(g.nodes.find(n => n.id === 'more:a2').label).toBe('+4');
    expect(g.nodes.some(n => n.kind === 'execution' && n.agentId === 'a2')).toBe(false);
  });

  it('the execution label is the last 8 hex chars of the id without dashes', () => {
    const g = buildExecutionGraph({ projectName: 'P', agents: agents(2), rows: [row({ _id: '019e1a2b-3c4d-7e5f-8a6b-0123456789ab' })] });
    expect(g.nodes.find(n => n.kind === 'execution').label).toBe('456789ab');
  });

  it('executions attach to their agent with their status, every status included', () => {
    const all = ['running', 'waiting', 'stopping', 'stopped', 'failed', 'completed', 'destroyed'];
    const g = buildExecutionGraph({ projectName: 'P', agents: agents(1), rows: all.map(st => row({ _id: st, status: st })) });
    all.forEach(st => {
      const e = g.nodes.find(n => n.id === 'exec:' + st);
      expect(e.kind).toBe('execution');
      expect(e.status).toBe(st as any);
      expect(e.agentId).toBe('a1');
      expect(g.edges.some(x => x.source === 'agent:a1' && x.target === 'exec:' + st)).toBe(true);
    });
    expect(g.nodes.find(n => n.id === 'exec:waiting').tooltip)
      .toEqual({ kind: 'execution', status: 'waiting', startedAt: new Date(NOW - 60000).toISOString(), trigger: 'message', steps: 2 });
  });

  it('unknown agent gets a node from agent_name while the agents list is empty', () => {
    const g = buildExecutionGraph({
      projectName: 'P', agents: [],
      rows: [row({ _id: 'e1', agent_id: 'zzzzzzzzzzzz', agent_name: 'Gone' }), row({ _id: 'e2', agent_id: 'abcdefghijkl', agent_name: null })]
    });
    expect(g.nodes.find(n => n.id === 'agent:zzzzzzzzzzzz').label).toBe('Gone');
    expect(g.nodes.find(n => n.id === 'agent:abcdefghijkl').label).toBe('abcdefgh');
    expect(g.edges.some(e => e.source === 'project' && e.target === 'agent:abcdefghijkl')).toBe(true);
  });

  it('with a non-empty agents list, rows and stats of other agents are not drawn', () => {
    const g = buildExecutionGraph({
      projectName: 'P', agents: agents(2),
      rows: [row({ _id: 'mine' }), row({ _id: 'other', agent_id: 'zz', agent_name: 'Automation' })],
      stats: stats({ a1: { running: 1 }, zz: { running: 1 }, yy: { failed: 3 } }),
    });
    expect(g.nodes.filter(n => n.kind === 'agent').map(n => n.id)).toEqual(['agent:a1']);
    expect(g.nodes.some(n => n.id === 'exec:other')).toBe(false);
  });

  it('positions are stable across refreshes while no agent changes bucket', () => {
    const rows = [row({ _id: 'e1' }), row({ _id: 'e2', started_at: new Date(NOW - 30000).toISOString() }), row({ _id: 'e4', agent_id: 'a3' }),
      ...oneEach(['a2', 'a4'])];
    const g1 = buildExecutionGraph({ projectName: 'P', agents: agents(4), rows });
    const g2 = buildExecutionGraph({ projectName: 'P', agents: agents(4), rows: [...rows, row({ _id: 'e3', agent_id: 'a3' })] });
    // a3 goes from 1 to 2 shown (same bucket): only a3's own fan is redrawn
    g1.nodes.filter(n => !(n.kind === 'execution' && n.agentId === 'a3'))
      .forEach(n => expect(g2.nodes.find(m => m.id === n.id).position).toEqual(n.position, n.id));
  });

  it('running edges are animated, others are not', () => {
    const g = buildExecutionGraph({
      projectName: 'P', agents: agents(1),
      rows: [row({ _id: 'r' }), row({ _id: 'w', status: 'waiting' }), row({ _id: 's', status: 'stopping' }), row({ _id: 'c', status: 'completed' })]
    });
    const anim = (id: string) => g.edges.find(e => e.target === id).animated;
    expect(anim('exec:r')).toBe(true);
    expect(['exec:w', 'exec:s', 'exec:c'].map(anim)).toEqual([false, false, false]);
    expect(g.edges.find(e => e.target === 'agent:a1').animated).toBe(false);
  });

  it('caps an agent at 12 by priority, with one +N overflow node and the colour from all rows', () => {
    const waiting = Array.from({ length: 30 }, (_, i) =>
      row({ _id: 'w' + String(i).padStart(2, '0'), status: 'waiting', started_at: new Date(NOW - 600000 + i * 1000).toISOString() }));
    const g = buildExecutionGraph({
      projectName: 'P', agents: agents(3),
      rows: [...waiting, row({ _id: 'run', status: 'running', started_at: new Date(NOW - 900000).toISOString() }),
        row({ _id: 'bad', status: 'failed', duration_ms: 1000, started_at: new Date(NOW - 850000).toISOString() })]
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
    expect(more[0].tooltip).toEqual({ kind: 'more', hidden: { ...ZERO, waiting: 20 } });
    expect(g.edges.some(e => e.source === 'agent:a1' && e.target === 'more:a1')).toBe(true);
    expect(g.nodes.find(n => n.id === 'agent:a1').color).toBe('red');
  });

  it('priority is failed > stopping > running > waiting > stopped > completed > destroyed', () => {
    const mk = (prefix: string, status: string, n: number) => Array.from({ length: n }, (_, i) => row({ _id: prefix + i, status: status as any }));
    const g = buildExecutionGraph({
      projectName: 'P', agents: agents(1),
      rows: [...mk('d', 'destroyed', 3), ...mk('c', 'completed', 3), ...mk('x', 'stopped', 3), ...mk('w', 'waiting', 3),
        ...mk('r', 'running', 3), ...mk('s', 'stopping', 2), ...mk('f', 'failed', 2)]
    });
    const drawn = g.nodes.filter(n => n.kind === 'execution');
    const by = (st: string) => drawn.filter(n => n.status === st).length;
    expect([by('failed'), by('stopping'), by('running'), by('waiting'), by('stopped'), by('completed'), by('destroyed')]).toEqual([2, 2, 3, 3, 2, 0, 0]);
    expect(g.nodes.find(n => n.id === 'more:a1').tooltip).toEqual({ kind: 'more', hidden: { ...ZERO, stopped: 1, completed: 3, destroyed: 3 } });
  });

  it('no overflow node at or under the cap', () => {
    const rows = Array.from({ length: MAX_PER_AGENT }, (_, i) => row({ _id: 'e' + i, status: 'waiting' }));
    const g = buildExecutionGraph({ projectName: 'P', agents: agents(1), rows });
    expect(g.nodes.filter(n => n.kind === 'execution').length).toBe(MAX_PER_AGENT);
    expect(g.nodes.some(n => n.kind === 'more')).toBe(false);
  });

  it('agent footprints are bucketed by shown nodes', () => {
    expect(AGENT_RING_RMAX).toBe(74 + 6 * (MAX_PER_AGENT - 8 + 1));
    expect([1, 4, 5, 8, 9, 13].map(agentFootprint)).toEqual([90, 90, 98, 98, AGENT_RING_RMAX + 20, AGENT_RING_RMAX + 20]);
  });

  it('agent ring is sized by the footprints: max(170, sum(2 f + 24) / 2pi), angular width proportional to the footprint', () => {
    [1, 3, 8, 13, 30].forEach(n => {
      const list = agents(n);
      const g = buildExecutionGraph({ projectName: 'P', agents: list, rows: oneEach(list.map(a => a.id)) });
      const want = Math.max(170, n * (2 * 90 + 24) / (2 * Math.PI));
      g.nodes.filter(x => x.kind === 'agent').forEach(x => expect(Math.abs(dist(x.position) - want)).toBeLessThan(0.5, 'n=' + n));
    });
    // 13 agents, one at the cap and one with 3 shown, the others one each: the busy agent gets a wider slice
    const list = Array.from({ length: 13 }, (_, i) => ({ id: 'a' + (i + 1), name: 'Agent ' + String(i + 1).padStart(2, '0') }));
    const rows = [
      ...Array.from({ length: MAX_PER_AGENT + 5 }, (_, i) => row({ _id: 'c' + String(i).padStart(2, '0'), agent_id: 'a1', status: 'waiting' })),
      ...[0, 1, 2].map(i => row({ _id: 't' + i, agent_id: 'a2', status: 'waiting' })),
      ...oneEach(list.slice(2).map(a => a.id)),
    ];
    const g = buildExecutionGraph({ projectName: 'P', agents: list, rows });
    const sum = 2 * (AGENT_RING_RMAX + 20) + 24 + 12 * (2 * 90 + 24);
    const R = sum / (2 * Math.PI);
    const pos = (id: string) => g.nodes.find(x => x.id === 'agent:' + id).position;
    ['a1', 'a2', 'a3', 'a13'].forEach(id => expect(Math.abs(dist(pos(id)) - R)).toBeLessThan(0.5, id));
    const arc = (p: any, q: any) => { let d = Math.abs(Math.atan2(p.y, p.x) - Math.atan2(q.y, q.x)); if (d > Math.PI) { d = 2 * Math.PI - d; } return d * R; };
    expect(arc(pos('a1'), pos('a2'))).toBeCloseTo((AGENT_RING_RMAX + 20) + 90 + 24, 3);
    expect(arc(pos('a3'), pos('a4'))).toBeCloseTo(90 + 90 + 24, 3);
  });

  it('agents move only when a bucket changes: 3 -> 4 shown moves no agent, 4 -> 5 does', () => {
    const others = oneEach(['a1', 'a3', 'a4', 'a5', 'a6']);
    const mk = (k: number) => buildExecutionGraph({
      projectName: 'P', agents: agents(6),
      rows: [...others, ...Array.from({ length: k }, (_, i) => row({ _id: 'e' + i, agent_id: 'a2', status: 'waiting' }))],
    });
    const agentPos = (g: any) => g.nodes.filter((x: any) => x.kind === 'agent').map((x: any) => ({ id: x.id, p: x.position }));
    expect(agentPos(mk(4))).toEqual(agentPos(mk(3)));
    expect(agentPos(mk(5))).not.toEqual(agentPos(mk(4)));
  });

  it('neighbouring agents at any buckets keep their fans a chip (26 px) plus 10 px apart', () => {
    const ks = [1, 4, 5, 8, 9, 13];   // an agent in view always shows something
    for (let n = 2; n <= 20; n++) {
      for (const k1 of ks) {
        for (const k2 of ks) {
          for (const rest of [1, 13]) {
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
            const g = buildExecutionGraph({ projectName: 'P', agents: list, rows: live });
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
      const g = buildExecutionGraph({ projectName: 'P', agents: agents(4), rows: live });
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

});
