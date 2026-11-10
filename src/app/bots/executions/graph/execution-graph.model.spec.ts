import { ExecutionRow } from '../executions.models';
import { buildExecutionGraph, FAILED_WINDOW_MS, MAX_LIVE } from './execution-graph.model';

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
    g.nodes.filter(n => n.kind === 'agent').forEach(n => expect(Math.abs(dist(n.position) - 260)).toBeLessThan(0.5));
    expect(g.edges.filter(e => e.source === 'project').length).toBe(3);
  });

  it('live executions attach to their agent with their status', () => {
    const g = buildExecutionGraph({ projectName: 'P', agents: agents(2), live: [row({ _id: 'e1', status: 'waiting' })], failed: [], now: NOW });
    const e = g.nodes.find(n => n.id === 'exec:e1');
    expect(e.kind).toBe('execution');
    expect(e.status).toBe('waiting');
    expect(e.agentId).toBe('a1');
    expect(g.edges.some(x => x.source === 'agent:a1' && x.target === 'exec:e1')).toBe(true);
    expect(e.tooltip.length).toBe(4);
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

  it('unknown agent gets a node from agent_name', () => {
    const g = buildExecutionGraph({
      projectName: 'P', agents: agents(1), failed: [], now: NOW,
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

  it('more than 300 live: draws 300, counts.truncated true', () => {
    const live = Array.from({ length: MAX_LIVE + 20 }, (_, i) =>
      row({ _id: 'e' + String(i).padStart(4, '0'), status: i % 2 ? 'waiting' : 'running' }));
    const g = buildExecutionGraph({ projectName: 'P', agents: agents(1), live, failed: [], now: NOW });
    expect(g.nodes.filter(n => n.kind === 'execution').length).toBe(MAX_LIVE);
    expect(g.counts.truncated).toBe(true);
    expect(g.counts.running + g.counts.waiting).toBe(MAX_LIVE + 20);
  });
});
