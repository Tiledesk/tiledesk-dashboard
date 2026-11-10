import { EMPTY, forkJoin, fromEvent, Observable, Subscription } from 'rxjs';
import { expand, map, reduce, startWith } from 'rxjs/operators';
import { ExecutionsService } from 'app/services/executions.service';
import { ExecutionListParams, ExecutionPage, ExecutionRow } from '../executions.models';

export interface GraphSnapshot { live: ExecutionRow[]; failed: ExecutionRow[]; fetchedAt: number; stale: boolean; }

export const GRAPH_REFRESH_MS = 5000;
const PAGE_LIMIT = 100;
const MAX_PAGES = 3;
const FAILED_LOOKUP_MS = 24 * 60 * 60 * 1000;

/** Fetches up to MAX_PAGES pages, following next_cursor, and returns all the rows in order. */
function fetchPages(
  service: Pick<ExecutionsService, 'list'>, projectId: string, params: ExecutionListParams
): Observable<ExecutionRow[]> {
  let pages = 1;
  return service.list(projectId, params).pipe(
    expand((p: ExecutionPage) => {
      if (p.next_cursor && pages < MAX_PAGES) {
        pages++;
        return service.list(projectId, { ...params, cursor: p.next_cursor });
      }
      return EMPTY;
    }),
    reduce((acc: ExecutionRow[], p: ExecutionPage) => acc.concat(p.items || []), [] as ExecutionRow[])
  );
}

function dedupe(rows: ExecutionRow[], seen: Set<string>): ExecutionRow[] {
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

export function executionGraphFeed(
  service: Pick<ExecutionsService, 'list'>,
  projectId: string,
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
      const live$ = fetchPages(service, projectId, { status: 'running,waiting,stopping', limit: PAGE_LIMIT });
      const failed$ = fetchPages(service, projectId, {
        status: 'failed', from: new Date(t - FAILED_LOOKUP_MS).toISOString(), limit: PAGE_LIMIT
      });
      inflight = forkJoin([live$, failed$]).subscribe(
        ([liveRows, failedRows]) => {
          const seen = new Set<string>();
          const live = dedupe(liveRows, seen);
          const failed = dedupe(failedRows, seen);
          done({ live, failed, fetchedAt: t, stale: false });
        },
        () => done(last
          ? { ...last, stale: true }
          : { live: [], failed: [], fetchedAt: t, stale: true })
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
