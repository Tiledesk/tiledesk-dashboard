import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { fromEvent, of, Subject, Subscription, timer } from 'rxjs';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';
import { AuthService } from 'app/core/auth.service';
import { ExecutionsService } from 'app/services/executions.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { RolesService } from 'app/services/roles.service';
import { LoggerService } from 'app/services/logger/logger.service';
import {
  canViewExecutions, ExecutionGraph, ExecutionListParams, ExecutionPage, ExecutionRow, STATS_RANGES, StatsRange, StatusCounts, ViewFilters
} from '../executions.models';
import { monitorExecutionsLink } from '../execution-links';
import { formatDuration } from '../shared/execution-format';
import { GraphAgent } from '../graph/execution-graph.model';

/** Every run by default: the widget runs (most of them, and every waiting one) and the unattended ones. */
export const DEFAULT_TRIGGER = 'all';
/** The page opens on what is happening: the unfinished runs (spec addendum 3). */
export const DEFAULT_RANGE: StatsRange = 'now';
/** The list's old `period` param, read as `range` so existing links keep working. */
export const LEGACY_PERIODS = ['24h', '7d', '30d'];
export const PAGE_SIZE = 25;
export const POLL_MS = 10000;
/** The "updated N s/min ago" note is recomputed this often. */
export const NOTE_MS = 10000;

export type ExecutionsView = 'list' | 'graph';

export interface ExecutionFilters {
  trigger: string;
  status: string;
  has_failures: boolean;
  /** errors > 0 only: the With errors card */
  has_errors: boolean;
  /** the view rule of both views: Now = the unfinished runs of any age; a range adds every run started in it */
  range: StatsRange;
  q: string;
  /** test runs (Design Studio, draft agents) listed and counted, marked as tests; off: real runs only */
  tests: boolean;
}

@Component({
  selector: 'executions-list',
  templateUrl: './executions-list.component.html',
  styleUrls: ['./executions-list.component.scss']
})
export class ExecutionsListComponent implements OnInit, OnDestroy {

  readonly triggerOptions = ['all', 'unattended', 'scheduled', 'webhook', 'trigger', 'automation', 'widget', 'channel'];
  readonly statusOptions = ['running', 'waiting', 'stopping', 'stopped', 'failed', 'completed', 'destroyed'];
  readonly rangeOptions: StatsRange[] = STATS_RANGES;
  readonly viewOptions: Array<{ id: ExecutionsView; icon: string }> = [{ id: 'list', icon: 'view_list' }, { id: 'graph', icon: 'hub' }];
  readonly formatDuration = formatDuration;

  @ViewChild('graph') graph: { refresh(): void } | undefined;

  /** List or Graph: the same header (cards, toolbar, Refresh) over both (URL view=graph, absent: list). */
  view: ExecutionsView = 'list';
  projectId: string;
  projectName = '';
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
  /** Every agent of the project (trashed ones too, as the graph page had them): the graph's names. */
  graphAgents: GraphAgent[] = [];
  /** The filters the graph gets on top of the range: a new object only when they change. */
  graphFilters: ViewFilters = {};
  /** The graph has a call in flight (its Refresh is disabled). */
  graphLoading = false;
  /** When the shown data was asked (either view); null until a first answer. */
  updatedAt: number | null = null;
  /** "Updated N s ago" / "Updated N min ago", recomputed every NOTE_MS. */
  updatedLabel = '';
  /** The big numbers: every status over the view and all the filters (the list's with_stats, or the graph's answer); null until known. */
  counters: StatusCounts | null = null;
  /** The stats' with_errors: runs with errors > 0, an unhandled action (the With errors card). */
  withErrors: number | null = null;

