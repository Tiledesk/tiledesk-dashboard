import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { MonoTypeOperatorFunction, Observable, of, Subject, Subscription, timer } from 'rxjs';
import { catchError, map, switchMap, take, takeUntil } from 'rxjs/operators';
import { ExecutionsService } from 'app/services/executions.service';
import { RolesService } from 'app/services/roles.service';
import { LoggerService } from 'app/services/logger/logger.service';
import {
  AllowedControl, canViewExecutionData, canViewExecutions, CONTROL_REASONS, ControlName, dataRetentionDays, ExecutionDetail,
  AuditView, GrantInfo, ResumeAction, StateView, Step, ValueOrState, VarHistoryEntry, VarSide, VarView
} from '../executions.models';
import { monitorExecutionsLink } from '../execution-links';
import { auditResultKind, auditResultLabel, auditSentence } from '../execution-audit';
import { canViewExecutionsAudit } from 'app/activities-new/utils/activity-verbs.constants';
import { actionLabel, formatDuration } from '../shared/execution-format';
import { StopDialogComponent, StopDialogData, StopMode } from '../shared/stop-dialog.component';
import { DestroyDialogComponent, DestroyDialogData } from '../shared/destroy-dialog.component';
import { ResumeDialogComponent, ResumeDialogData } from '../shared/resume-dialog.component';
import { StartNewDialogComponent, StartNewDialogData } from '../shared/start-new-dialog.component';
import { DataAccessDialogComponent, DataAccessDialogData } from '../shared/data-access-dialog.component';
import { formatCountdown, GrantSession } from '../shared/grant-session';

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
/** A live block read with a grant is read again on poll only when its step moved, or after this long anyway. */
export const LIVE_REFETCH_MAX_MS = 30000;
/** How long a copy button shows "Copied". */
export const COPIED_MS = 2000;
/** A segment of the "where the time went" strip at least this wide (% of the run) carries its label. */
export const SEG_LABEL_MIN_PCT = 12;

/**
 * The header's primary control, by status: the first of these the API offers. Any other status (completed,
 * failed, destroyed) uses PRIMARY_ENDED. Destroy is never primary: it is the last item of the overflow menu.
 */
const PRIMARY_BY_STATUS: { [status: string]: ControlName[] } = {
  running: ['stop', 'stop_hard_now'],
  waiting: ['stop', 'stop_hard_now'],
  stopping: ['stop_hard_now', 'stop'],
  stopped: ['resume', 'start_new'],
};
const PRIMARY_ENDED: ControlName[] = ['start_new', 'resume'];

/** A slice of the run's time: a block running, or a wait (no block running: waiting for input, or idle). */
export interface TimeSegment {
  kind: 'block' | 'wait';
  /** the block, or for a wait the block it follows (none before the first block) */
  seq?: number;
  /** % of the run from its start */
  left: number;
  /** % of the run it lasted */
  width: number;
  ms: number;
}

/** Where the run's time went: blocks and waits in time order, with their totals. */
export interface TimeSplit {
  segments: TimeSegment[];
  total: number;
  blockMs: number;
  waitMs: number;
  /** the wait after each block, until the next block starts (or the run ends / now) */
  waitAfter: Map<number, number>;
}

export interface RowBar {
  width: number;
  waitLeft: number;
  waitWidth: number;
  waitMs: number;
}

/** An option of the timeline's Block name / Block type filters. */
export interface TimelineFilterOption { value: string; label: string; count: number }

/** The name a timeline row shows for a block: its name, else its id. */
export function stepName(step: Step): string {
  return step.block_name || step.block_id || '';
}

const pct2 = (ms: number, total: number) => Math.round((ms / total) * 10000) / 100;

/**
 * Splits the run [execStart, execStart + total] into the blocks (steps, clamped into the run, overlaps counted once)
 * and the waits between them, in time order. A wait belongs to the block before it; one before the first block has
 * no owner. Null when the start or the span is unknown.
 */
