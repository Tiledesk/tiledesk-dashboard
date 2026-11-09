import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject, Subscription, timer } from 'rxjs';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';
import { ExecutionsService } from 'app/services/executions.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { RolesService } from 'app/services/roles.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { AgentSummary, canViewExecutions, ExecutionListParams, ExecutionRow } from '../executions.models';
import { formatDuration, PERIOD_MS } from '../shared/execution-format';

export const DEFAULT_TRIGGER = 'unattended';
export const DEFAULT_PERIOD = '7d';
export const PAGE_SIZE = 25;
export const POLL_MS = 10000;

export interface ExecutionFilters {
  trigger: string;
  status: string;
  has_failures: boolean;
  period: string;
  q: string;
}

@Component({
  selector: 'executions-list',
  templateUrl: './executions-list.component.html',
  styleUrls: ['./executions-list.component.scss']
})
export class ExecutionsListComponent implements OnInit, OnDestroy {

  readonly triggerOptions = ['unattended', 'all', 'scheduled', 'webhook', 'trigger', 'automation', 'widget', 'channel'];
  readonly statusOptions = ['running', 'waiting', 'stopping', 'stopped', 'failed', 'completed', 'destroyed'];
  readonly periodOptions = ['24h', '7d', '30d'];
  readonly counterStatuses = ['running', 'waiting', 'failed', 'stopped'];
  readonly formatDuration = formatDuration;

  projectId: string;
  agentId: string | null = null;
  configured = false;
  /** null until the role is known */
  permitted: boolean | null = null;

  filters: ExecutionFilters = this.defaultFilters();
  rows: ExecutionRow[] = [];
  nextCursor: string | null = null;
  loading = false;
  loadingMore = false;
  error = false;

  agents: { id: string; name: string }[] = [];
  /** only in the one-agent view (the summary API needs agent ids) */
  counters: AgentSummary | null = null;

