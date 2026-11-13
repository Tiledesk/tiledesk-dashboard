import { fakeAsync, tick } from '@angular/core/testing';
import { NEVER, Observable, of, Subject, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ExecutionPage, ExecutionRow, ExecutionStats } from '../executions.models';
import { executionGraphFeed, GraphSnapshot, GRAPH_REFRESH_MS, GRAPH_REQUEST_TIMEOUT_MS, RANGE_MS } from './execution-graph.feed';

const NOW = Date.parse('2026-11-10T12:00:00.000Z');
const r = (id: string) => ({ _id: id, agent_id: 'a1', status: 'running' } as ExecutionRow);
const page = (ids: string[], next: string | null = null): ExecutionPage => ({ items: ids.map(r), next_cursor: next });
const LIVE = 'running,waiting,stopping,stopped';
const STATS = (range = 'now'): ExecutionStats => ({
  range: range as any, from: null, agents: {},
  statuses: { running: 1, waiting: 0, stopping: 0, stopped: 0, failed: 0, completed: 0, destroyed: 0 },
});

/** `calls` records list and stats calls in order (a stats call has kind 'stats'); `list` is the list calls only. */
function setup(handler: (params: any) => Observable<ExecutionPage>, stats: (params: any) => Observable<ExecutionStats> = p => of(STATS(p.range))) {
  const calls: any[] = [];
  const service = {
    list: (pid: string, params: any) => { calls.push({ pid, params }); return handler(params); },
    stats: (pid: string, params: any) => { calls.push({ pid, params, kind: 'stats' }); return stats(params); },
  };
  const snaps: GraphSnapshot[] = [];
  const list = () => calls.filter(c => c.kind !== 'stats');
  return { calls, list, service: service as any, snaps };
}
const quiet = () => ({ now: () => NOW, hidden$: new Subject<boolean>() });