export function timeSplit(execStart: number, total: number, steps: Array<{ seq: number; start: number; end: number }>): TimeSplit | null {
  if (!isFinite(execStart) || !isFinite(total) || total <= 0) return null;
  const runEnd = execStart + total;
  const segments: TimeSegment[] = [];
  const waitAfter = new Map<number, number>();
  let cursor = execStart;
  let prev: number | undefined;
  let blockMs = 0;
  let waitMs = 0;
  const push = (kind: 'block' | 'wait', seq: number | undefined, from: number, to: number) => {
    const ms = to - from;
    if (ms <= 0 && kind === 'wait') return;
    segments.push({ kind, seq, left: pct2(from - execStart, total), width: pct2(ms, total), ms });
    if (kind === 'block') blockMs += ms;
    else {
      waitMs += ms;
      if (seq !== undefined) waitAfter.set(seq, (waitAfter.get(seq) || 0) + ms);
    }
  };
  const sorted = steps.filter(x => isFinite(x.start)).sort((a, b) => a.start - b.start || a.seq - b.seq);
  for (const x of sorted) {
    const start = Math.min(Math.max(x.start, cursor), runEnd);
    const end = Math.min(Math.max(isFinite(x.end) ? x.end : start, start), runEnd);
    push('wait', prev, cursor, start);
    push('block', x.seq, start, end);
    cursor = end;
    prev = x.seq;
  }
  push('wait', prev, cursor, runEnd);
  return { segments, total, blockMs, waitMs, waitAfter };
}

/** A share of the run as text: "<1%" for a sliver, else whole percent. */
export function pctLabel(ms: number, total: number): string {
  if (!total || ms <= 0) return '0%';
  const p = (ms / total) * 100;
  return p < 1 ? '<1%' : Math.round(p) + '%';
}

export interface Kpi {
  key: 'duration' | 'blocks' | 'actions' | 'failure_conditions' | 'errors' | 'vars_changed';
  /** i18n key of the label (Executions.Detail.Kpi.*) */
  labelKey: string;
  value: string;
  /** the tile's accent: bad (errors), warn (failure conditions), else neutral */
  tone: 'neutral' | 'warn' | 'bad';
  hintKey?: string;
}

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
/** 403 codes of a value read whose grant the service no longer honours. */
const GRANT_REFUSALS = ['grant_invalid', 'grant_out_of_scope'];

/**
 * What a failed read may log: the status and the API's error code. Never the response body: on a read made with
 * a grant (state, history, trigger, stored input) it could hold values.
 */
export function errorSummary(err: any): { status: number | null; error: string | null } {
  const status = httpStatus(err);
  return { status: typeof status === 'number' ? status : null, error: errorCode(err) };
}

export interface TimelineItem {
  step: Step;
}

interface StateSlot {
  view: StateView | null;
  loading: boolean;
  error: boolean;
  /** fetched while the step was still running: refetched on poll */
  live: boolean;
  sub?: Subscription;
  /** the grant the view was read with (it holds values): dropped when that grant ends */
  grantId?: string | null;
  /** the step as it was when the read was sent (stepFingerprint), and when (now()) */
  fp?: string;
  fetchedAt?: number;
}

