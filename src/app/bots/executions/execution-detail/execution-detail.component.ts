import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of, Subject, Subscription, timer } from 'rxjs';
import { catchError, map, switchMap, takeUntil } from 'rxjs/operators';
import { ExecutionsService } from 'app/services/executions.service';
import { RolesService } from 'app/services/roles.service';
import { LoggerService } from 'app/services/logger/logger.service';
import {
  AllowedControl, canViewExecutions, CONTROL_REASONS, ControlName, ExecutionDetail, ResumeAction, StateView, Step,
  VarHistoryEntry, VarView
} from '../executions.models';
import { monitorExecutionsLink } from '../execution-links';
import { formatDuration } from '../shared/execution-format';
import { StopDialogComponent, StopDialogData, StopMode } from '../shared/stop-dialog.component';
import { DestroyDialogComponent, DestroyDialogData } from '../shared/destroy-dialog.component';
import { ResumeDialogComponent, ResumeDialogData } from '../shared/resume-dialog.component';
import { StartNewDialogComponent, StartNewDialogData } from '../shared/start-new-dialog.component';

export const POLL_MS = 2000;
/** A waiting execution can wait for days: poll it less often (2 s again while a control is pending). */
export const POLL_WAITING_MS = 10000;
/** The Flow state tab shows this many variables before "show all" (spec §15). */
export const STATE_TAB_LIMIT = 50;
/** A block may be running (spinner, elapsed time). */
const LIVE_STATUSES = ['running', 'stopping'];
/** The detail polls while the status can still move on its own. */
const POLL_STATUSES = ['running', 'waiting', 'stopping'];
/** Known controls, in the order the buttons are shown (destroy last). */
const CONTROL_NAMES: ControlName[] = ['stop', 'stop_hard_now', 'resume', 'start_new', 'destroy'];
/** After start new, polls this long for the new execution to show in retried_as. */
export const START_NEW_WAIT_MS = 30000;
/** Any pending control gives up after this long without the expected change (also when every poll fails). */
export const PENDING_WAIT_MS = 30000;

export type PendingControl = 'stopping' | 'destroying' | 'resuming' | 'starting';

export interface ControlMessage {
  key: string;
  params?: { [k: string]: string };
  /** not_resumable while start new is allowed: the message offers it. */
  offerStartNew?: boolean;
}

/** Handles a control error itself (true) instead of the generic message. */
type ControlErrorHandler = (err: any) => boolean;

function httpStatus(err: any): number | undefined {
  return err instanceof HttpErrorResponse ? err.status : err && err.status;
}

