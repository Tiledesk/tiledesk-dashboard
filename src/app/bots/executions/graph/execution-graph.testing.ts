import { AgentStatusCounts, ExecutionGraph, ExecutionRow, StatsRange, StatusCounts } from '../executions.models';

// Spec helper (imported by specs only): a fake GET /executions/graph answer built from rows.

const STATUS_KEYS: (keyof StatusCounts)[] = ['running', 'waiting', 'stopping', 'stopped', 'failed', 'completed', 'destroyed'];
const zero = (): AgentStatusCounts =>
  ({ running: 0, waiting: 0, stopping: 0, stopped: 0, failed: 0, completed: 0, destroyed: 0, failure_conditions: 0, errors: 0 });

/**
 * Per agent: the rows in the given order are the server's drawn order (the first 12 are drawn), the counts come from
 * all its rows unless `counts` gives them (an agent in `counts` is in view even without rows), hidden = counts minus
 * drawn. `statuses` / `with_errors` override the totals (the big numbers), which otherwise sum the agents.
 */
export function graphOf(rows: ExecutionRow[], opts: {
  range?: StatsRange; counts?: { [agentId: string]: Partial<AgentStatusCounts> }; statuses?: StatusCounts; with_errors?: number;
  names?: { [agentId: string]: string | null };
} = {}): ExecutionGraph {
  const byAgent = new Map<string, ExecutionRow[]>();
  rows.forEach(r => byAgent.set(r.agent_id, (byAgent.get(r.agent_id) || []).concat([r])));
  Object.keys(opts.counts || {}).forEach(id => { if (!byAgent.has(id)) { byAgent.set(id, []); } });
  const agents: ExecutionGraph['agents'] = {};
  const statuses: any = { running: 0, waiting: 0, stopping: 0, stopped: 0, failed: 0, completed: 0, destroyed: 0 };
  let withErrors = 0;
  byAgent.forEach((list, id) => {
    let counts = zero();
    if (opts.counts && opts.counts[id]) {
      counts = { ...counts, ...opts.counts[id] };
    } else {
      list.forEach(r => {
        if ((counts as any)[r.status] !== undefined) { (counts as any)[r.status]++; }
        if ((r.failure_conditions || 0) > 0) { counts.failure_conditions++; }
        if ((r.errors || 0) > 0) { counts.errors++; }
      });
    }
    const drawn = list.slice(0, 12);
    const hidden: { [s: string]: number } = {};
    STATUS_KEYS.forEach(s => {
      const n = counts[s] - drawn.filter(r => r.status === s).length;
      if (n > 0) { hidden[s] = n; }
      statuses[s] += counts[s];
    });
    withErrors += counts.errors;
    const name = opts.names && id in opts.names ? opts.names[id] : (list[0] ? list[0].agent_name : null);
    agents[id] = { name, counts, drawn, hidden };
  });
  return {
    range: opts.range || 'now', from: null, statuses: opts.statuses || statuses,
    with_errors: opts.with_errors === undefined ? withErrors : opts.with_errors, agents,
  };
}