/** What moves while a block runs: a read with a grant is repeated on poll only when this changed. */
export function stepFingerprint(step: Step | undefined): string {
  if (!step) return '';
  const actions = step.actions || [];
  const last = actions[actions.length - 1];
  return JSON.stringify([step.ended_at, step.outcome, step.changed_keys, actions.length,
    last ? last.at : null, last ? last.outcome : null, last ? last.duration_ms : null]);
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

  tab: 'timeline' | 'state' | 'audit' = 'timeline';

  // Audit tab (owner or executions_audit_read), newest first, 50 per page
  canViewAudit = false;
  auditEntries: AuditView[] = [];
  auditNext: string | null = null;
  auditLoading = false;
  auditError = false;
  readonly auditSentence = auditSentence;
  readonly auditResultLabel = auditResultLabel;
  readonly auditResultKind = auditResultKind;
  failedOnly = false;
  /** Timeline filters (feedback 2026-11-13): block names, and action types a block must contain one of; empty = any. */
  blockNames: string[] = [];
  blockTypes: string[] = [];
  /** Their options, from the loaded steps (rebuilt with each detail), each with its number of blocks. */
  blockNameOptions: TimelineFilterOption[] = [];
  blockTypeOptions: TimelineFilterOption[] = [];
  expanded = new Set<number>();
  /** Incoming-message rows shown open (their keys), by `${seq}:${by}`. */

  /** What a copy button just copied ("Copied" for COPIED_MS). */
  copied: 'version' | 'id' | 'link' | null = null;
  private copiedSub: Subscription | null = null;
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
  /** the grant the history was read with (it holds values): reloaded without when that grant ends */
  historyGrantId: string | null = null;

  // data access (Phase 4): one grant per page, values only in memory
  canViewData = false;
  readonly session = new GrantSession();
  grantRemaining = 0;
  /** the active grant and the execution it belongs to (revoked there on Close or when leaving it) */
  private grantFor: { pid: string; id: string; grantId: string } | null = null;
  private destroyed = false;
  /** false while leaving the execution: views read with the grant are dropped, not read again */
  private reloadAfterGrant = true;
  /** the grant the trigger input (triggerSide, in the strip) was read with: an execution grant */
  triggerGrantId: string | null = null;

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

    this.session.remaining$.pipe(takeUntil(this.destroy$)).subscribe(s => (this.grantRemaining = s));
    this.session.ended$.pipe(takeUntil(this.destroy$)).subscribe(id => {
      if (!this.session.active) this.grantFor = null;
      this.clearGrantData(id);
    });

    this.rolesService.listenToProjectUserPermissions(this.destroy$);
    this.rolesService.getUpdateRequestPermission().pipe(takeUntil(this.destroy$)).subscribe(status => {
      // '' is the service's initial value: the role is not known yet (no "unauthorized" flash)
      if (!status || !status.role) { this.permitted = null; return; }
      this.permitted = canViewExecutions(status.role, status.matchedPermissions);
      this.canViewData = this.permitted && canViewExecutionData(status.role, status.matchedPermissions);
      this.canViewAudit = this.permitted && canViewExecutionsAudit(status.role, status.matchedPermissions);
      if (!this.canViewAudit && this.tab === 'audit') this.tab = 'timeline';
      // the role lost data access while a grant is open: close it and drop the values
      if (!this.canViewData && (this.session.active || this.grantFor)) this.endGrant(true);
      if (this.permitted && this.configured && !this.started) this.start();
    });
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.endGrant(true, false);
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
    // a grant belongs to one execution: leaving it closes the grant
    this.endGrant(true, false);
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
    this.auditEntries = [];
    this.auditNext = null;
    this.auditLoading = false;
    this.auditError = false;
    if (this.tab === 'audit') this.tab = 'timeline';
    this.closeHistory();
    this.clearTrigger();
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
    this.timeline = steps.map(step => ({ step }));
    this.buildFilterOptions(steps);
    this.actionTitles = {};
    steps.forEach(s => (s.actions || []).forEach(a => {
      if (a.action_id) this.actionTitles[a.action_id] = actionLabel(a);
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

  /**
   * States fetched while their block was running are stale: refetch the visible ones, drop the others. A view read
   * with the active grant is read again only when its step moved (or LIVE_REFETCH_MAX_MS later): every read with a
   * grant is a data_viewed entry in the audit log.
   */
  private refreshLiveStates() {
    Object.keys(this.states).map(Number).forEach(seq => {
      const slot = this.states[seq];
      if (!slot.live) return;
      if (this.isVisible(seq)) {
        const unchanged = !!slot.grantId && slot.grantId === this.session.grantId && !slot.error
          && (!!slot.view || slot.loading) && slot.fp === stepFingerprint(this.stepBySeq(seq))
          && this.now() - (slot.fetchedAt || 0) < LIVE_REFETCH_MAX_MS;
        if (!unchanged) this.loadState(seq, true);
      } else {
        if (slot.sub) slot.sub.unsubscribe();
        delete this.states[seq];
      }
    });
  }

  // ---- flow state per block, loaded on demand and cached while the page lives ----

  /**
   * Loads a block's state, with the active grant when it covers the block (values) or without it (masks). A cached
   * view read with another grant (or none) than the one that applies now is read again, so a covered block never
   * shows masks from before the grant. `force` reads again in any case (polls of a live block, a new grant).
   */
  loadState(seq: number, force = false) {
    const existing = this.states[seq];
    // the grant this request is made with, fixed now: the slot is marked with it before the answer comes
    const grantId = this.session.covers(seq) ? this.session.grantId : null;
    const sameGrant = !!existing && (existing.grantId || null) === grantId;
    if (existing && !force && sameGrant && (existing.view || existing.loading)) return;
    if (existing && existing.sub) existing.sub.unsubscribe();
    // a refetch keeps the old view until the new one arrives, unless it was read with another grant
    const step = this.stepBySeq(seq);
    const slot: StateSlot = {
      view: existing && sameGrant ? existing.view : null, loading: true, error: false, live: existing ? existing.live : false,
      grantId, fp: stepFingerprint(step), fetchedAt: this.now(),
    };
    this.states[seq] = slot;
    const liveAtFetch = !!step && this.isRunningStep(step);
    const req = grantId
      ? this.executionsService.state(this.projectId, this.executionId, seq, grantId)
      : this.executionsService.state(this.projectId, this.executionId, seq);
    slot.sub = req
      .pipe(this.grantGuard<StateView>(grantId), takeUntil(this.reset$), takeUntil(this.destroy$))
      .subscribe({
        next: view => {
          // values only while the grant they were read with is still the active one
          if (grantId && !this.session.accept(grantId)) return;
          if (this.states[seq] !== slot) return;
          slot.view = view; slot.loading = false; slot.live = liveAtFetch;
        },
        error: err => {
          slot.loading = false;
          slot.error = true;
          this.logger.error('[EXECUTION-DETAIL] state error ', errorSummary(err));
          this.onGrantReadError(grantId, err);
        }
      });
  }

  retryState(seq: number) {
    this.loadState(seq, true);
  }

  // ---- timeline ----

  /** Not successful, block names and block types, combined (AND). */
  get visibleTimeline(): TimelineItem[] {
    if (!this.hasTimelineFilters) return this.timeline;
    const names = this.blockNames.length ? new Set(this.blockNames) : null;
    const types = this.blockTypes.length ? new Set(this.blockTypes) : null;
    return this.timeline.filter(({ step }) =>
      (!this.failedOnly || step.outcome !== 'success')
      && (!names || names.has(stepName(step)))
      && (!types || (step.actions || []).some(a => !!a.type && types.has(a.type))));
  }

  get hasTimelineFilters(): boolean {
    return this.failedOnly || this.blockNames.length > 0 || this.blockTypes.length > 0;
  }

  /** The Not successful filter: expanded blocks it shows again are loaded (with the grant when it covers them). */
  setFailedOnly(v: boolean) {
    this.failedOnly = v;
    this.onTimelineFilter();
  }

  setBlockNames(names: string[] | null) {
    this.blockNames = names || [];
    this.onTimelineFilter();
  }

  setBlockTypes(types: string[] | null) {
    this.blockTypes = types || [];
    this.onTimelineFilter();
  }

  clearTimelineFilters() {
    this.failedOnly = false;
    this.blockNames = [];
    this.blockTypes = [];
    this.onTimelineFilter();
  }

  /** Expanded blocks a filter change shows again are loaded. */
  private onTimelineFilter() {
    this.visibleSeqs().forEach(seq => this.loadState(seq));
  }

  /** Block names and action types of the run, A→Z, each with the number of blocks that have it. */
  private buildFilterOptions(steps: Step[]) {
    const names = new Map<string, number>();
    const types = new Map<string, number>();
    steps.forEach(step => {
      const name = stepName(step);
      names.set(name, (names.get(name) || 0) + 1);
      new Set((step.actions || []).map(a => a.type).filter(t => !!t)).forEach(t => types.set(t, (types.get(t) || 0) + 1));
    });
    const options = (m: Map<string, number>): TimelineFilterOption[] => Array.from(m.entries())
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => a.label.localeCompare(b.label));
    this.blockNameOptions = options(names);
    // no friendlier name per type exists in the dashboard (see actionLabel): the raw type
    this.blockTypeOptions = options(types);
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

  /** The execution's time span (ms): its duration, or now − start while it can still move (or has no duration). */
  private timeSpan(): { start: number; total: number } | null {
    const e = this.detail && this.detail.execution;
    const start = e && e.started_at ? Date.parse(e.started_at) : NaN;
    if (isNaN(start)) return null;
    const running = POLL_STATUSES.includes(e.status) || e.duration_ms == null;
    return { start, total: running ? this.now() - start : e.duration_ms };
  }

  /** The execution's duration for the Duration tile (elapsed so far while it runs). */
  get executionDurationMs(): number | null {
    const span = this.timeSpan();
    if (span) return span.total;
    const e = this.detail && this.detail.execution;
    return e ? e.duration_ms : null;
  }

  /** A block's [start, end] in ms; an open block runs up to now, one with no end and not running lasts 0. */
  private stepSpan(step: Step): { start: number; end: number } {
    const start = step.started_at ? Date.parse(step.started_at) : NaN;
    let end = step.ended_at ? Date.parse(step.ended_at) : NaN;
    if (isNaN(end)) end = step.duration_ms != null ? start + step.duration_ms : this.isRunningStep(step) ? this.now() : start;
    return { start, end };
  }

  /** Where the run's time went, over all its blocks (not only the filtered ones). Null when its start is unknown. */
  timeSplit(): TimeSplit | null {
    const span = this.timeSpan();
    if (!span) return null;
    const steps = (this.detail.steps || []).map(st => ({ seq: st.seq, ...this.stepSpan(st) }));
    return timeSplit(span.start, span.total, steps);
  }

  /** A row's bar in the split. */
  /** The block the strip and the rows highlight together (hovered in either). */
  hlSeq: number | null = null;

  setHl(seq: number | null | undefined) {
    this.hlSeq = seq == null ? null : seq;
  }

  /** A block's segment was clicked: open its row (never closes it) and bring it into view. */
  openFromSplit(seq: number | undefined) {
    if (seq == null) return;
    const step = this.stepOf(seq);
    if (!step) return;
    if (!this.expanded.has(seq)) this.toggleStep(step);
    setTimeout(() => {
      const row = document.getElementById('tl-step-' + seq);
      if (row && row.scrollIntoView) row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }

  readonly SEG_LABEL_MIN_PCT = SEG_LABEL_MIN_PCT;

  /** A block's time in ms (0 when its start is unknown). */
  stepMs(step: Step): number {
    const x = this.stepSpan(step);
    return isNaN(x.start) ? 0 : Math.max(x.end - x.start, 0);
  }

  private stepOf(seq: number): Step | undefined {
    return (this.detail && this.detail.steps || []).find(st => st.seq === seq);
  }

  /** A split segment's block name, for its tooltip. */
  segName(seq: number): string {
    const st = this.stepOf(seq);
    return st ? stepName(st) : '';
  }

  /** A split segment's colour: its block's outcome, running while open. */
  segOutcome(seq: number): string {
    const st = this.stepOf(seq);
    if (!st) return 'none';
    return st.outcome || (this.isRunningStep(st) ? 'running' : 'none');
  }

  readonly pctLabel = pctLabel;

  /** The six summary tiles, from the detail's own counters. */
  get kpis(): Kpi[] {
    if (!this.detail) return [];
    const e = this.detail.execution;
    const t = (k: string) => 'Executions.Detail.Kpi.' + k;
    const n = (v: number | null | undefined) => String(typeof v === 'number' && isFinite(v) ? v : 0);
    const blocks = typeof e.steps_count === 'number' ? e.steps_count : (this.detail.steps || []).length;
    const errors = e.errors || 0;
    const fc = e.failure_conditions || 0;
    return [
      { key: 'duration', labelKey: t('Duration'), value: formatDuration(this.executionDurationMs), tone: 'neutral' },
      { key: 'blocks', labelKey: t('Blocks'), value: n(blocks), tone: 'neutral' },
      { key: 'actions', labelKey: t('Actions'), value: n(e.actions_count), tone: 'neutral' },
      { key: 'failure_conditions', labelKey: t('FailureConditions'), value: n(fc), tone: fc > 0 ? 'warn' : 'neutral' },
      { key: 'errors', labelKey: t('Errors'), value: n(errors), tone: errors > 0 ? 'bad' : 'neutral', hintKey: t('ErrorsHint') },
      { key: 'vars_changed', labelKey: t('VarsChanged'), value: n(e.vars_changed), tone: 'neutral' },
    ];
  }

  trackByKpi(_: number, k: Kpi) {
    return k.key;
  }

  // ---- Flow state tab ----

  setTab(tab: 'timeline' | 'state' | 'audit') {
    if (tab === 'audit' && !this.canViewAudit) return;
    this.tab = tab;
    if (tab === 'state' && this.fsSeq !== null) this.loadState(this.fsSeq);
    if (tab === 'audit') this.loadAudit(false);
  }

  // ---- Audit tab ----

  /** First page (more = false, replaces the list) or the next one by `next_cursor` (appends). */
  loadAudit(more: boolean) {
    if (!this.canViewAudit || this.auditLoading || !this.executionId) return;
    if (more && !this.auditNext) return;
    const pid = this.projectId;
    const id = this.executionId;
    this.auditLoading = true;
    this.auditError = false;
    this.executionsService.audit(pid, id, more ? this.auditNext : null).pipe(takeUntil(this.destroy$)).subscribe({
      next: page => {
        if (pid !== this.projectId || id !== this.executionId) return;
        this.auditEntries = more ? [...this.auditEntries, ...page.entries] : page.entries;
        this.auditNext = page.next_cursor || null;
        this.auditLoading = false;
      },
      error: err => {
        this.logger.error('[EXECUTION-DETAIL] audit error ', errorSummary(err));
        if (pid !== this.projectId || id !== this.executionId) return;
        this.auditLoading = false;
        this.auditError = true;
      }
    });
  }

  trackByAudit(_i: number, e: AuditView) { return e.audit_id; }

  auditText(e: AuditView): string {
    return auditSentence(e, this.executionId, this.detail ? this.detail.execution.agent_name : '', this.blockNameOf);
  }

  /** Block name by step_seq on this execution, for the audit rows. */
  private readonly blockNameOf = (seq: number): string | null => {
    const step = this.stepBySeq(seq);
    return step ? step.block_name || null : null;
  };

  goToActivities() {
    this.router.navigate(['/project', this.projectId, 'activities']);
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

  /** The Flow state tab block was read with the active grant and the grant covers it: values, not masks. */
  get fsCovered(): boolean {
    const slot = this.fsSlot;
    return !!slot && !!slot.grantId && slot.grantId === this.session.grantId && this.session.covers(this.fsSeq);
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

  /** Loads the open history, with the active grant if any (the service adds values only in the blocks it covers). */
  loadHistory() {
    if (this.historySub) this.historySub.unsubscribe();
    const grantId = this.session.grantId;
    this.history = null;
    this.historyLoading = true;
    this.historyError = false;
    // marked at request time: if the grant ends before the answer, clearGrantData finds and drops this load
    this.historyGrantId = grantId;
    const req = grantId
      ? this.executionsService.history(this.projectId, this.executionId, this.historyKey, grantId)
      : this.executionsService.history(this.projectId, this.executionId, this.historyKey);
    this.historySub = req
      .pipe(this.grantGuard<VarHistoryEntry[]>(grantId), takeUntil(this.reset$), takeUntil(this.destroy$))
      .subscribe({
        next: entries => {
          if (grantId && !this.session.accept(grantId)) return;
          this.history = entries || []; this.historyLoading = false;
        },
        error: err => {
          this.historyLoading = false;
          this.historyError = true;
          this.logger.error('[EXECUTION-DETAIL] history error ', errorSummary(err));
          this.onGrantReadError(grantId, err);
        }
      });
  }

  closeHistory() {
    if (this.historySub) this.historySub.unsubscribe();
    this.historySub = null;
    this.historyKey = null;
    this.history = null;
    this.historyGrantId = null;
    this.historyLoading = false;
    this.historyError = false;
  }

  // ---- data access (Phase 4 spec §5): View data, the grant strip, Close ----

  /**
   * Opens the data access dialog: from the header on the whole execution (`stepSeq` null), from a block's
   * "View values" with "this block" preselected. The grant it returns starts the session.
   */
  openDataAccess(stepSeq: number | null = null) {
    if (!this.canViewData || !this.detail) return;
    const pid = this.projectId;
    const id = this.executionId;
    const step = stepSeq === null ? undefined : this.stepBySeq(stepSeq);
    const data: DataAccessDialogData = {
      projectId: pid,
      executionId: id,
      stepSeq: step ? step.seq : null,
      blockName: step ? step.block_name || null : null,
      retentionDays: dataRetentionDays(this.detail.execution),
    };
    // not cut by reset$/destroy$: a grant that comes back after the page moved on must still be revoked
    this.dialog.open(DataAccessDialogComponent, { data, width: '520px' }).afterClosed()
      .pipe(take(1))
      .subscribe((info: GrantInfo | null) => {
        if (!info || typeof info.grant_id !== 'string') return;
        if (this.destroyed || id !== this.executionId || pid !== this.projectId || !this.canViewData) {
          this.revoke(pid, id, info.grant_id);
          return;
        }
        // an active grant for the same scope comes back with the same id: it is already open
        if (this.session.grantId === info.grant_id) return;
        // a new grant replaces the open one
        if (this.session.active || this.grantFor) this.endGrant(true);
        this.session.start(info, info.received_at);
        if (this.session.active) {
          this.grantFor = { pid, id, grantId: info.grant_id };
          this.reloadWithGrant();
        }
      });
  }

  /**
   * A read made with the active grant was refused because the service no longer honours that grant (revoked or
   * expired there, out of scope, data gone): the session ends here too and the values go with it. The service has
   * closed it already, so no revoke. Refusals of reads made without a grant, and other errors, leave the grant open.
   */
  private onGrantReadError(grantId: string | null, err: any) {
    if (!grantId || this.session.grantId !== grantId) return;
    const status = httpStatus(err);
    const code = errorCode(err);
    if ((status === 403 && GRANT_REFUSALS.includes(code)) || status === 410) this.endGrant(false);
  }

  /** A read made with a grant goes through the session's guard (dropped once that grant ended or was replaced). */
  private grantGuard<T>(grantId: string | null): MonoTypeOperatorFunction<T> {
    return grantId ? this.session.guard<T>(grantId) : (source: Observable<T>) => source;
  }

  /**
   * A grant started (or replaced another): the visible blocks it covers, the open history and, for the whole
   * execution, the trigger input are read again with it. Forced, so the reloads without a grant made when the
   * previous one ended are cancelled and cannot land over the values.
   */
  private reloadWithGrant() {
    this.visibleSeqs().filter(seq => this.session.covers(seq)).forEach(seq => this.loadState(seq, true));
    if (this.historyKey) this.loadHistory();
    const scope = this.session.scope;
    if (scope && scope.type === 'execution') this.loadTrigger();
  }

  /** Blocks on screen: expanded and not hidden by the timeline filter, or picked in the Flow state tab. */
  private visibleSeqs(): number[] {
    const seqs = new Set<number>(this.visibleTimeline.map(i => i.step.seq).filter(seq => this.expanded.has(seq)));
    if (this.tab === 'state' && this.fsSeq !== null) seqs.add(this.fsSeq);
    return Array.from(seqs);
  }

  private isVisible(seq: number): boolean {
    return this.visibleSeqs().includes(seq);
  }

  // ---- trigger input (execution grant only), shown in the strip ----

  /** the side the strip's value cell shows (built once per answer) */
  triggerSide: VarSide | null = null;
  triggerLoading = false;
  triggerError = false;
  private triggerSub: Subscription | null = null;

  /** Whether the strip shows the trigger input: only an execution grant opens it. */
  get showTrigger(): boolean {
    const scope = this.session.scope;
    return !!scope && scope.type === 'execution';
  }

  loadTrigger() {
    const grantId = this.session.grantId;
    const scope = this.session.scope;
    if (!grantId || !scope || scope.type !== 'execution') return;
    this.clearTrigger();
    this.triggerGrantId = grantId;
    this.triggerLoading = true;
    this.triggerSub = this.executionsService.triggerData(this.projectId, this.executionId, grantId)
      .pipe(this.grantGuard<ValueOrState>(grantId), takeUntil(this.reset$), takeUntil(this.destroy$))
      .subscribe({
        next: r => {
          if (!this.session.accept(grantId) || this.triggerGrantId !== grantId) return;
          const v: ValueOrState = r && typeof r === 'object' ? r : {};
          this.triggerSide = { type: null, size: null, hash: null, value: v.value, value_state: v.value_state };
          this.triggerLoading = false;
        },
        error: err => {
          if (this.triggerGrantId !== grantId) return;
          this.triggerLoading = false;
          this.triggerError = true;
          this.logger.error('[EXECUTION-DETAIL] trigger error ', errorSummary(err));
          this.onGrantReadError(grantId, err);
        }
      });
  }

  /** Drops the trigger input from memory (and any read of it in flight). */
  private clearTrigger() {
    if (this.triggerSub) this.triggerSub.unsubscribe();
    this.triggerSub = null;
    this.triggerSide = null;
    this.triggerGrantId = null;
    this.triggerLoading = false;
    this.triggerError = false;
  }

  /** For the history drawer: the blocks whose values it may show. */
  readonly coversStep = (stepSeq: number | null): boolean => this.session.covers(stepSeq);

  /** Close: revokes the grant on the service; values go with it. */
  closeGrant() {
    this.endGrant(true);
  }

  get grantCountdown(): string {
    return formatCountdown(this.grantRemaining);
  }

  /** Strip text for the scope: the whole execution or the block's name. */
  get grantScopeLabel(): { key: string; params?: { [k: string]: string } } {
    const scope = this.session.scope;
    if (!scope || scope.type === 'execution') return { key: 'Executions.DataAccess.StripScopeExecution' };
    const step = this.stepBySeq(scope.step_seq);
    return { key: 'Executions.DataAccess.StripScopeStep', params: { block: (step && step.block_name) || String(scope.step_seq) } };
  }

  /**
   * Ends the session; `revoke` also tells the service (Close, leaving the execution). Expiry needs no revoke.
   * `reload` false when leaving the execution: the views are dropped without reading them again.
   */
  private endGrant(revoke: boolean, reload = true) {
    const ctx = this.grantFor;
    this.grantFor = null;
    this.reloadAfterGrant = reload;
    try {
      this.session.end();
    } finally {
      this.reloadAfterGrant = true;
    }
    if (revoke && ctx) this.revoke(ctx.pid, ctx.id, ctx.grantId);
  }

  private revoke(pid: string, id: string, grantId: string) {
    this.executionsService.revokeDataAccess(pid, id, grantId).subscribe({
      error: err => this.logger.warn('[EXECUTION-DETAIL] revoke error ', errorSummary(err)),
    });
  }

  /** A hidden tab throttles the countdown: when it is shown again, a grant past its deadline ends at once. */
  @HostListener('document:visibilitychange')
  onVisibilityChange() {
    this.session.checkExpiry();
  }

  /**
   * The grant ended (Close, expiry, replaced, page left): every view read with it is dropped from memory. Visible
   * blocks and the open history are read again without values; the others are dropped.
   */
  private clearGrantData(grantId: string) {
    Object.keys(this.states).map(Number).forEach(seq => {
      const slot = this.states[seq];
      if (!slot.grantId || slot.grantId !== grantId) return;
      if (slot.sub) slot.sub.unsubscribe();
      delete this.states[seq];
      if (this.isVisible(seq) && this.detail && this.reloadAfterGrant) this.loadState(seq);
    });
    if (this.historyGrantId === grantId) {
      if (this.historySub) this.historySub.unsubscribe();
      this.historySub = null;
      this.historyGrantId = null;
      this.history = null;
      this.historyLoading = false;
      if (this.historyKey && this.detail && this.reloadAfterGrant) this.loadHistory();
    }
    if (this.triggerGrantId === grantId) this.clearTrigger();
  }

  // ---- controls (spec §11.5, §11.8) ----

  /** The controls the API allows for the status; none when the service is not configured. */
  get controls(): AllowedControl[] {
    if (!this.configured || !this.detail || !Array.isArray(this.detail.allowed_controls)) return [];
    return this.detail.allowed_controls
      .filter(c => c && typeof c === 'object' && CONTROL_NAMES.includes(c.name))
      .sort((a, b) => CONTROL_NAMES.indexOf(a.name) - CONTROL_NAMES.indexOf(b.name));
  }

  /** The header's main button: the control for the status (PRIMARY_BY_STATUS), never destroy. */
  get primaryControl(): AllowedControl | null {
    const cs = this.controls.filter(c => c.name !== 'destroy');
    if (!cs.length) return null;
    const pref = PRIMARY_BY_STATUS[this.detail.execution.status] || PRIMARY_ENDED;
    for (const name of pref) {
      const c = cs.find(x => x.name === name);
      if (c) return c;
    }
    return cs[0];
  }

  /** The overflow menu's controls: the others but destroy (that one is last, apart: destroyControl). */
  get menuControls(): AllowedControl[] {
    const p = this.primaryControl;
    return this.controls.filter(c => c.name !== 'destroy' && (!p || c.name !== p.name));
  }

  get destroyControl(): AllowedControl | null {
    return this.controls.find(c => c.name === 'destroy') || null;
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

  /**
   * The action running now: in the last step still open, the last action with no outcome yet.
   * The API has no current-action field before a stop (interrupted_action is set by the stop).
   * Null when none is open: the dialog then says "the current action", never a finished one.
   */
  currentActionTitle(): string | null {
    const steps = (this.detail && this.detail.steps) || [];
    for (let i = steps.length - 1; i >= 0; i--) {
      if (!this.isRunningStep(steps[i])) continue;
      const actions = steps[i].actions || [];
      for (let k = actions.length - 1; k >= 0; k--) {
        const a = actions[k];
        if (a.outcome == null && a.duration_ms == null) return actionLabel(a);
      }
    }
    return null;
  }

  /**
   * Actions are recorded when they complete, so a block whose action hangs shows none of it. For a block still open
   * (no ended_at) while the execution can still move (running, waiting, stopping), the next action: its index is the
   * number of recorded ones, its label comes the way currentActionTitle() finds it (or the interrupted action with
   * that index), and its elapsed time runs from the last recorded action's end, else from the block's start.
   * A stopped execution has none: its stop banner names the interrupted action.
   */
  runningAction(step: Step): { index: number; label: string | null; elapsed: string } | null {
    if (!this.detail || step.ended_at != null || !POLL_STATUSES.includes(this.detail.execution.status)) return null;
    const actions = step.actions || [];
    const index = actions.length;
    const ia = this.detail.execution.interrupted_action;
    const label = (this.isRunningStep(step) && this.currentActionTitle())
      || (ia && ia.index === index ? this.interruptedLabel(ia) : null);
    const last = actions.length ? actions[actions.length - 1].at : null;
    const from = last || step.started_at;
    return { index, label: label || null, elapsed: from ? formatDuration(this.now() - Date.parse(from)) : '' };
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
        this.logger.error('[EXECUTION-DETAIL] start new input error ', errorSummary(err));
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

  /** Version id as the header shows it: short ids as they are, long ones by their tail (full one in the tooltip). */
  shortVersion(v: string | null): string {
    if (!v) return '';
    return v.length > 12 ? '…' + v.slice(-8) : v;
  }

  // ---- copy (version, execution id, the page link) ----

  copy(text: string | null, what: 'version' | 'id' | 'link') {
    const clip = typeof navigator !== 'undefined' ? navigator.clipboard : null;
    if (!text || !clip || typeof clip.writeText !== 'function') return;
    clip.writeText(text).then(
      () => {
        if (this.destroyed) return;
        this.copied = what;
        if (this.copiedSub) this.copiedSub.unsubscribe();
        this.copiedSub = timer(COPIED_MS).pipe(takeUntil(this.destroy$)).subscribe(() => {
          this.copied = null;
          this.copiedSub = null;
        });
      },
      err => this.logger.warn('[EXECUTION-DETAIL] copy error ', err && err.name)
    );
  }

  /** "Copy execution link": the URL of this page. */
  copyExecutionLink() {
    this.copy(window.location.href, 'link');
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
