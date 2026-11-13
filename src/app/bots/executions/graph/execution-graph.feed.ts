import { EMPTY, forkJoin, fromEvent, Observable, Subscription } from 'rxjs';
import { expand, map, reduce, startWith, timeout } from 'rxjs/operators';
import { ExecutionsService } from 'app/services/executions.service';
import { ExecutionListParams, ExecutionPage, ExecutionRow, ExecutionStats, StatsRange } from '../executions.models';

/**
 * One cycle of the graph's view: the rows to draw (deduped, capped) and the exact counts of the same view.
 * `truncated`: a query still had pages left after the cap, so not every execution in view is drawn.
 */
export interface GraphSnapshot {
  rows: ExecutionRow[];
  stats: ExecutionStats | null;
  truncated: boolean;
  range: StatsRange;
  fetchedAt: number;
  stale: boolean;
}

export const GRAPH_REFRESH_MS = 5000;
/** Client timeout of one whole cycle (all the queries, all their pages, and the stats). */
export const GRAPH_REQUEST_TIMEOUT_MS = 10000;
/** The not-terminated statuses: the Now view, whatever their age. */
export const LIVE_STATUSES = 'running,waiting,stopping,stopped';
export const RANGE_MS: { [R in Exclude<StatsRange, 'now'>]: number } = {
  '1h': 3600 * 1000,
  '24h': 24 * 3600 * 1000,
  '7d': 7 * 24 * 3600 * 1000,
  '30d': 30 * 24 * 3600 * 1000,
};
const PAGE_LIMIT = 100;
const MAX_PAGES = 3;

interface Fetched { rows: ExecutionRow[]; more: boolean; }

/** Fetches up to MAX_PAGES pages, following next_cursor; `more` when a cursor was left unfollowed. */
function fetchPages(
  service: Pick<ExecutionsService, 'list'>, projectId: string, params: ExecutionListParams
): Observable<Fetched> {
  let pages = 1;
  return service.list(projectId, params).pipe(
    expand((p: ExecutionPage) => {
      if (p.next_cursor && pages < MAX_PAGES) {
        pages++;
        return service.list(projectId, { ...params, cursor: p.next_cursor });
      }
      return EMPTY;
    }),
    reduce((acc: Fetched, p: ExecutionPage) => ({ rows: acc.rows.concat(p.items || []), more: !!p.next_cursor }), { rows: [], more: false } as Fetched)
  );
}

function dedupe(rows: ExecutionRow[]): ExecutionRow[] {
  const seen = new Set<string>();
  const out: ExecutionRow[] = [];
  for (const row of rows) {
    if (seen.has(row._id)) { continue; }
    seen.add(row._id);
    out.push(row);
  }
  return out;
}

function documentHidden$(): Observable<boolean> {
  return fromEvent(document, 'visibilitychange').pipe(map(() => document.hidden), startWith(document.hidden));
}

/**
 * The graph's view of `range`, refreshed every GRAPH_REFRESH_MS after the previous answer, paused while the tab is hidden.
 * Now: the live statuses, any age. A range: the same, plus every status started in the last R. Test runs included.
 */
export function executionGraphFeed(
  service: Pick<ExecutionsService, 'list' | 'stats'>,
  projectId: string,
  range: StatsRange = 'now',
  opts: { now?: () => number; hidden$?: Observable<boolean>; refreshMs?: number } = {}
): Observable<GraphSnapshot> {
  const now = opts.now || (() => Date.now());
  const refreshMs = opts.refreshMs === undefined ? GRAPH_REFRESH_MS : opts.refreshMs;

  return new Observable<GraphSnapshot>(subscriber => {
    let hidden = false;
    let last: GraphSnapshot | null = null;
    let timer: any = null;
    let inflight: Subscription | null = null;
    let running = false;

    const clear = () => {
      if (timer !== null) { clearTimeout(timer); timer = null; }
      if (inflight) { inflight.unsubscribe(); inflight = null; }
      running = false;
    };

    const schedule = () => {
      if (hidden) { return; }
      timer = setTimeout(() => { timer = null; run(); }, refreshMs);
    };

    const done = (snap: GraphSnapshot) => {
      inflight = null;
      running = false;
      last = snap;
      subscriber.next(snap);
      schedule();
    };

    const run = () => {
      clear();
      running = true;
      const t = now();
      const from = range !== 'now' ? new Date(t - RANGE_MS[range]).toISOString() : null;
      const queries = [fetchPages(service, projectId, { status: LIVE_STATUSES, test: 'all', limit: PAGE_LIMIT })];
      if (from) {
        queries.push(fetchPages(service, projectId, { from, test: 'all', limit: PAGE_LIMIT }));
      }
      // The problems on their own (usually few): the general queries are capped and newest first, so a failed run
      // or one with errors could otherwise fall outside them and never reach the chip priority (spec addendum).
      queries.push(fetchPages(service, projectId, { status: LIVE_STATUSES, has_errors: true, test: 'all', limit: PAGE_LIMIT }));
      if (from) {
        queries.push(fetchPages(service, projectId, { status: 'failed', from, test: 'all', limit: PAGE_LIMIT }));
        queries.push(fetchPages(service, projectId, { has_errors: true, from, test: 'all', limit: PAGE_LIMIT }));
      }
      const stats$ = service.stats(projectId, { range, test: 'all' });
      inflight = forkJoin([forkJoin(queries), stats$]).pipe(timeout(GRAPH_REQUEST_TIMEOUT_MS)).subscribe(
        ([fetched, stats]) => {
          const rows = dedupe(fetched.reduce((acc, f) => acc.concat(f.rows), [] as ExecutionRow[]));
          done({ rows, stats, truncated: fetched.some(f => f.more), range, fetchedAt: t, stale: false });
        },
        () => done(last
          ? { ...last, stale: true }
          : { rows: [], stats: null, truncated: false, range, fetchedAt: t, stale: true })
      );
      // a synchronous source has already completed (done ran): nothing is in flight
      if (!running) { inflight = null; }
    };

    const hiddenSub = (opts.hidden$ || documentHidden$()).subscribe(h => {
      if (h === hidden) { return; }
      hidden = h;
      if (hidden) {
        // pause: drop the pending timer only; an in-flight request still delivers its result
        if (timer !== null) { clearTimeout(timer); timer = null; }
      } else if (!running) {
        run();
      }
    });
    if (!hidden && !running && timer === null) { run(); }

    return () => { hiddenSub.unsubscribe(); clear(); };
  });
}
