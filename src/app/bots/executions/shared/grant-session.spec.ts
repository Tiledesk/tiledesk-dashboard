import { discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { GrantSession, formatCountdown } from './grant-session';
import { GrantInfo } from '../executions.models';

const T0 = Date.parse('2026-11-11T10:00:00.000Z');

function grant(id: string, seconds: number, scope: GrantInfo['scope'] = { type: 'execution' }): GrantInfo {
  return { grant_id: id, expires_at: new Date(T0 + seconds * 1000).toISOString(), scope };
}

describe('GrantSession', () => {
  let clock: number;
  let session: GrantSession;

  beforeEach(() => {
    clock = T0;
    session = new GrantSession(() => clock);
  });

  afterEach(() => session.end());

  /** Moves the session clock and the fake timers together. */
  function advance(ms: number) {
    clock += ms;
    tick(ms);
  }

  it('starts inactive and covers nothing', () => {
    expect(session.active).toBe(false);
    expect(session.grantId).toBeNull();
    expect(session.covers(1)).toBe(false);
    expect(session.covers(null)).toBe(false);
  });

  it('execution scope covers every block and the trigger; step scope only its block', fakeAsync(() => {
    session.start(grant('g1', 900));
    expect(session.covers(1)).toBe(true);
    expect(session.covers(7)).toBe(true);
    expect(session.covers(null)).toBe(true);
    session.start(grant('g2', 900, { type: 'step', step_seq: 3 }));
    expect(session.grantId).toBe('g2');
    expect(session.covers(3)).toBe(true);
    expect(session.covers(4)).toBe(false);
    expect(session.covers(null)).toBe(false);
    session.end();
    discardPeriodicTasks();
  }));

  it('grant session counts down and ends at expiry', fakeAsync(() => {
    const remaining: number[] = [];
    const ended: string[] = [];
    session.remaining$.subscribe(s => remaining.push(s));
    session.ended$.subscribe(id => ended.push(id));
    session.start(grant('g1', 3));
    expect(session.active).toBe(true);
    expect(remaining[remaining.length - 1]).toBe(3);
    advance(1000);
    expect(remaining[remaining.length - 1]).toBe(2);
    advance(1000);
    expect(remaining[remaining.length - 1]).toBe(1);
    expect(session.active).toBe(true);
    advance(1000);
    expect(remaining[remaining.length - 1]).toBe(0);
    expect(session.active).toBe(false);
    expect(session.grantId).toBeNull();
    expect(session.covers(1)).toBe(false);
    expect(ended).toEqual(['g1']);
    // no further ticks after the end
    advance(5000);
    expect(ended).toEqual(['g1']);
  }));

  it('an already expired grant never starts', fakeAsync(() => {
    const ended: string[] = [];
    session.ended$.subscribe(id => ended.push(id));
    session.start(grant('g1', -1));
    expect(session.active).toBe(false);
    expect(ended).toEqual(['g1']);
  }));

  it('end() clears and emits ended$ once; a new start replaces the old grant', fakeAsync(() => {
    const ended: string[] = [];
    session.ended$.subscribe(id => ended.push(id));
    session.start(grant('g1', 900));
    session.start(grant('g2', 900));
    expect(ended).toEqual(['g1']);
    session.end();
    session.end();
    expect(ended).toEqual(['g1', 'g2']);
    expect(session.active).toBe(false);
    advance(1000000);
    expect(ended).toEqual(['g1', 'g2']);
  }));

  it('late value response after expiry is discarded', fakeAsync(() => {
    session.start(grant('g1', 2));
    const idAtRequest = session.grantId;
    const response = new Subject<any>();
    const seen: any[] = [];
    response.pipe(session.guard(idAtRequest)).subscribe(v => seen.push(v));
    response.next({ value: 'in time' });
    expect(seen).toEqual([{ value: 'in time' }]);
    advance(2000);
    expect(session.active).toBe(false);
    response.next({ value: 'late' });
    expect(seen).toEqual([{ value: 'in time' }]);
    expect(session.accept(idAtRequest)).toBe(false);
  }));

  it('a response for a closed or replaced grant is discarded, also when subscribed after the end', fakeAsync(() => {
    session.start(grant('g1', 900));
    const old = session.grantId;
    session.start(grant('g2', 900));
    const seen: any[] = [];
    const response = new Subject<any>();
    response.pipe(session.guard(old)).subscribe(v => seen.push(v));
    response.next({ value: 'stale' });
    expect(seen).toEqual([]);
    expect(session.accept(old)).toBe(false);
    expect(session.accept('g2')).toBe(true);
    expect(session.accept(null)).toBe(false);
    session.end();
    discardPeriodicTasks();
  }));

  it('formats the countdown as m:ss', () => {
    expect(formatCountdown(900)).toBe('15:00');
    expect(formatCountdown(872)).toBe('14:32');
    expect(formatCountdown(9)).toBe('0:09');
    expect(formatCountdown(0)).toBe('0:00');
    expect(formatCountdown(-4)).toBe('0:00');
  });
});