function errorCode(err: any): string | null {
  const body = err && err.error;
  return body && typeof body === 'object' && typeof body.error === 'string' ? body.error : null;
}
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
  /** :botid of the route (absent on monitor/executions/:executionid) */
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

  // controls (Phase 2): optimistic chip until a poll returns the new status
  pending: PendingControl | null = null;
  controlBusy = false;
  controlMessage: ControlMessage | null = null;
  /** status when the control was sent, and the one the API answered */
  private pendingFrom: string | null = null;
  private pendingTo: string | null = null;
  /** start new: retried_as when it was sent */
  private retriedBefore: string[] = [];
  /** when the pending control was sent (its deadline starts here) */
  private pendingSince = 0;
  /** resume: resumed_at when it was sent; a newer one means the resume was accepted */
  private resumedBefore: string | null = null;
  /** the execution start new created, once retried_as shows it */
  startedId: string | null = null;

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
    private logger: LoggerService,
    private dialog: MatDialog,
    private translate: TranslateService
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
      // '' is the service's initial value: the role is not known yet (no "unauthorized" flash)
      if (!status || !status.role) { this.permitted = null; return; }
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
    this.clearPending();
    this.controlBusy = false;
    this.controlMessage = null;
    this.startedId = null;
  }

  private onLoadError(err) {
    this.loading = false;
    this.logger.error('[EXECUTION-DETAIL] load error ', err);
    // a failed poll keeps the page as it was (and polling goes on); only a first load shows the error state
    if (!this.detail) this.error = true;
    else {
      this.checkPendingDeadline();
      this.updatePolling();
    }
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
    if (this.pending === 'starting' && !this.controlBusy) {
      // the old execution keeps its status: the new one shows up in retried_as
      const retried = (d.lineage && Array.isArray(d.lineage.retried_as)) ? d.lineage.retried_as : [];
      const created = retried.find(r => typeof r === 'string' && !this.retriedBefore.includes(r));
      if (created) {
        this.startedId = created;
        this.clearPending();
        if (this.controlMessage && this.controlMessage.key === 'Executions.Controls.RefireUnconfirmed') this.controlMessage = null;
      } else this.checkPendingDeadline();
    } else if (this.pending && !this.controlBusy) {
      const s = d.execution.status;
      const resumedAt = d.execution.resumed_at || null;
      // a resume that was accepted but ended where it started (failed again) still moves resumed_at
      const resumed = this.pending === 'resuming' && !!resumedAt && resumedAt !== this.resumedBefore;
      if (resumed || s !== this.pendingFrom || (this.pendingTo && s === this.pendingTo)) this.clearPending();
      else this.checkPendingDeadline();
    }
    this.updatePolling();
  }

  /** Ends a pending control the expected change never showed for (not while its request is in flight). */
  private checkPendingDeadline() {
    if (!this.pending || this.controlBusy || this.now() - this.pendingSince < PENDING_WAIT_MS) return;
    const starting = this.pending === 'starting';
    this.clearPending();
    this.controlMessage = { key: starting ? 'Executions.Controls.StartedNotYet' : 'Executions.Controls.PendingTimeout' };
  }

  /** The stop mode and interrupted action describe a stop that is on now, not one that was resumed from. */
  get showStopInfo(): boolean {
    const s = this.detail && this.detail.execution.status;
    return s === 'stopping' || s === 'stopped';
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

  // ---- polling: 2 s after each answer while running or stopping, 10 s while waiting ----

  /**
   * Called after each response or error: the next poll starts POLL_MS later, so a response slower
   * than POLL_MS still lands (switchMap would cancel it if a fixed timer fired meanwhile).
   */
  private updatePolling() {
    this.stopPolling();
    const status = this.detail && this.detail.execution.status;
    if (POLL_STATUSES.includes(status) || this.pending) {
      const delay = status === 'waiting' && !this.pending ? POLL_WAITING_MS : POLL_MS;
      this.pollSub = timer(delay).pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.pollSub = null;
        this.load$.next();
      });
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

  // ---- controls (spec §11.5, §11.8) ----

  /** The controls the API allows for the status; none when the service is not configured. */
  get controls(): AllowedControl[] {
    if (!this.configured || !this.detail || !Array.isArray(this.detail.allowed_controls)) return [];
    return this.detail.allowed_controls
      .filter(c => c && typeof c === 'object' && CONTROL_NAMES.includes(c.name))
      .sort((a, b) => CONTROL_NAMES.indexOf(a.name) - CONTROL_NAMES.indexOf(b.name));
  }

  /** The status chip: start new leaves this execution's status as it is, so it shows no pending chip. */
  get chipPending(): PendingControl | null {
    return this.pending === 'starting' ? null : this.pending;
  }

  /** Tooltip of a disabled control: the role, or why the execution blocks it. */
  noPermissionKey(c: AllowedControl): string {
    if (c.reason && c.reason !== 'role') {
      return CONTROL_REASONS.includes(c.reason) ? 'Executions.Controls.Reasons.' + c.reason : 'Executions.Controls.NotAllowedNone';
    }
    if (c.name === 'destroy') return 'Executions.Controls.NoPermissionDestroy';
    if (c.name === 'resume' || c.name === 'start_new') return 'Executions.Controls.NoPermissionControl';
    return 'Executions.Controls.NoPermissionStop';
  }

  /** Label of the interrupted action: title, type or id, else its position. */
  interruptedLabel(ia: { index?: number | null; action_id?: string | null; type?: string | null; title?: string | null }): string {
    if (!ia) return '';
    return ia.title || ia.type || ia.action_id || (ia.index !== null && ia.index !== undefined ? '#' + ia.index : '');
  }

  messagesWhileStoppedKey(n: number): string {
    return 'Executions.Controls.MessagesWhileStopped' + (n === 1 ? 'One' : '');
  }

  /** The action running now: the last action of the running block. */
  currentActionTitle(): string | null {
    const steps = (this.detail && this.detail.steps) || [];
    const last = steps[steps.length - 1];
    if (!last || !this.isRunningStep(last)) return null;
    const actions = last.actions || [];
    const a = actions[actions.length - 1];
    return a ? a.title || a.type || null : null;
  }

  runControl(c: AllowedControl) {
    if (!c.allowed || this.controlBusy || this.pending || !this.detail) return;
    this.controlMessage = null;
    this.startedId = null;
    const pid = this.projectId;
    const id = this.executionId;
    if (c.name === 'resume') {
      const ia = this.detail.execution.interrupted_action;
      this.openResume(pid, id, { action: (ia && this.interruptedLabel(ia)) || null, calling: false, automation: this.isAutomation() }, false);
      return;
    }
    if (c.name === 'start_new') {
      this.loadStartNew(pid, id);
      return;
    }
    if (c.name === 'destroy') {
      const data: DestroyDialogData = { executionId: id };
      this.dialog.open(DestroyDialogComponent, { data, width: '480px' }).afterClosed()
        .pipe(takeUntil(this.reset$), takeUntil(this.destroy$))
        .subscribe((code: string | null) => {
          if (code && id === this.executionId) this.sendControl('destroying', this.executionsService.destroy(pid, id, code));
        });
      return;
    }
    const data: StopDialogData = { action: this.currentActionTitle(), hardOnly: c.name === 'stop_hard_now' };
    this.dialog.open(StopDialogComponent, { data, width: '480px' }).afterClosed()
      .pipe(takeUntil(this.reset$), takeUntil(this.destroy$))
      .subscribe((mode: StopMode | null) => {
        if ((mode === 'soft' || mode === 'hard') && id === this.executionId) {
          this.sendControl('stopping', this.executionsService.stop(pid, id, mode));
        }
      });
  }

  /** Start new offered by a not_resumable message. */
  offerStartNew() {
    const c = this.controls.find(x => x.name === 'start_new' && x.allowed);
    if (c) this.runControl(c);
  }

  private isAutomation(): boolean {
    const t = this.detail && this.detail.execution.trigger;
    return !!t && t.type === 'automation';
  }

  // ---- resume (spec §9.4): a calling action first asks to confirm (409 confirm_required) ----

  private openResume(pid: string, id: string, data: ResumeDialogData, confirm: boolean) {
    this.dialog.open(ResumeDialogComponent, { data, width: '480px' }).afterClosed()
      .pipe(takeUntil(this.reset$), takeUntil(this.destroy$))
      .subscribe((ok: true | null) => {
        if (ok !== true || id !== this.executionId) return;
        this.sendControl('resuming', this.executionsService.resume(pid, id, confirm), err => {
          if (httpStatus(err) !== 409 || errorCode(err) !== 'confirm_required') return false;
          const action: ResumeAction | null = err.error.action && typeof err.error.action === 'object' ? err.error.action : null;
          this.openResume(pid, id, { action: (action && this.interruptedLabel(action)) || null, calling: true, automation: data.automation }, true);
          return true;
        });
      });
  }

  // ---- start new (spec §9.5, U2): the user confirms the input ----

  private loadStartNew(pid: string, id: string) {
    this.controlBusy = true;
    this.executionsService.startNewInput(pid, id).pipe(takeUntil(this.reset$), takeUntil(this.destroy$)).subscribe({
      next: r => {
        this.controlBusy = false;
        if (id !== this.executionId) return;
        const input = r && r.input && typeof r.input === 'object' && !Array.isArray(r.input) ? r.input : {};
        const masked = r && Array.isArray(r.masked) ? r.masked.filter(m => typeof m === 'string') : [];
        const agentName = this.detail.execution.agent_name || this.detail.execution.agent_id;
        const stored = r && ['ok', 'none', 'unreadable', 'structure_only'].includes(r.stored) ? r.stored : undefined;
        this.openStartNew(pid, id, { agentName, input, masked, stored });
      },
      error: err => {
        this.controlBusy = false;
        this.logger.error('[EXECUTION-DETAIL] start new input error ', err);
        this.controlMessage = this.controlError(err);
        if (httpStatus(err) === 409) this.load$.next();
      }
    });
  }

  private openStartNew(pid: string, id: string, data: StartNewDialogData) {
    this.dialog.open(StartNewDialogComponent, { data, width: '600px' }).afterClosed()
      .pipe(takeUntil(this.reset$), takeUntil(this.destroy$))
      .subscribe((input: { [k: string]: any } | null) => {
        if (!input || typeof input !== 'object' || Array.isArray(input) || id !== this.executionId) return;
        const lineage = this.detail.lineage;
        this.retriedBefore = lineage && Array.isArray(lineage.retried_as) ? lineage.retried_as.slice() : [];
        this.sendControl('starting', this.executionsService.startNew(pid, id, input), err => {
          if (httpStatus(err) !== 400 || errorCode(err) !== 'missing_input') return false;
          const fields = Array.isArray(err.error.fields) ? err.error.fields.filter(f => typeof f === 'string') : [];
          this.openStartNew(pid, id, { ...data, missing: fields, text: JSON.stringify(input, null, 2) });
          return true;
        });
      });
  }

  private sendControl(pending: PendingControl, req: Observable<{ status: string }>, handle?: ControlErrorHandler) {
    this.pending = pending;
    this.pendingFrom = this.detail.execution.status;
    this.pendingTo = null;
    this.pendingSince = this.now();
    this.resumedBefore = this.detail.execution.resumed_at || null;
    this.controlBusy = true;
    req.pipe(takeUntil(this.reset$), takeUntil(this.destroy$)).subscribe({
      next: r => {
        this.controlBusy = false;
        this.pendingTo = (r && r.status) || null;
        // reload now; the chip stays until a response shows the new status
        this.stopPolling();
        this.load$.next();
      },
      error: err => {
        this.controlBusy = false;
        // the server could not confirm the refire (504): the new run may exist, so keep looking for it
        if (pending === 'starting' && httpStatus(err) === 504 && errorCode(err) === 'refire_unconfirmed') {
          this.logger.warn('[EXECUTION-DETAIL] start new unconfirmed ', err);
          this.controlMessage = { key: 'Executions.Controls.RefireUnconfirmed' };
          this.stopPolling();
          this.load$.next();
          return;
        }
        this.clearPending();
        this.logger.error('[EXECUTION-DETAIL] control error ', err);
        if (handle && handle(err)) return;
        this.controlMessage = this.controlError(err);
        const status = httpStatus(err);
        if (status === 409) {
          // the execution moved on its own (stopped and failed are not polled): reload once so the chip is current
          this.stopPolling();
          this.load$.next();
        } else this.updatePolling();
      }
    });
  }

  private controlError(err: any): ControlMessage {
    const status = httpStatus(err);
    const body = err && err.error;
    const code = errorCode(err);
    if (status === 409) {
      const allowed: AllowedControl[] | null = body && Array.isArray(body.allowed) ? body.allowed : null;
      if (allowed && this.detail) this.detail.allowed_controls = allowed;
      if (code === 'busy') return { key: 'Executions.Controls.Busy' };
      if (code === 'already_started') return { key: 'Executions.Controls.AlreadyStarted' };
      if (code === 'not_startable') {
        const reason = body && typeof body.reason === 'string' && body.reason ? body.reason : 'unknown';
        return { key: 'Executions.Controls.NotStartable', params: { reason } };
      }
      if (code === 'not_resumable') {
        const reason = typeof body.reason === 'string' && CONTROL_REASONS.includes(body.reason) && body.reason !== 'role' ? body.reason : 'default';
        const offerStartNew = (allowed || this.controls).some(a => a && a.name === 'start_new' && a.allowed);
        return { key: 'Executions.Controls.NotResumable.' + reason, offerStartNew };
      }
      const names = (allowed || []).filter(a => a && a.allowed && CONTROL_NAMES.includes(a.name))
        .map(a => this.translate.instant('Executions.Controls.' + a.name));
      return names.length
        ? { key: 'Executions.Controls.NotAllowed', params: { allowed: names.join(', ') } }
        : { key: 'Executions.Controls.NotAllowedNone' };
    }
    if (status === 503) return { key: code === 'no_agent_server' ? 'Executions.Controls.NoAgentServer' : 'Executions.Controls.Unavailable' };
    if (status === 502 && code === 'version_check_failed') return { key: 'Executions.Controls.VersionCheckFailed' };
    if (status === 502 && code === 'refire_failed') return { key: 'Executions.Controls.RefireFailed' };
    if (status === 500 && code === 'unseal_failed') return { key: 'Executions.Controls.UnsealFailed' };
    if (status === 400 && code === 'missing_input') return { key: 'Executions.Controls.MissingInput' };
    if (status === 403) return { key: 'Executions.Controls.Forbidden' };
    if (status === 400 && body && body.error === 'confirm_mismatch') return { key: 'Executions.Controls.ConfirmMismatch' };
    return { key: 'Executions.Controls.Failed' };
  }

  private clearPending() {
    this.pending = null;
    this.pendingFrom = null;
    this.pendingTo = null;
  }

  trackByControl(_: number, c: AllowedControl) {
    return c.name;
  }

  // ---- navigation ----

  shortId(id: string | null): string {
    // uuid v7 starts with a timestamp: the random tail tells runs apart
    return id ? id.replace(/-/g, '').slice(-8) : '';
  }

  private agentForLinks(): string {
    return this.routeAgentId || (this.detail && this.detail.execution.agent_id);
  }

  backToList() {
    this.router.navigate(monitorExecutionsLink(this.projectId, this.agentForLinks()));
  }

  openExecution(id: string) {
    if (!id || !ID_RE.test(id)) return;
    this.router.navigate([...monitorExecutionsLink(this.projectId, this.agentForLinks()), id]);
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