  private destroy$ = new Subject<void>();
  private reload$ = new Subject<void>();
  /** The graph view took over: the list's in-flight calls end without landing. */
  private toGraph$ = new Subject<void>();
  private pollSub: Subscription | null = null;
  /** a refresh (poll or Refresh button) is in flight: the next one is scheduled when it answers */
  refreshing = false;
  /** a poll came due while the tab was hidden: it runs when the tab is visible again */
  private pollDue = false;
  private noteTimer: any = null;
  private started = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private executionsService: ExecutionsService,
    private faqKbService: FaqKbService,
    private rolesService: RolesService,
    private logger: LoggerService,
    private auth: AuthService,
    private translate: TranslateService,
    private zone: NgZone,
  ) { }

  ngOnInit() {
    this.configured = this.executionsService.isConfigured();
    this.auth.project_bs.pipe(takeUntil(this.destroy$)).subscribe(project => {
      this.projectName = project && project.name ? project.name : '';
    });
    // the list's poll pauses while the tab is hidden (the graph's feed pauses on its own)
    fromEvent(document, 'visibilitychange').pipe(takeUntil(this.destroy$)).subscribe(() => this.onVisibility());
    this.zone.runOutsideAngular(() => {
      this.noteTimer = setInterval(() => this.zone.run(() => this.updateNote()), NOTE_MS);
    });

    // the agent switcher reuses this component (monitor/:botid/executions <-> monitor/executions): follow the route
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const projectId = params.get('projectid');
      const agentId = params.get('botid');
      const changed = projectId !== this.projectId || agentId !== this.agentId;
      this.projectId = projectId;
      this.agentId = agentId;
      if (changed) this.graphFilters = this.viewFilters();
      if (changed && this.started) {
        this.counters = null;
        this.withErrors = null;
        this.rows = [];
        this.nextCursor = null;
        this.loadView();
      }
    });

    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      // values from the URL are validated against the option lists; anything else falls back to the default
      const pick = (name: string, allowed: string[], fallback: string) => {
        const v = params.get(name);
        return allowed.includes(v) ? v : fallback;
      };
      // range, else the old period (24h/7d/30d), else Now
      const legacy = pick('period', LEGACY_PERIODS, DEFAULT_RANGE) as StatsRange;
      this.filters = {
        trigger: pick('trigger', this.triggerOptions, DEFAULT_TRIGGER),
        status: pick('status', this.statusOptions, ''),
        has_failures: params.get('has_failures') === 'true',
        has_errors: params.get('has_errors') === 'true',
        range: params.has('range') ? pick('range', this.rangeOptions, DEFAULT_RANGE) as StatsRange : legacy,
        q: params.get('q') || '',
        tests: params.get('tests') !== 'false',
      };
      this.view = params.get('view') === 'graph' ? 'graph' : 'list';
      const filters = this.viewFilters();
      if (JSON.stringify(filters) !== JSON.stringify(this.graphFilters)) this.graphFilters = filters;
      if (this.started) this.loadView();
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
    if (this.noteTimer !== null) { clearInterval(this.noteTimer); this.noteTimer = null; }
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Overridable clock (the updated note). */
  now(): number {
    return Date.now();
  }

  /** Overridable: whether the tab is hidden. */
  isHidden(): boolean {
    return typeof document !== 'undefined' && document.hidden;
  }

  private defaultFilters(): ExecutionFilters {
    return { trigger: DEFAULT_TRIGGER, status: '', has_failures: false, has_errors: false, range: DEFAULT_RANGE, q: '', tests: true };
  }

  /**
   * The filters of both views, on top of the range, as the API takes them (spec addendum 3: one set for cards, list and graph).
   * Test runs: 'all' when shown, false (real only) when not; unset filters are left out.
   */
  viewFilters(): ViewFilters {
    const f = this.filters;
    const out: ViewFilters = {};
    if (this.agentId) out.agent_id = this.agentId;
    if (f.trigger !== 'all') out.trigger = f.trigger;
    if (f.status) out.status = f.status === 'stopped' ? 'stopped,stopping' : f.status;
    if (f.has_failures) out.has_failures = true;
    if (f.has_errors) out.has_errors = true;
    if (f.q.trim()) out.q = f.q.trim();
    out.test = f.tests ? 'all' : false;
    return out;
  }

  /** The current view's data: the list's first page, or nothing (the graph runs its own feed). */
  private loadView() {
    if (this.view === 'list') this.loadFirstPage();
    else {
      this.stopPolling();
      // in-flight list calls end: their rows and numbers are not the graph's
      this.toGraph$.next();
      this.loading = false;
      this.loadingMore = false;
    }
  }

  private start() {
    this.started = true;
    // one cancellable first-page request at a time
    this.reload$.pipe(
      switchMap(() => {
        this.loading = true;
        this.error = false;
        return this.executionsService.list(this.projectId, this.withStats(this.buildParams())).pipe(
          takeUntil(this.toGraph$),
          // the error is handled inside, so the pipeline survives it (Retry and filter changes keep working)
          catchError(err => { this.onListError(err); return of(null); })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe(page => { if (page) this.onFirstPage(page); });
    this.loadAgents();
    this.loadView();
  }

  loadFirstPage() {
    this.stopPolling();
    this.loadingMore = false;
    // in-flight refresh / load-more calls end on reload$ and cannot merge old-filter rows
    this.reload$.next();
  }

  /** The list call: the range (the graph's view rule) and the shared filters. */
  buildParams(cursor?: string): ExecutionListParams {
    const params: ExecutionListParams = { limit: PAGE_SIZE, range: this.filters.range, ...this.viewFilters() };
    if (cursor) params.cursor = cursor;
    return params;
  }

  /** A first page or a poll also brings the cards (one call, not list + stats), over the same range and filters as the rows. */
  private withStats(params: ExecutionListParams): ExecutionListParams {
    return { ...params, with_stats: true };
  }

  private markUpdated() {
    this.updatedAt = this.now();
    this.updateNote();
  }

  private updateNote(): void {
    if (this.updatedAt === null) { this.updatedLabel = ''; return; }
    const secs = Math.max(0, Math.floor((this.now() - this.updatedAt) / 1000));
    this.updatedLabel = secs < 60
      ? this.translate.instant('Executions.UpdatedSeconds', { n: secs })
      : this.translate.instant('Executions.UpdatedMinutes', { n: Math.floor(secs / 60) });
  }

  /** The old numbers stay until new ones arrive (no flicker on every poll, none on an error). */
  private takeCounters(page: ExecutionPage) {
    const s = page && page.stats;
    if (!s) return;
    this.counters = s.statuses || null;
    this.withErrors = typeof s.with_errors === 'number' ? s.with_errors : null;
  }

  private onFirstPage(page) {
    this.loading = false;
    this.markUpdated();
    this.takeCounters(page);
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
      .pipe(takeUntil(this.reload$), takeUntil(this.toGraph$), takeUntil(this.destroy$))
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

  /** One call, cached for the page; names for the agent switcher and the graph. */
  private loadAgents() {
    this.faqKbService.getFaqKbByProjectId().pipe(takeUntil(this.destroy$)).subscribe({
      next: (bots: any[]) => {
        const seenAll = {};
        this.graphAgents = (bots || [])
          .map(b => ({ id: b.root_id || b._id, name: b.name }))
          .filter(a => !seenAll[a.id] && (seenAll[a.id] = true));
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

  // ---- polling: 10 s after the previous answer, while a visible row is running ----

  private hasRunning(): boolean {
    return this.rows.some(r => r.status === 'running' || r.status === 'stopping');
  }

  /** One timer at a time, started after an answer (a slow response is never cancelled by the next poll). List view only. */
  private updatePolling() {
    if (this.view === 'list' && this.hasRunning()) {
      if (!this.pollSub && !this.refreshing) {
        this.pollSub = timer(POLL_MS).pipe(takeUntil(this.destroy$)).subscribe(() => {
          this.pollSub = null;
          // hidden tab: the poll waits for the tab to be visible again
          if (this.isHidden()) { this.pollDue = true; return; }
          this.refresh();
        });
      }
    } else {
      this.stopPolling();
    }
  }

  private onVisibility() {
    if (this.isHidden() || !this.pollDue) return;
    this.pollDue = false;
    if (this.view === 'list' && !this.refreshing && this.hasRunning()) this.refresh();
  }

  private stopPolling() {
    this.refreshing = false;
    this.pollDue = false;
    if (this.pollSub) {
      this.pollSub.unsubscribe();
      this.pollSub = null;
    }
  }

  /** Re-reads the first page and merges it: known rows are updated in place, new ones go on top. */
  private refresh() {
    this.refreshing = true;
    this.executionsService.list(this.projectId, this.withStats(this.buildParams())).pipe(takeUntil(this.reload$), takeUntil(this.toGraph$), takeUntil(this.destroy$)).subscribe({
      next: page => {
        this.refreshing = false;
        this.markUpdated();
        this.takeCounters(page);
        const fresh = new Map(page.items.map(r => [r._id, r] as [string, ExecutionRow]));
        const known = new Set(this.rows.map(r => r._id));
        this.rows = page.items.filter(r => !known.has(r._id)).concat(this.rows.map(r => fresh.get(r._id) || r));
        if (this.rows.length === page.items.length) this.nextCursor = page.next_cursor;
        this.updatePolling();
      },
      error: err => {
        this.refreshing = false;
        this.logger.error('[EXECUTIONS-LIST] refresh error ', err);
        this.updatePolling();
      }
    });
  }

  // ---- Refresh (both views) ----

  get refreshBusy(): boolean {
    return this.view === 'graph' ? this.graphLoading : (this.loading || this.refreshing);
  }

  /** The Refresh button: the graph's cycle now, or the list's first page merged in (rows kept, with the cards). */
  refreshNow() {
    if (this.refreshBusy) return;
    if (this.view === 'graph') {
      if (this.graph) this.graph.refresh();
      return;
    }
    if (this.pollSub) { this.pollSub.unsubscribe(); this.pollSub = null; }
    this.pollDue = false;
    this.refresh();
  }

  /** The graph's fresh answer: the cards and the updated note. */
  onGraphUpdated(update: { graph: ExecutionGraph | null; fetchedAt: number }) {
    const g = update && update.graph;
    if (g) {
      this.counters = g.statuses || null;
      this.withErrors = typeof g.with_errors === 'number' ? g.with_errors : null;
    }
    this.updatedAt = update.fetchedAt;
    this.updateNote();
  }

  // ---- view and filters live in the URL ----

  setView(view: ExecutionsView) {
    this.navigateWith({ view: view === 'graph' ? 'graph' : null });
  }

  setFilter(name: keyof ExecutionFilters, value: any) {
    let qp: any;
    switch (name) {
      case 'trigger': qp = value === DEFAULT_TRIGGER ? null : value; break;
      // the old period goes: range replaces it
      case 'range': return this.navigateWith({ range: value === DEFAULT_RANGE ? null : value, period: null });
      case 'has_failures':
      case 'has_errors': qp = value ? 'true' : null; break;
      case 'tests': qp = value ? null : 'false'; break;
      default: qp = value || null;
    }
    this.navigateWith({ [name]: qp });
  }

  /** A card: a status toggles the status filter; With errors toggles has_errors ("With failure conditions" stays apart). */
  pickCard(card: string) {
    if (card === 'with_errors') this.setFilter('has_errors', !this.filters.has_errors);
    else this.toggleStatus(card);
  }

  toggleStatus(status: string) {
    // the cards follow every filter (spec addendum 3): the trigger filter stays
    this.setFilter('status', this.filters.status === status ? '' : status);
  }

  /** The time and the view are no filters: they stay. */
  clearFilters() {
    this.navigateWith({ trigger: null, status: null, has_failures: null, has_errors: null, q: null, tests: null });
  }

  showAllTriggers() {
    this.setFilter('trigger', 'all');
  }

  get hasActiveFilters(): boolean {
    const f = this.filters;
    return !!(f.status || f.has_failures || f.has_errors || f.q || !f.tests || f.trigger !== DEFAULT_TRIGGER);
  }

  private navigateWith(queryParams: any) {
    this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge' });
  }

  // ---- navigation ----

  /** '' or null (the switcher cleared): all agents. */
  switchAgent(agentId: string | null) {
    this.router.navigate(monitorExecutionsLink(this.projectId, agentId || ''), { queryParamsHandling: 'preserve' });
  }

  openExecution(row: ExecutionRow) {
    this.router.navigate([...monitorExecutionsLink(this.projectId, row.agent_id), row._id]);
  }

  trackById(_: number, row: ExecutionRow) {
    return row._id;
  }
}
