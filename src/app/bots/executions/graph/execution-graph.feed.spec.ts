import { fakeAsync, tick } from '@angular/core/testing';
import { Observable, of, Subject, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ExecutionPage, ExecutionRow } from '../executions.models';
import { executionGraphFeed, GraphSnapshot, GRAPH_REFRESH_MS } from './execution-graph.feed';

const NOW = Date.parse('2026-11-10T12:00:00.000Z');
const r = (id: string) => ({ _id: id, agent_id: 'a1', status: 'running' } as ExecutionRow);
const page = (ids: string[], next: string | null = null): ExecutionPage => ({ items: ids.map(r), next_cursor: next });
const LIVE = 'running,waiting,stopping';

function setup(handler: (params: any) => Observable<ExecutionPage>) {
  const calls: any[] = [];
  const service = { list: (pid: string, params: any) => { calls.push({ pid, params }); return handler(params); } };
  const snaps: GraphSnapshot[] = [];
  return { calls, service: service as any, snaps };
}

describe('executionGraphFeed', () => {
  it('first cycle runs at once with both queries and the exact params', fakeAsync(() => {
    const t = setup(p => of(page([])));
    const sub = executionGraphFeed(t.service, 'p1', { now: () => NOW, hidden$: new Subject<boolean>() }).subscribe(s => t.snaps.push(s));
    expect(t.calls.length).toBe(2);
    expect(t.calls[0]).toEqual({ pid: 'p1', params: { status: LIVE, limit: 100 } });
    expect(t.calls[1]).toEqual({ pid: 'p1', params: { status: 'failed', from: new Date(NOW - 24 * 3600 * 1000).toISOString(), limit: 100 } });
    expect(t.snaps.length).toBe(1);
    expect(t.snaps[0].stale).toBe(false);
    expect(t.snaps[0].fetchedAt).toBe(NOW);
    sub.unsubscribe();
  }));

  it('follows next_cursor up to 3 pages and stops', fakeAsync(() => {
    const t = setup(p => {
      if (p.status !== LIVE) { return of(page([])); }
      const n = p.cursor ? Number(p.cursor) : 0;
      return of(page(['l' + n], String(n + 1)));
    });
    const sub = executionGraphFeed(t.service, 'p1', { now: () => NOW, hidden$: new Subject<boolean>() }).subscribe(s => t.snaps.push(s));
    const live = t.calls.filter(c => c.params.status === LIVE);
    expect(live.length).toBe(3);
    expect(live.map(c => c.params.cursor)).toEqual([undefined, '1', '2']);
    expect(t.snaps[0].live.map(x => x._id)).toEqual(['l0', 'l1', 'l2']);
    sub.unsubscribe();
  }));

  it('duplicate ids across pages are dropped', fakeAsync(() => {
    const t = setup(p => {
      if (p.status === LIVE) { return of(p.cursor ? page(['a', 'b']) : page(['a', 'x'], 'c')); }
      return of(p.cursor ? page(['f1', 'x']) : page(['f1', 'a', 'f2'], 'c'));
    });
    const sub = executionGraphFeed(t.service, 'p1', { now: () => NOW, hidden$: new Subject<boolean>() }).subscribe(s => t.snaps.push(s));
    expect(t.snaps[0].live.map(x => x._id)).toEqual(['a', 'x', 'b']);
    expect(t.snaps[0].failed.map(x => x._id)).toEqual(['f1', 'f2']);
    sub.unsubscribe();
  }));

  it('next cycle 5000 ms after the response, never overlapping', fakeAsync(() => {
    const t = setup(p => of(page([])).pipe(delay(2000)));
    const sub = executionGraphFeed(t.service, 'p1', { now: () => NOW, hidden$: new Subject<boolean>() }).subscribe(s => t.snaps.push(s));
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
    const t = setup(p => fail ? throwError(new Error('503')) : of(page(p.status === LIVE ? ['l1'] : [])));
    const sub = executionGraphFeed(t.service, 'p1', { now: () => NOW, hidden$: new Subject<boolean>() }).subscribe(s => t.snaps.push(s));
    expect(t.snaps[0].stale).toBe(false);
    fail = true;
    tick(GRAPH_REFRESH_MS);
    expect(t.snaps.length).toBe(2);
    expect(t.snaps[1].stale).toBe(true);
    expect(t.snaps[1].live.map(x => x._id)).toEqual(['l1']);
    fail = false;
    tick(GRAPH_REFRESH_MS);
    expect(t.snaps.length).toBe(3);
    expect(t.snaps[2].stale).toBe(false);
    sub.unsubscribe();
  }));

  it('an error before any data emits an empty stale snapshot and keeps retrying', fakeAsync(() => {
    const t = setup(p => throwError(new Error('down')));
    const sub = executionGraphFeed(t.service, 'p1', { now: () => NOW, hidden$: new Subject<boolean>() }).subscribe(s => t.snaps.push(s));
    expect(t.snaps[0]).toEqual({ live: [], failed: [], fetchedAt: NOW, stale: true });
    const n = t.calls.length;
    tick(GRAPH_REFRESH_MS);
    expect(t.calls.length).toBeGreaterThan(n);
    sub.unsubscribe();
  }));

  it('hidden tab pauses, visible resumes at once', fakeAsync(() => {
    const hidden$ = new Subject<boolean>();
    const t = setup(p => of(page([])));
    const sub = executionGraphFeed(t.service, 'p1', { now: () => NOW, hidden$ }).subscribe(s => t.snaps.push(s));
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
    const sub = executionGraphFeed(t.service, 'p1', { now: () => NOW, hidden$: new Subject<boolean>() }).subscribe(s => t.snaps.push(s));
    sub.unsubscribe();
    tick(60000);
    expect(t.calls.length).toBe(2);
  }));

  it('unsubscribe cancels an in-flight request', fakeAsync(() => {
    const t = setup(p => of(page([])).pipe(delay(2000)));
    const sub = executionGraphFeed(t.service, 'p1', { now: () => NOW, hidden$: new Subject<boolean>() }).subscribe(s => t.snaps.push(s));
    sub.unsubscribe();
    tick(60000);
    expect(t.snaps.length).toBe(0);
    expect(t.calls.length).toBe(2);
  }));

  it('hidden while a timer is pending: no call fires', fakeAsync(() => {
    const hidden$ = new Subject<boolean>();
    const t = setup(p => of(page([])));
    const sub = executionGraphFeed(t.service, 'p1', { now: () => NOW, hidden$ }).subscribe(s => t.snaps.push(s));
    tick(GRAPH_REFRESH_MS - 1);
    hidden$.next(true);
    tick(60000);
    expect(t.calls.length).toBe(2);
    sub.unsubscribe();
  }));

  it('hidden while a request is in flight: its result emits, nothing is scheduled after', fakeAsync(() => {
    const hidden$ = new Subject<boolean>();
    const t = setup(p => of(page(['l1'])).pipe(delay(2000)));
    const sub = executionGraphFeed(t.service, 'p1', { now: () => NOW, hidden$ }).subscribe(s => t.snaps.push(s));
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
    const sub = executionGraphFeed(t.service, 'p1', { now: () => NOW, hidden$ }).subscribe(s => t.snaps.push(s));
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
    const sub = executionGraphFeed(t.service, 'p1', { now: () => NOW, hidden$ }).subscribe(s => t.snaps.push(s));
    hidden$.next(false);
    hidden$.next(false);
    expect(t.calls.length).toBe(2);
    sub.unsubscribe();
  }));

  it('hidden then visible while in flight: no double cycle', fakeAsync(() => {
    const hidden$ = new Subject<boolean>();
    const t = setup(p => of(page([])).pipe(delay(2000)));
    const sub = executionGraphFeed(t.service, 'p1', { now: () => NOW, hidden$ }).subscribe(s => t.snaps.push(s));
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
    const sub = executionGraphFeed(t.service, 'p1', { now: () => NOW }).subscribe(s => t.snaps.push(s));
    expect(added.length).toBe(1);
    sub.unsubscribe();
    expect(removed).toEqual(added);
    tick(60000);
  }));
});
