import { BehaviorSubject, interval, MonoTypeOperatorFunction, Observable, Subject, Subscription } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { GrantInfo, GrantScope } from '../executions.models';

/** The longest a grant can be open (spec §9.7): caps a deadline taken from expires_at alone. */
export const GRANT_MAX_MS = 900000;

/** Seconds as m:ss (the strip countdown). */
export function formatCountdown(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds || 0));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

/**
 * The data access grant open on one execution page (spec §5): its scope, a countdown to expires_at, and the end
 * (Close, expiry, a replacing grant, leaving the page). It holds no value: pages keep the values they read in memory
 * and drop them on `ended$`. Nothing here touches browser storage.
 *
 * Value reads made under a grant go through `guard(grantIdAtRequest)` (or check `accept`), so a response that
 * arrives after the grant ended or was replaced is dropped, never shown.
 *
 * The deadline is local: arrival time + ttl_s (the service's own remaining seconds), so a browser clock off from the
 * server's does not move it. Without ttl_s: expires_at, capped at 15 minutes from arrival. Past the deadline the
 * session covers nothing even when the countdown has not ticked yet (a throttled background tab).
 */
export class GrantSession {
  private info: GrantInfo | null = null;
  /** local clock (ms) at which the grant ends */
  private deadline = 0;
  private tickSub: Subscription | null = null;
  private readonly remainingSubject = new BehaviorSubject<number>(0);
  private readonly endedSubject = new Subject<string>();

  /** Seconds left of the active grant; 0 when none. */
  readonly remaining$: Observable<number> = this.remainingSubject.asObservable();
  /** Emits the grant id when a grant ends (Close, expiry, replaced, page left). */
  readonly ended$: Observable<string> = this.endedSubject.asObservable();

  /** Overridable clock (tests). */
  constructor(private readonly now: () => number = () => Date.now()) { }

  /** A grant is open and its deadline has not passed. */
  get active(): boolean {
    return !!this.info && this.now() < this.deadline;
  }

  get grantId(): string | null {
    return this.active ? this.info.grant_id : null;
  }

  get scope(): GrantScope | null {
    return this.active ? this.info.scope : null;
  }

  get remaining(): number {
    return this.remainingSubject.value;
  }

  /**
   * Starts the grant (a running one ends first); `receivedAt` is when its response arrived (default now). An
   * already expired grant ends at once.
   */
  start(info: GrantInfo, receivedAt?: number) {
    if (this.info) this.end();
    const at = Number.isFinite(receivedAt) ? receivedAt : this.now();
    this.info = info;
    this.deadline = deadlineOf(info, at);
    if (this.secondsLeft() <= 0) {
      this.end();
      return;
    }
    this.remainingSubject.next(this.secondsLeft());
    this.tickSub = interval(1000).subscribe(() => {
      const left = this.secondsLeft();
      this.remainingSubject.next(Math.max(0, left));
      if (left <= 0) this.end();
    });
  }

  /**
   * Whether the grant covers a block (`stepSeq`) or the trigger input (`null`): an execution grant covers all,
   * a step grant only its block.
   */
  covers(stepSeq: number | null): boolean {
    const scope = this.scope;
    if (!scope) return false;
    if (scope.type === 'execution') return true;
    return stepSeq !== null && stepSeq !== undefined && scope.step_seq === stepSeq;
  }

  /** True while the grant a request was made with is still the active one. */
  accept(grantIdAtRequest: string | null): boolean {
    return !!grantIdAtRequest && this.grantId === grantIdAtRequest;
  }

  /** Drops a value response once its grant ended or was replaced (also when subscribed after the end). */
  guard<T>(grantIdAtRequest: string | null): MonoTypeOperatorFunction<T> {
    return (source: Observable<T>) => source.pipe(
      takeUntil(this.ended$.pipe(filter(id => id === grantIdAtRequest))),
      filter(() => this.accept(grantIdAtRequest))
    );
  }

  /** Ends the grant if its deadline passed (call it when a hidden tab becomes visible again). */
  checkExpiry() {
    if (this.info && this.now() >= this.deadline) this.end();
  }

  /** Ends the active grant: clears it and emits `ended$` once. No-op without one. Revoking is the caller's. */
  end() {
    if (!this.info) return;
    const id = this.info.grant_id;
    this.info = null;
    if (this.tickSub) {
      this.tickSub.unsubscribe();
      this.tickSub = null;
    }
    this.remainingSubject.next(0);
    this.endedSubject.next(id);
  }

  private secondsLeft(): number {
    if (!this.info) return 0;
    return Math.ceil((this.deadline - this.now()) / 1000);
  }
}

/** Local deadline: arrival + ttl_s; without it expires_at capped at arrival + 15 min; 0 (ended) when neither is usable. */
function deadlineOf(info: GrantInfo, receivedAt: number): number {
  const ttl = info && info.ttl_s;
  if (typeof ttl === 'number' && Number.isFinite(ttl) && ttl >= 0) return receivedAt + ttl * 1000;
  const until = info ? Date.parse(info.expires_at) : NaN;
  if (!Number.isFinite(until)) return 0;
  return Math.min(until, receivedAt + GRANT_MAX_MS);
}
