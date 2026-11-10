import { ExecutionRow } from '../executions.models';
import { AGENT_RING_RMAX, buildExecutionGraph, FAILED_WINDOW_MS, MAX_LIVE, MAX_PER_AGENT } from './execution-graph.model';

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
    g.nodes.filter(n => n.kind === 'agent').forEach(n => expect(Math.abs(dist(n.position) - 300)).toBeLessThan(0.5));
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

  it('agent aura when a shown execution failed or a live one has failure_conditions > 0', () => {
    const g = buildExecutionGraph({
      projectName: 'P', agents: agents(3), now: NOW,
      live: [row({ _id: 'e1', agent_id: 'a2', failure_conditions: 1 })],
      failed: [row({ _id: 'e2', agent_id: 'a1', status: 'failed', duration_ms: 1000, started_at: new Date(NOW - 5000).toISOString() })]
    });
    expect(g.nodes.find(n => n.id === 'agent:a1').aura).toBe(true);
    expect(g.nodes.find(n => n.id === 'agent:a2').aura).toBe(true);
    expect(g.nodes.find(n => n.id === 'agent:a3').aura).toBe(false);
    expect(g.nodes.find(n => n.id === 'exec:e2').aura).toBe(true);
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

  it('positions are stable across refreshes', () => {
    const live = [row({ _id: 'e1' }), row({ _id: 'e2', started_at: new Date(NOW - 30000).toISOString() })];
    const g1 = buildExecutionGraph({ projectName: 'P', agents: agents(4), live, failed: [], now: NOW });
    const g2 = buildExecutionGraph({ projectName: 'P', agents: agents(4), live: [...live, row({ _id: 'e3', agent_id: 'a3' })], failed: [], now: NOW + 5000 });
    g1.nodes.forEach(n => expect(g2.nodes.find(m => m.id === n.id).position).toEqual(n.position));
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

  it('a capped-out live row with failure_conditions still gives the agent its aura', () => {
    const live = Array.from({ length: 13 }, (_, i) =>
      row({ _id: 'w' + String(i).padStart(2, '0'), status: 'waiting', started_at: new Date(NOW - 600000 + i * 1000).toISOString(),
        failure_conditions: i === 0 ? 2 : 0 }));
    const g = buildExecutionGraph({ projectName: 'P', agents: agents(1), live, failed: [], now: NOW });
    expect(g.nodes.some(n => n.id === 'exec:w00')).toBe(false);
    expect(g.nodes.find(n => n.id === 'agent:a1').aura).toBe(true);
  });

  it('no overflow node at or under the cap', () => {
    const live = Array.from({ length: MAX_PER_AGENT }, (_, i) => row({ _id: 'e' + i, status: 'waiting' }));
    const g = buildExecutionGraph({ projectName: 'P', agents: agents(1), live, failed: [], now: NOW });
    expect(g.nodes.filter(n => n.kind === 'execution').length).toBe(MAX_PER_AGENT);
    expect(g.nodes.some(n => n.kind === 'more')).toBe(false);
  });

  it('agent ring leaves room for the largest capped ring, whatever the live counts', () => {
    expect(AGENT_RING_RMAX).toBe(74 + 6 * (MAX_PER_AGENT - 8 + 1));
    [2, 5, 13, 30].forEach(n => {
      const empty = buildExecutionGraph({ projectName: 'P', agents: agents(n), live: [], failed: [], now: NOW });
      const busy = buildExecutionGraph({
        projectName: 'P', agents: agents(n), failed: [], now: NOW,
        live: Array.from({ length: 50 }, (_, i) => row({ _id: 'e' + i, agent_id: 'a' + (1 + (i % n)) }))
      });
      const ring = (g: any) => g.nodes.filter((x: any) => x.kind === 'agent').sort((a: any, b: any) =>
        Math.atan2(a.position.y, a.position.x) - Math.atan2(b.position.y, b.position.x));
      const a = ring(empty);
      expect(ring(busy).map((x: any) => x.position)).toEqual(a.map((x: any) => x.position));
      for (let i = 0; i < a.length; i++) {
        const next = a[(i + 1) % a.length];
        expect(dist(a[i].position, next.position)).toBeGreaterThanOrEqual(2 * AGENT_RING_RMAX, 'n=' + n);
      }
      busy.nodes.filter((x: any) => x.kind !== 'project' && x.kind !== 'agent').forEach((x: any) => {
        const owner = busy.nodes.find((y: any) => y.id === 'agent:' + x.agentId);
        expect(dist(x.position, owner.position)).toBeLessThanOrEqual(AGENT_RING_RMAX + 0.5);
      });
    });
  });

  it('agent ring grows with the agent count: max(300, 110 n / pi)', () => {
    [1, 8, 9, 30].forEach(n => {
      const g = buildExecutionGraph({ projectName: 'P', agents: agents(n), live: [], failed: [], now: NOW });
      const want = Math.max(300, 110 * n / Math.PI);
      g.nodes.filter(x => x.kind === 'agent').forEach(x => expect(Math.abs(dist(x.position) - want)).toBeLessThan(0.5, 'n=' + n));
    });
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
