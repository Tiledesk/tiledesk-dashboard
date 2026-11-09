import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject, Subscription, timer } from 'rxjs';
import { catchError, map, switchMap, takeUntil } from 'rxjs/operators';
import { ExecutionsService } from 'app/services/executions.service';
import { RolesService } from 'app/services/roles.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { canViewExecutions, ExecutionDetail, StateView, Step, VarHistoryEntry, VarView } from '../executions.models';
import { formatDuration } from '../shared/execution-format';

export const POLL_MS = 2000;
/** The Flow state tab shows this many variables before "show all" (spec §15). */
export const STATE_TAB_LIMIT = 50;
const LIVE_STATUSES = ['running', 'stopping'];
const ID_RE = /^[A-Za-z0-9_-]{1,128}$/;

export interface OutsideGroup {
  by: string;
  keys: string[];
  textKey: string;
}

export interface TimelineItem {
  step: Step;
  outside: OutsideGroup[];
}

interface StateSlot {
  view: StateView | null;
  loading: boolean;
  error: boolean;
  /** fetched while the step was still running: refetched on poll */
  live: boolean;
  sub?: Subscription;
}

/** Text of an outside-change row, by origin; plural and singular. */
export function outsideTextKey(by: string, n: number): string {
  const base = by === 'message_in' ? 'OutsideMessageIn' : by === 'jump_params' ? 'OutsideJumpParams' : 'OutsideExternal';
  return 'Executions.Detail.' + base + (n === 1 ? 'One' : '');
}

function groupOutside(step: Step): OutsideGroup[] {
  const groups = new Map<string, string[]>();
  (step.outside || []).forEach(c => {
    const by = c.by || 'external';
    if (!groups.has(by)) groups.set(by, []);
    groups.get(by).push(c.key);
  });
  return Array.from(groups.entries()).map(([by, keys]) => ({ by, keys, textKey: outsideTextKey(by, keys.length) }));
}

@Component({
  selector: 'execution-detail',
  templateUrl: './execution-detail.component.html',
  styleUrls: ['./execution-detail.component.scss']
})
export class ExecutionDetailComponent implements OnInit, OnDestroy {

  readonly formatDuration = formatDuration;
  readonly stateTabLimit = STATE_TAB_LIMIT;

  projectId: string | null = null;
  /** :botid of the route (absent on bots/executions/:executionid) */
  routeAgentId: string | null = null;
  executionId: string | null = null;
  invalid = false;
  configured = false;
  permitted: boolean | null = null;

  detail: ExecutionDetail | null = null;
  timeline: TimelineItem[] = [];
  actionTitles: { [actionId: string]: string } = {};
  loading = false;
  error = false;

  tab: 'timeline' | 'state' = 'timeline';
  failedOnly = false;
  expanded = new Set<number>();
  states: { [seq: number]: StateSlot } = {};

  // Flow state tab
  fsSeq: number | null = null;
  fsWhen: 'before' | 'after' = 'after';
  fsShowSystem = false;
  fsShowAll = false;

  // history drawer
  historyKey: string | null = null;
  history: VarHistoryEntry[] | null = null;
  historyLoading = false;
  historyError = false;

