import { fakeAsync, tick } from '@angular/core/testing';
import { NEVER, Observable, of, Subject, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ExecutionGraph } from '../executions.models';
import { executionGraphFeed, GraphSnapshot, GRAPH_REFRESH_MS, GRAPH_REQUEST_TIMEOUT_MS } from './execution-graph.feed';

const NOW = Date.parse('2026-11-10T12:00:00.000Z');
const GRAPH = (range = 'now', running = 1): ExecutionGraph => ({
  range: range as any, from: null, with_errors: 0, agents: {},
  statuses: { running, waiting: 0, stopping: 0, stopped: 0, failed: 0, completed: 0, destroyed: 0 },
});

/** `calls` records every graph call; `handler` answers it. */
function setup(handler: (params: any) => Observable<ExecutionGraph> = p => of(GRAPH(p.range))) {
  const calls: any[] = [];
  const service = { graph: (pid: string, params: any) => { calls.push({ pid, params }); return handler(params); } };
  const snaps: GraphSnapshot[] = [];
  const loading: boolean[] = [];
  return { calls, service: service as any, snaps, loading };
}
const quiet = (extra: any = {}) => ({ now: () => NOW, hidden$: new Subject<boolean>(), ...extra });

describe('executionGraphFeed', () => {
  it('one graph call per cycle (the range, test runs too), at once; the snapshot carries the response', fakeAsync(() => {
    const t = setup();
    const sub = executionGraphFeed(t.service, 'p1', '24h', quiet()).subscribe(s => t.snaps.push(s));
    expect(t.calls).toEqual([{ pid: 'p1', params: { range: '24h', test: 'all' } }]);
    expect(t.snaps).toEqual([{ graph: GRAPH('24h'), range: '24h', fetchedAt: NOW, stale: false }]);
    sub.unsubscribe();
  }));

  it('defaults to Now', fakeAsync(() => {
    const t = setup();
    const sub = executionGraphFeed(t.service, 'p1', undefined, quiet()).subscribe(s => t.snaps.push(s));
    expect(t.calls.map(c => c.params)).toEqual([{ range: 'now', test: 'all' }]);
    expect(t.snaps[0].range).toBe('now');
    sub.unsubscribe();
  }));

  it('refreshes every 60 s, counted after the previous answer, never overlapping', fakeAsync(() => {
    expect(GRAPH_REFRESH_MS).toBe(60000);
    const t = setup(p => of(GRAPH()).pipe(delay(2000)));
    const sub = executionGraphFeed(t.service, 'p1', 'now', quiet()).subscribe(s => t.snaps.push(s));
    expect(t.calls.length).toBe(1);
    tick(1999);
    expect(t.snaps.length).toBe(0);
    tick(1);
    expect(t.snaps.length).toBe(1);
    tick(GRAPH_REFRESH_MS - 1);
    expect(t.calls.length).toBe(1);
    tick(1);
    expect(t.calls.length).toBe(2);
    tick(1999);
    expect(t.calls.length).toBe(2);
    tick(1);
    expect(t.snaps.length).toBe(2);
    sub.unsubscribe();
    tick(120000);
  }));

  it('a manual refresh runs a cycle now and restarts the 60 s from its answer', fakeAsync(() => {
    const refresh$ = new Subject<void>();
    const t = setup();
    const sub = executionGraphFeed(t.service, 'p1', 'now', quiet({ refresh$ })).subscribe(s => t.snaps.push(s));
    expect(t.calls.length).toBe(1);
    tick(20000);
    refresh$.next();
    expect(t.calls.length).toBe(2);
    expect(t.snaps.length).toBe(2);
    // the pending timer (40 s left) was cancelled: the next cycle is 60 s after the manual one
    tick(40000);
    expect(t.calls.length).toBe(2);
    tick(20000);
    expect(t.calls.length).toBe(3);
    sub.unsubscribe();
  }));

  it('a manual refresh while a call is in flight starts no second call', fakeAsync(() => {
    const refresh$ = new Subject<void>();
    const t = setup(p => of(GRAPH()).pipe(delay(2000)));
    const sub = executionGraphFeed(t.service, 'p1', 'now', quiet({ refresh$ })).subscribe(s => t.snaps.push(s));
    tick(500);
    refresh$.next();
    refresh$.next();
    expect(t.calls.length).toBe(1);
    tick(1500);
    expect(t.snaps.length).toBe(1);
    expect(t.calls.length).toBe(1);
    // once answered, a manual refresh runs again
    refresh$.next();
    expect(t.calls.length).toBe(2);
    sub.unsubscribe();
    tick(120000);
  }));

  it('reports when a call is in flight', fakeAsync(() => {
    const refresh$ = new Subject<void>();
    const t = setup(p => of(GRAPH()).pipe(delay(2000)));
    const sub = executionGraphFeed(t.service, 'p1', 'now', quiet({ refresh$, loading: (b: boolean) => t.loading.push(b) }))
      .subscribe(s => t.snaps.push(s));
    expect(t.loading).toEqual([true]);
    tick(2000);
    expect(t.loading).toEqual([true, false]);
    refresh$.next();
    expect(t.loading).toEqual([true, false, true]);
    tick(2000);
    expect(t.loading).toEqual([true, false, true, false]);
    sub.unsubscribe();
    tick(120000);
  }));

  it('an error keeps the last snapshot and marks it stale; the next good answer clears it', fakeAsync(() => {
    let fail = false;
    const t = setup(p => fail ? throwError(new Error('503')) : of(GRAPH()));
    const sub = executionGraphFeed(t.service, 'p1', 'now', quiet()).subscribe(s => t.snaps.push(s));
    expect(t.snaps[0].stale).toBe(false);
    fail = true;
    tick(GRAPH_REFRESH_MS);
    expect(t.snaps.length).toBe(2);
    expect(t.snaps[1]).toEqual({ ...t.snaps[0], stale: true });
    fail = false;
    tick(GRAPH_REFRESH_MS);
    expect(t.snaps.length).toBe(3);
    expect(t.snaps[2].stale).toBe(false);
    sub.unsubscribe();
  }));

  it('an error before any data emits an empty stale snapshot and keeps retrying', fakeAsync(() => {
    const t = setup(p => throwError(new Error('down')));
    const sub = executionGraphFeed(t.service, 'p1', 'now', quiet()).subscribe(s => t.snaps.push(s));
    expect(t.snaps[0]).toEqual({ graph: null, range: 'now', fetchedAt: NOW, stale: true });
    tick(GRAPH_REFRESH_MS);
    expect(t.calls.length).toBe(2);
    sub.unsubscribe();
  }));

  it('a never-answering service times out at 10 s: stale snapshot, next call 60 s later', fakeAsync(() => {
    const t = setup(p => NEVER);
    const sub = executionGraphFeed(t.service, 'p1', 'now', quiet()).subscribe(s => t.snaps.push(s));
    expect(GRAPH_REQUEST_TIMEOUT_MS).toBe(10000);
    tick(9999);
    expect(t.snaps.length).toBe(0);
    tick(1);
    expect(t.snaps.length).toBe(1);
    expect(t.snaps[0].stale).toBe(true);
    tick(GRAPH_REFRESH_MS - 1);
    expect(t.calls.length).toBe(1);
    tick(1);
    expect(t.calls.length).toBe(2);
    sub.unsubscribe();
    tick(120000);
  }));

  it('hidden tab pauses, visible resumes at once', fakeAsync(() => {
    const hidden$ = new Subject<boolean>();
    const t = setup();
    const sub = executionGraphFeed(t.service, 'p1', 'now', { now: () => NOW, hidden$ }).subscribe(s => t.snaps.push(s));
    expect(t.calls.length).toBe(1);
    hidden$.next(true);
    tick(5 * GRAPH_REFRESH_MS);
    expect(t.calls.length).toBe(1);
    hidden$.next(false);
    expect(t.calls.length).toBe(2);
    tick(GRAPH_REFRESH_MS);
    expect(t.calls.length).toBe(3);
    sub.unsubscribe();
  }));

  it('hidden while a timer is pending: no call fires', fakeAsync(() => {
    const hidden$ = new Subject<boolean>();
    const t = setup();
    const sub = executionGraphFeed(t.service, 'p1', 'now', { now: () => NOW, hidden$ }).subscribe(s => t.snaps.push(s));
    tick(GRAPH_REFRESH_MS - 1);
    hidden$.next(true);
    tick(5 * GRAPH_REFRESH_MS);
    expect(t.calls.length).toBe(1);
    sub.unsubscribe();
  }));

  it('hidden while a request is in flight: its result emits, nothing is scheduled after', fakeAsync(() => {
    const hidden$ = new Subject<boolean>();
    const t = setup(p => of(GRAPH()).pipe(delay(2000)));
    const sub = executionGraphFeed(t.service, 'p1', 'now', { now: () => NOW, hidden$ }).subscribe(s => t.snaps.push(s));
    tick(1000);
    hidden$.next(true);
    tick(1000);
    expect(t.snaps.length).toBe(1);
    expect(t.snaps[0].stale).toBe(false);
    tick(5 * GRAPH_REFRESH_MS);
    expect(t.calls.length).toBe(1);
    sub.unsubscribe();
  }));

  it('visible again while in flight: no second call', fakeAsync(() => {
    const hidden$ = new Subject<boolean>();
    const t = setup(p => of(GRAPH()).pipe(delay(2000)));
    const sub = executionGraphFeed(t.service, 'p1', 'now', { now: () => NOW, hidden$ }).subscribe(s => t.snaps.push(s));
    tick(500);
    hidden$.next(true);
    hidden$.next(false);
    expect(t.calls.length).toBe(1);
    tick(1500);
    expect(t.snaps.length).toBe(1);
    tick(GRAPH_REFRESH_MS);
    expect(t.calls.length).toBe(2);
    sub.unsubscribe();
    tick(120000);
  }));

  it('repeated visible events start no extra calls', fakeAsync(() => {
    const hidden$ = new Subject<boolean>();
    const t = setup();
    const sub = executionGraphFeed(t.service, 'p1', 'now', { now: () => NOW, hidden$ }).subscribe(s => t.snaps.push(s));
    hidden$.next(false);
    hidden$.next(false);
    expect(t.calls.length).toBe(1);
    sub.unsubscribe();
  }));

  it('unsubscribe stops timers, the refresh trigger and an in-flight request', fakeAsync(() => {
    const refresh$ = new Subject<void>();
    const t = setup(p => of(GRAPH()).pipe(delay(2000)));
    const sub = executionGraphFeed(t.service, 'p1', 'now', quiet({ refresh$ })).subscribe(s => t.snaps.push(s));
    sub.unsubscribe();
    refresh$.next();
    tick(5 * GRAPH_REFRESH_MS);
    expect(t.snaps.length).toBe(0);
    expect(t.calls.length).toBe(1);
    expect(refresh$.observers.length).toBe(0);
  }));

  it('the default hidden$ listener is removed on unsubscribe', fakeAsync(() => {
    const t = setup();
    const added: any[] = [];
    const removed: any[] = [];
    spyOn(document, 'addEventListener').and.callFake((type: string, fn: any) => { if (type === 'visibilitychange') { added.push(fn); } });
    spyOn(document, 'removeEventListener').and.callFake((type: string, fn: any) => { if (type === 'visibilitychange') { removed.push(fn); } });
    const sub = executionGraphFeed(t.service, 'p1', 'now', { now: () => NOW }).subscribe(s => t.snaps.push(s));
    expect(added.length).toBe(1);
    sub.unsubscribe();
    expect(removed).toEqual(added);
    tick(120000);
  }));
});