  private destroy$ = new Subject<void>();
  private reload$ = new Subject<void>();
  private pollSub: Subscription | null = null;
  private started = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private executionsService: ExecutionsService,
    private faqKbService: FaqKbService,
    private rolesService: RolesService,
    private logger: LoggerService
  ) { }

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('projectid');
    this.agentId = this.route.snapshot.paramMap.get('botid');
    this.configured = this.executionsService.isConfigured();

    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      // values from the URL are validated against the option lists; anything else falls back to the default
      const pick = (name: string, allowed: string[], fallback: string) => {
        const v = params.get(name);
        return allowed.includes(v) ? v : fallback;
      };
      this.filters = {
        trigger: pick('trigger', this.triggerOptions, DEFAULT_TRIGGER),
        status: pick('status', this.statusOptions, ''),
        has_failures: params.get('has_failures') === 'true',
        period: pick('period', this.periodOptions, DEFAULT_PERIOD),
        q: params.get('q') || '',
      };
      if (this.started) this.loadFirstPage();
    });

    this.rolesService.listenToProjectUserPermissions(this.destroy$);
    this.rolesService.getUpdateRequestPermission().pipe(takeUntil(this.destroy$)).subscribe(status => {
      this.permitted = canViewExecutions(status.role, status.matchedPermissions);
      if (this.permitted && this.configured && !this.started) this.start();
    });
  }

  ngOnDestroy() {
    this.stopPolling();
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Overridable clock (the "from" of the period filter). */
  now(): number {
    return Date.now();
  }

  private defaultFilters(): ExecutionFilters {
    return { trigger: DEFAULT_TRIGGER, status: '', has_failures: false, period: DEFAULT_PERIOD, q: '' };
  }

  private start() {
    this.started = true;
    // one cancellable first-page request at a time
    this.reload$.pipe(
      switchMap(() => {
        this.loading = true;
        this.error = false;
        return this.executionsService.list(this.projectId, this.buildParams()).pipe(
          // the error is handled inside, so the pipeline survives it (Retry and filter changes keep working)
          catchError(err => { this.onListError(err); return of(null); })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe(page => { if (page) this.onFirstPage(page); });
    this.loadAgents();
    this.loadFirstPage();
  }

  loadFirstPage() {
    this.stopPolling();
    this.loadingMore = false;
    // in-flight refresh / load-more calls end on reload$ and cannot merge old-filter rows
    this.reload$.next();
    this.loadCounters();
  }

  buildParams(cursor?: string): ExecutionListParams {
    const f = this.filters;
    const params: ExecutionListParams = { limit: PAGE_SIZE };
    if (this.agentId) params.agent_id = this.agentId;
    if (f.trigger !== 'all') params.trigger = f.trigger;
    if (f.status) params.status = f.status === 'stopped' ? 'stopped,stopping' : f.status;
    if (f.has_failures) params.has_failures = true;
    if (f.q.trim()) params.q = f.q.trim();
    params.from = new Date(this.now() - (PERIOD_MS[f.period] || PERIOD_MS[DEFAULT_PERIOD])).toISOString();
    if (cursor) params.cursor = cursor;
    return params;
  }

  private onFirstPage(page) {
    this.loading = false;
    this.rows = page.items;
    this.nextCursor = page.next_cursor;
    this.updatePolling();
  }

  private onListError(err) {
    this.loading = false;
    this.loadingMore = false;
    this.error = true;
    this.logger.error('[EXECUTIONS-LIST] list error ', err);
  }

  loadMore() {
    if (!this.nextCursor || this.loadingMore) return;
    this.loadingMore = true;
    this.executionsService.list(this.projectId, this.buildParams(this.nextCursor))
      .pipe(takeUntil(this.reload$), takeUntil(this.destroy$))
      .subscribe({
        next: page => {
          this.loadingMore = false;
          this.rows = this.rows.concat(page.items);
          this.nextCursor = page.next_cursor;
          this.updatePolling();
        },
        error: err => this.onListError(err)
      });
  }

  /** Counters come from one summary call for the agent; the all-agents view has none (the API needs agent ids). */
  private loadCounters() {
    // the old value stays until the new one arrives (no flicker on every poll)
    if (!this.agentId) return;
    this.executionsService.summary(this.projectId, [this.agentId])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: s => this.counters = s.agents[this.agentId] || null,
        error: err => this.logger.error('[EXECUTIONS-LIST] summary error ', err)
      });
  }

  /** One call, cached for the page; names for the agent switcher. */
  private loadAgents() {
    this.faqKbService.getFaqKbByProjectId().pipe(takeUntil(this.destroy$)).subscribe({
      next: (bots: any[]) => {
        const seen = {};
        this.agents = (bots || [])
          .filter(b => !b.trashed)
          .map(b => ({ id: b.root_id || b._id, name: b.name }))
          .filter(a => !seen[a.id] && (seen[a.id] = true))
          .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      },
      error: err => this.logger.error('[EXECUTIONS-LIST] agents error ', err)
    });
  }

  // ---- polling: every 10 s while a visible row is running ----

  private hasRunning(): boolean {
    return this.rows.some(r => r.status === 'running' || r.status === 'stopping');
  }

  private updatePolling() {
    if (this.hasRunning()) {
      if (!this.pollSub) {
        this.pollSub = timer(POLL_MS, POLL_MS).pipe(takeUntil(this.destroy$)).subscribe(() => this.refresh());
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

  /** Re-reads the first page and merges it: known rows are updated in place, new ones go on top. */
  private refresh() {
    this.executionsService.list(this.projectId, this.buildParams()).pipe(takeUntil(this.reload$), takeUntil(this.destroy$)).subscribe({
      next: page => {
        const fresh = new Map(page.items.map(r => [r._id, r] as [string, ExecutionRow]));
        const known = new Set(this.rows.map(r => r._id));
        this.rows = page.items.filter(r => !known.has(r._id)).concat(this.rows.map(r => fresh.get(r._id) || r));
        if (this.rows.length === page.items.length) this.nextCursor = page.next_cursor;
        this.updatePolling();
        this.loadCounters();
      },
      error: err => this.logger.error('[EXECUTIONS-LIST] refresh error ', err)
    });
  }

  // ---- filters live in the URL ----

  setFilter(name: keyof ExecutionFilters, value: any) {
    let qp: any;
    switch (name) {
      case 'trigger': qp = value === DEFAULT_TRIGGER ? null : value; break;
      case 'period': qp = value === DEFAULT_PERIOD ? null : value; break;
      case 'has_failures': qp = value ? 'true' : null; break;
      default: qp = value || null;
    }
    this.navigateWith({ [name]: qp });
  }

  toggleStatus(status: string) {
    this.setFilter('status', this.filters.status === status ? '' : status);
  }

  clearFilters() {
    this.navigateWith({ trigger: null, status: null, has_failures: null, period: null, q: null });
  }

  showAllTriggers() {
    this.setFilter('trigger', 'all');
  }

  get hasActiveFilters(): boolean {
    const f = this.filters;
    return !!(f.status || f.has_failures || f.q || f.trigger !== DEFAULT_TRIGGER || f.period !== DEFAULT_PERIOD);
  }

  private navigateWith(queryParams: any) {
    this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge' });
  }

  // ---- navigation ----

  switchAgent(agentId: string) {
    const base = ['/project', this.projectId, 'bots'];
    this.router.navigate(agentId ? [...base, agentId, 'executions'] : [...base, 'executions'], { queryParamsHandling: 'preserve' });
  }

  openExecution(row: ExecutionRow) {
    this.router.navigate(['/project', this.projectId, 'bots', row.agent_id, 'executions', row._id]);
  }

  trackById(_: number, row: ExecutionRow) {
    return row._id;
  }
}
