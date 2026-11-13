import { fromEvent, Observable, Subscription } from 'rxjs';
import { map, startWith, timeout } from 'rxjs/operators';
import { ExecutionsService } from 'app/services/executions.service';
import { ExecutionGraph, StatsRange } from '../executions.models';

/** One cycle of the graph's view: the graph response (null until a first answer), when it was asked, and whether it failed. */
export interface GraphSnapshot {
  graph: ExecutionGraph | null;
  range: StatsRange;
  fetchedAt: number;
  stale: boolean;
}

/** What the component gives the feed: a manual refresh trigger, and a callback told whether a call is in flight. */
export interface GraphFeedControls {
  refresh$: Observable<void>;
  loading: (inFlight: boolean) => void;
}

/** Next cycle this long after the previous answer (spec 2026-11-13, addendum 2: once a minute, plus a Refresh button). */
export const GRAPH_REFRESH_MS = 60000;
/** Client timeout of one call. */
export const GRAPH_REQUEST_TIMEOUT_MS = 10000;

function documentHidden$(): Observable<boolean> {
  return fromEvent(document, 'visibilitychange').pipe(map(() => document.hidden), startWith(document.hidden));
}

/**
 * The graph's view of `range` (test runs included): one GET /executions/graph per cycle, the next one GRAPH_REFRESH_MS after
 * the previous answer, paused while the tab is hidden. `refresh$` runs a cycle now (dropping the pending timer), unless one
 * is in flight: never two calls at once. An error or a timeout re-emits the last snapshot marked stale.
 */
export function executionGraphFeed(
  service: Pick<ExecutionsService, 'graph'>,
  projectId: string,
  range: StatsRange = 'now',
  opts: {
    now?: () => number; hidden$?: Observable<boolean>; refreshMs?: number;
    refresh$?: Observable<void>; loading?: (inFlight: boolean) => void;
  } = {}
): Observable<GraphSnapshot> {
  const now = opts.now || (() => Date.now());
  const refreshMs = opts.refreshMs === undefined ? GRAPH_REFRESH_MS : opts.refreshMs;
  const loading = opts.loading || (() => { });

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
      loading(false);
      if (!snap.stale) { last = snap; }
      subscriber.next(snap);
      schedule();
    };

    const run = () => {
      clear();
      running = true;
      loading(true);
      const t = now();
      inflight = service.graph(projectId, { range, test: 'all' }).pipe(timeout(GRAPH_REQUEST_TIMEOUT_MS)).subscribe(
        graph => done({ graph, range, fetchedAt: t, stale: false }),
        () => done(last ? { ...last, stale: true } : { graph: null, range, fetchedAt: t, stale: true })
      );
      // a synchronous source has already answered (done ran): nothing is in flight
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
    const refreshSub = opts.refresh$ ? opts.refresh$.subscribe(() => { if (!running) { run(); } }) : null;
    if (!hidden && !running && timer === null) { run(); }

    return () => {
      hiddenSub.unsubscribe();
      if (refreshSub) { refreshSub.unsubscribe(); }
      clear();
    };
  });
}