  private destroy$ = new Subject<void>();
  /** emits when the execution changes: in-flight state / history loads end */
  private reset$ = new Subject<void>();
  private load$ = new Subject<void>();
  private pollSub: Subscription | null = null;
  private historySub: Subscription | null = null;
  private started = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private executionsService: ExecutionsService,
    private rolesService: RolesService,
    private logger: LoggerService
  ) { }

  ngOnInit() {
    this.configured = this.executionsService.isConfigured();

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const valid = (v: string | null) => (v && ID_RE.test(v) ? v : null);
      this.projectId = valid(params.get('projectid'));
      this.routeAgentId = valid(params.get('botid'));
      this.executionId = valid(params.get('executionid'));
      this.invalid = !this.projectId || !this.executionId;
      this.resetExecution();
      if (this.started && !this.invalid) this.load$.next();
    });

    this.rolesService.listenToProjectUserPermissions(this.destroy$);
    this.rolesService.getUpdateRequestPermission().pipe(takeUntil(this.destroy$)).subscribe(status => {
      this.permitted = canViewExecutions(status.role, status.matchedPermissions);
      if (this.permitted && this.configured && !this.started) this.start();
    });
  }

  ngOnDestroy() {
    this.stopPolling();
    this.reset$.next();
    this.reset$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Overridable clock (elapsed time of the running block). */
  now(): number {
    return Date.now();
  }

  private start() {
    this.started = true;
    // one cancellable request at a time: a route change or a poll replaces the in-flight one
    this.load$.pipe(
      switchMap(() => {
        const id = this.executionId;
        if (!this.detail) this.loading = true;
        return this.executionsService.get(this.projectId, id).pipe(
          map(d => ({ id, d })),
          // handled inside, so the pipeline survives it (Retry and polling keep working)
          catchError(err => { this.onLoadError(err); return of(null); })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe(r => { if (r && r.id === this.executionId) this.onDetail(r.d); });
    if (!this.invalid) this.load$.next();
  }

  retry() {
    this.error = false;
    this.load$.next();
  }

  private resetExecution() {
    this.stopPolling();
    this.reset$.next();
    this.detail = null;
    this.timeline = [];
    this.actionTitles = {};
    this.error = false;
    this.loading = false;
    this.expanded = new Set();
    this.states = {};
    this.fsSeq = null;
    this.fsShowAll = false;
    this.closeHistory();
  }

  private onLoadError(err) {
    this.loading = false;
    this.logger.error('[EXECUTION-DETAIL] load error ', err);
    // a failed poll keeps the page as it was; only a first load shows the error state
    if (!this.detail) this.error = true;
  }

  private onDetail(d: ExecutionDetail) {
    this.loading = false;
    this.error = false;
    this.detail = d;
    const steps = d.steps || [];
    this.timeline = steps.map(step => ({ step, outside: groupOutside(step) }));
    this.actionTitles = {};
    steps.forEach(s => (s.actions || []).forEach(a => {
      if (a.action_id) this.actionTitles[a.action_id] = a.title || a.type || a.action_id;
    }));
    if (this.fsSeq === null && steps.length) this.fsSeq = steps[steps.length - 1].seq;
    this.refreshLiveStates();
    if (this.tab === 'state' && this.fsSeq !== null) this.loadState(this.fsSeq);
    this.updatePolling();
  }

  get isLive(): boolean {
    return !!this.detail && LIVE_STATUSES.includes(this.detail.execution.status);
  }

  /** The block still running: the last one, while the execution is live and it has not ended. */
  isRunningStep(step: Step): boolean {
    if (!this.isLive || !this.detail) return false;
    const steps = this.detail.steps;
    return step.ended_at == null || step.seq === steps[steps.length - 1].seq;
  }

  private stepBySeq(seq: number): Step | undefined {
    return this.detail ? this.detail.steps.find(s => s.seq === seq) : undefined;
  }

  // ---- polling: every 2 s while running (or stopping) ----

  private updatePolling() {
    if (this.isLive) {
      if (!this.pollSub) {
        this.pollSub = timer(POLL_MS, POLL_MS).pipe(takeUntil(this.destroy$)).subscribe(() => this.load$.next());
      }
    } else {
      this.stopPolling();
    }
  }

  private stopPolling() {
    if (this.pollSub) {
      this.pollSub.unsubscribe();
      this.pollSub = null;
    }
  }

  /** States fetched while their block was running are stale: refetch the visible ones, drop the others. */
  private refreshLiveStates() {
    Object.keys(this.states).map(Number).forEach(seq => {
      const slot = this.states[seq];
      if (!slot.live) return;
      const visible = this.expanded.has(seq) || (this.tab === 'state' && this.fsSeq === seq);
      if (visible) {
        this.loadState(seq, true);
      } else {
        if (slot.sub) slot.sub.unsubscribe();
        delete this.states[seq];
      }
    });
  }

  // ---- flow state per block, loaded on demand and cached while the page lives ----

  loadState(seq: number, force = false) {
    const existing = this.states[seq];
    if (existing && !force && (existing.view || existing.loading)) return;
    if (existing && existing.sub) existing.sub.unsubscribe();
    // a refetch keeps the old view until the new one arrives
    const slot: StateSlot = { view: existing ? existing.view : null, loading: true, error: false, live: existing ? existing.live : false };
    this.states[seq] = slot;
    const step = this.stepBySeq(seq);
    const liveAtFetch = !!step && this.isRunningStep(step);
    slot.sub = this.executionsService.state(this.projectId, this.executionId, seq)
      .pipe(takeUntil(this.reset$), takeUntil(this.destroy$))
      .subscribe({
        next: view => { slot.view = view; slot.loading = false; slot.live = liveAtFetch; },
        error: err => {
          slot.loading = false;
          slot.error = true;
          this.logger.error('[EXECUTION-DETAIL] state error ', err);
        }
      });
  }

  retryState(seq: number) {
    this.loadState(seq, true);
  }

  // ---- timeline ----

  get visibleTimeline(): TimelineItem[] {
    return this.failedOnly ? this.timeline.filter(i => i.step.outcome !== 'success') : this.timeline;
  }

  toggleStep(step: Step) {
    if (this.expanded.has(step.seq)) {
      this.expanded.delete(step.seq);
    } else {
      this.expanded.add(step.seq);
      this.loadState(step.seq);
    }
  }

  outcomeIcon(step: Step): string {
    if (this.isRunningStep(step) && !step.outcome) return 'autorenew';
    switch (step.outcome) {
      case 'success': return 'check_circle';
      case 'failure_condition': return 'error_outline';
      case 'error': return 'cancel';
      case 'interrupted': return 'stop_circle';
      default: return 'radio_button_unchecked';
    }
  }

  stepDuration(step: Step): string {
    if (step.duration_ms == null && this.isRunningStep(step) && step.started_at) {
      return formatDuration(this.now() - Date.parse(step.started_at));
    }
    return formatDuration(step.duration_ms);
  }

  // ---- Flow state tab ----

  setTab(tab: 'timeline' | 'state') {
    this.tab = tab;
    if (tab === 'state' && this.fsSeq !== null) this.loadState(this.fsSeq);
  }

  selectStateStep(value: string) {
    const seq = Number(value);
    if (!Number.isInteger(seq) || !this.stepBySeq(seq)) return;
    this.fsSeq = seq;
    this.fsShowAll = false;
    this.loadState(seq);
  }

  setWhen(when: 'before' | 'after') {
    this.fsWhen = when;
    this.fsShowAll = false;
  }

  get fsSlot(): StateSlot | null {
    return this.fsSeq === null ? null : this.states[this.fsSeq] || null;
  }

  /** The whole state at the picked point: every variable present before (or after) the block. */
  get fsVars(): VarView[] {
    const slot = this.fsSlot;
    if (!slot || !slot.view) return [];
    return slot.view.vars
      .filter(v => (this.fsWhen === 'before' ? v.before : v.after) && (this.fsShowSystem || !v.reserved))
      .sort((a, b) => a.key.localeCompare(b.key));
  }

  get fsShown(): VarView[] {
    const all = this.fsVars;
    return this.fsShowAll ? all : all.slice(0, STATE_TAB_LIMIT);
  }

  get fsBlockName(): string {
    const step = this.fsSeq === null ? null : this.stepBySeq(this.fsSeq);
    return step ? step.block_name || String(step.seq) : '';
  }

  // ---- variable history ----

  openHistory(key: string) {
    this.historyKey = key;
    this.loadHistory();
  }

  loadHistory() {
    if (this.historySub) this.historySub.unsubscribe();
    this.history = null;
    this.historyLoading = true;
    this.historyError = false;
    this.historySub = this.executionsService.history(this.projectId, this.executionId, this.historyKey)
      .pipe(takeUntil(this.reset$), takeUntil(this.destroy$))
      .subscribe({
        next: entries => { this.history = entries || []; this.historyLoading = false; },
        error: err => {
          this.historyLoading = false;
          this.historyError = true;
          this.logger.error('[EXECUTION-DETAIL] history error ', err);
        }
      });
  }

  closeHistory() {
    if (this.historySub) this.historySub.unsubscribe();
    this.historySub = null;
    this.historyKey = null;
    this.history = null;
    this.historyLoading = false;
    this.historyError = false;
  }

  // ---- navigation ----

  shortId(id: string | null): string {
    return id ? id.slice(0, 8) : '';
  }

  private agentForLinks(): string {
    return this.routeAgentId || (this.detail && this.detail.execution.agent_id);
  }

  backToList() {
    this.router.navigate(['/project', this.projectId, 'bots', this.agentForLinks(), 'executions']);
  }

  openExecution(id: string) {
    if (!id || !ID_RE.test(id)) return;
    this.router.navigate(['/project', this.projectId, 'bots', this.agentForLinks(), 'executions', id]);
  }

  openConversation() {
    const link = this.detail && this.detail.execution.conversation_link;
    if (link) this.router.navigate(['/project', this.projectId, 'wsrequest', link, 'messages']);
  }

  trackBySeq(_: number, item: TimelineItem) {
    return item.step.seq;
  }

  trackByKey(_: number, v: VarView) {
    return v.key;
  }
}