describe('executionGraphFeed', () => {
  it('Now: one live query (every not-terminated status, test runs too) and the stats, at once', fakeAsync(() => {
    const t = setup(p => of(page(['l1'])));
    const sub = executionGraphFeed(t.service, 'p1', 'now', quiet()).subscribe(s => t.snaps.push(s));
    expect(t.calls).toEqual([
      { pid: 'p1', params: { status: LIVE, test: 'all', limit: 100 } },
      { pid: 'p1', params: { range: 'now', test: 'all' }, kind: 'stats' },
    ]);
    expect(t.snaps.length).toBe(1);
    expect(t.snaps[0].stale).toBe(false);
    expect(t.snaps[0].fetchedAt).toBe(NOW);
    expect(t.snaps[0].range).toBe('now');
    expect(t.snaps[0].rows.map(x => x._id)).toEqual(['l1']);
    expect(t.snaps[0].stats).toEqual(STATS('now'));
    expect(t.snaps[0].truncated).toBe(false);
    sub.unsubscribe();
  }));

  it('defaults to Now', fakeAsync(() => {
    const t = setup(p => of(page([])));
    const sub = executionGraphFeed(t.service, 'p1', undefined, quiet()).subscribe(s => t.snaps.push(s));
    expect(t.list().length).toBe(1);
    expect(t.calls[1].params.range).toBe('now');
    sub.unsubscribe();
  }));

  it('a range: the live query with no date bound, plus every status from now - R, plus the stats of the range', fakeAsync(() => {
    for (const range of ['1h', '24h', '7d', '30d'] as const) {
      const t = setup(p => of(page([])));
      const sub = executionGraphFeed(t.service, 'p1', range, quiet()).subscribe(s => t.snaps.push(s));
      expect(t.list().map(c => c.params)).toEqual([
        { status: LIVE, test: 'all', limit: 100 },
        { from: new Date(NOW - RANGE_MS[range]).toISOString(), test: 'all', limit: 100 },
      ]);
      expect(t.calls.find(c => c.kind === 'stats').params).toEqual({ range, test: 'all' });
      expect(t.snaps[0].range).toBe(range);
      sub.unsubscribe();
    }
    expect(RANGE_MS).toEqual({ '1h': 3600000, '24h': 86400000, '7d': 7 * 86400000, '30d': 30 * 86400000 });
  }));

  it('follows next_cursor up to 3 pages and stops; a query cut short marks the snapshot truncated', fakeAsync(() => {
    const t = setup(p => {
      const n = p.cursor ? Number(p.cursor) : 0;
      return of(page(['l' + n], String(n + 1)));
    });
    const sub = executionGraphFeed(t.service, 'p1', 'now', quiet()).subscribe(s => t.snaps.push(s));
    expect(t.list().map(c => c.params.cursor)).toEqual([undefined, '1', '2']);
    expect(t.snaps[0].rows.map(x => x._id)).toEqual(['l0', 'l1', 'l2']);
    expect(t.snaps[0].truncated).toBe(true);
    sub.unsubscribe();
  }));

  it('the range query cut short also marks it truncated', fakeAsync(() => {
    const t = setup(p => p.status ? of(page(['l'])) : of(page(['f' + (p.cursor || '')], 'x' + (p.cursor || ''))));
    const sub = executionGraphFeed(t.service, 'p1', '7d', quiet()).subscribe(s => t.snaps.push(s));
    expect(t.list().length).toBe(4);
    expect(t.snaps[0].truncated).toBe(true);
    sub.unsubscribe();
  }));

  it('duplicate ids across pages and across the two queries are dropped, live rows first', fakeAsync(() => {
    const t = setup(p => {
      if (p.status === LIVE) { return of(p.cursor ? page(['a', 'b']) : page(['a', 'x'], 'c')); }
      return of(p.cursor ? page(['f1', 'x']) : page(['f1', 'a', 'f2'], 'c'));
    });
    const sub = executionGraphFeed(t.service, 'p1', '24h', quiet()).subscribe(s => t.snaps.push(s));
    expect(t.snaps[0].rows.map(x => x._id)).toEqual(['a', 'x', 'b', 'f1', 'f2']);
    expect(t.snaps[0].truncated).toBe(false);
    sub.unsubscribe();
  }));

  it('a stats error makes the cycle stale, like a list error', fakeAsync(() => {
    let fail = false;
    const t = setup(p => of(page(['l1'])), p => fail ? throwError(new Error('503')) : of(STATS()));
    const sub = executionGraphFeed(t.service, 'p1', 'now', quiet()).subscribe(s => t.snaps.push(s));
    expect(t.snaps[0].stale).toBe(false);
    fail = true;
    tick(GRAPH_REFRESH_MS);
    expect(t.snaps[1].stale).toBe(true);
    expect(t.snaps[1].stats).toEqual(STATS());
    expect(t.snaps[1].rows.map(x => x._id)).toEqual(['l1']);
    sub.unsubscribe();
  }));

  it('next cycle 5000 ms after the response, never overlapping', fakeAsync(() => {
    const t = setup(p => of(page([])).pipe(delay(2000)));
    const sub = executionGraphFeed(t.service, 'p1', 'now', quiet()).subscribe(s => t.snaps.push(s));
    expect(t.calls.length).toBe(2);
    tick(1999);
    expect(t.calls.length).toBe(2);
    tick(1);
    expect(t.snaps.length).toBe(1);
    tick(GRAPH_REFRESH_MS - 1);
    expect(t.calls.length).toBe(2);
    tick(1);
    expect(t.calls.length).toBe(4);
    tick(1999);
    expect(t.calls.length).toBe(4);
    sub.unsubscribe();
    tick(10000);
  }));

  it('an error keeps the last snapshot and marks it stale', fakeAsync(() => {
    let fail = false;
    const t = setup(p => fail ? throwError(new Error('503')) : of(page(['l1'])));
    const sub = executionGraphFeed(t.service, 'p1', 'now', quiet()).subscribe(s => t.snaps.push(s));
    expect(t.snaps[0].stale).toBe(false);
    fail = true;
    tick(GRAPH_REFRESH_MS);
    expect(t.snaps.length).toBe(2);
    expect(t.snaps[1].stale).toBe(true);
    expect(t.snaps[1].rows.map(x => x._id)).toEqual(['l1']);
    fail = false;
    tick(GRAPH_REFRESH_MS);
    expect(t.snaps.length).toBe(3);
    expect(t.snaps[2].stale).toBe(false);
    sub.unsubscribe();
  }));

  it('an error before any data emits an empty stale snapshot and keeps retrying', fakeAsync(() => {
    const t = setup(p => throwError(new Error('down')));
    const sub = executionGraphFeed(t.service, 'p1', 'now', quiet()).subscribe(s => t.snaps.push(s));
    expect(t.snaps[0]).toEqual({ rows: [], stats: null, truncated: false, range: 'now', fetchedAt: NOW, stale: true });
    const n = t.calls.length;
    tick(GRAPH_REFRESH_MS);
    expect(t.calls.length).toBeGreaterThan(n);
    sub.unsubscribe();
  }));

  it('a never-answering service times out at 10 s: stale snapshot, next call 5 s later', fakeAsync(() => {
    const t = setup(p => NEVER);
    const sub = executionGraphFeed(t.service, 'p1', 'now', quiet()).subscribe(s => t.snaps.push(s));
    expect(GRAPH_REQUEST_TIMEOUT_MS).toBe(10000);
    expect(t.calls.length).toBe(2);
    tick(9999);
    expect(t.snaps.length).toBe(0);
    tick(1);
    expect(t.snaps.length).toBe(1);
    expect(t.snaps[0].stale).toBe(true);
    tick(GRAPH_REFRESH_MS - 1);
    expect(t.calls.length).toBe(2);
    tick(1);
    expect(t.calls.length).toBe(4);
    sub.unsubscribe();
    tick(60000);
  }));

  it('hidden tab pauses, visible resumes at once', fakeAsync(() => {
    const hidden$ = new Subject<boolean>();
    const t = setup(p => of(page([])));
    const sub = executionGraphFeed(t.service, 'p1', 'now', { now: () => NOW, hidden$ }).subscribe(s => t.snaps.push(s));
    expect(t.calls.length).toBe(2);
    hidden$.next(true);
    tick(60000);
    expect(t.calls.length).toBe(2);
    hidden$.next(false);
    expect(t.calls.length).toBe(4);
    tick(GRAPH_REFRESH_MS);
    expect(t.calls.length).toBe(6);
    sub.unsubscribe();
  }));

  it('unsubscribe stops timers', fakeAsync(() => {
    const t = setup(p => of(page([])));
    const sub = executionGraphFeed(t.service, 'p1', 'now', quiet()).subscribe(s => t.snaps.push(s));
    sub.unsubscribe();
    tick(60000);
    expect(t.calls.length).toBe(2);
  }));

  it('unsubscribe cancels an in-flight request', fakeAsync(() => {
    const t = setup(p => of(page([])).pipe(delay(2000)));
    const sub = executionGraphFeed(t.service, 'p1', 'now', quiet()).subscribe(s => t.snaps.push(s));
    sub.unsubscribe();
    tick(60000);
    expect(t.snaps.length).toBe(0);
    expect(t.calls.length).toBe(2);
  }));

  it('hidden while a timer is pending: no call fires', fakeAsync(() => {
    const hidden$ = new Subject<boolean>();
    const t = setup(p => of(page([])));
    const sub = executionGraphFeed(t.service, 'p1', 'now', { now: () => NOW, hidden$ }).subscribe(s => t.snaps.push(s));
    tick(GRAPH_REFRESH_MS - 1);
    hidden$.next(true);
    tick(60000);
    expect(t.calls.length).toBe(2);
    sub.unsubscribe();
  }));

  it('hidden while a request is in flight: its result emits, nothing is scheduled after', fakeAsync(() => {
    const hidden$ = new Subject<boolean>();
    const t = setup(p => of(page(['l1'])).pipe(delay(2000)));
    const sub = executionGraphFeed(t.service, 'p1', 'now', { now: () => NOW, hidden$ }).subscribe(s => t.snaps.push(s));
    tick(1000);
    hidden$.next(true);
    tick(1000);
    expect(t.snaps.length).toBe(1);
    expect(t.snaps[0].stale).toBe(false);
    tick(60000);
    expect(t.calls.length).toBe(2);
    sub.unsubscribe();
  }));

  it('visible while in flight: no second call', fakeAsync(() => {
    const hidden$ = new Subject<boolean>();
    const t = setup(p => of(page([])).pipe(delay(2000)));
    const sub = executionGraphFeed(t.service, 'p1', 'now', { now: () => NOW, hidden$ }).subscribe(s => t.snaps.push(s));
    tick(500);
    hidden$.next(true);
    hidden$.next(false);
    expect(t.calls.length).toBe(2);
    tick(1500);
    expect(t.snaps.length).toBe(1);
    tick(GRAPH_REFRESH_MS);
    expect(t.calls.length).toBe(4);
    sub.unsubscribe();
    tick(10000);
  }));

  it('repeated visible events start no extra calls', fakeAsync(() => {
    const hidden$ = new Subject<boolean>();
    const t = setup(p => of(page([])));
    const sub = executionGraphFeed(t.service, 'p1', 'now', { now: () => NOW, hidden$ }).subscribe(s => t.snaps.push(s));
    hidden$.next(false);
    hidden$.next(false);
    expect(t.calls.length).toBe(2);
    sub.unsubscribe();
  }));

  it('hidden then visible while in flight: no double cycle', fakeAsync(() => {
    const hidden$ = new Subject<boolean>();
    const t = setup(p => of(page([])).pipe(delay(2000)));
    const sub = executionGraphFeed(t.service, 'p1', 'now', { now: () => NOW, hidden$ }).subscribe(s => t.snaps.push(s));
    hidden$.next(true);
    tick(100);
    hidden$.next(false);
    tick(1900);
    expect(t.snaps.length).toBe(1);
    expect(t.calls.length).toBe(2);
    tick(GRAPH_REFRESH_MS);
    expect(t.calls.length).toBe(4);
    sub.unsubscribe();
    tick(10000);
  }));

  it('the default hidden$ listener is removed on unsubscribe', fakeAsync(() => {
    const t = setup(p => of(page([])));
    const added: any[] = [];
    const removed: any[] = [];
    const add = spyOn(document, 'addEventListener').and.callFake((type: string, fn: any) => { if (type === 'visibilitychange') { added.push(fn); } });
    spyOn(document, 'removeEventListener').and.callFake((type: string, fn: any) => { if (type === 'visibilitychange') { removed.push(fn); } });
    const sub = executionGraphFeed(t.service, 'p1', 'now', { now: () => NOW }).subscribe(s => t.snaps.push(s));
    expect(added.length).toBe(1);
    sub.unsubscribe();
    expect(removed).toEqual(added);
    tick(60000);
  }));
});
