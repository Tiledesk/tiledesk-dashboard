import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { from, fromEvent, Observable, of, Subject, Subscription, timer } from 'rxjs';
import { catchError, map, mergeMap, switchMap, takeUntil, toArray } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'app/core/auth.service';
import { ExecutionsService } from 'app/services/executions.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { RolesService } from 'app/services/roles.service';
import { LoggerService } from 'app/services/logger/logger.service';
import {
  canViewExecutions, EXECUTION_SORT_FIELDS, ExecutionGraph, ExecutionListParams, ExecutionPage, ExecutionRow, ExecutionSortField, SortDir,
  STATS_RANGES, StatsRange, StatusCounts, ViewFilters
} from '../executions.models';
import { monitorExecutionsLink } from '../execution-links';
import { formatDuration } from '../shared/execution-format';
import { GraphAgent } from '../graph/execution-graph.model';
import { BulkOutcome, executionGrants, ExecutionGrants, RowAction, rowOffers, rowsFor, selectable } from './row-actions';
import { StopDialogComponent, StopDialogData, StopMode } from '../shared/stop-dialog.component';
import { destroyConfirmCode, DestroyDialogComponent, DestroyDialogData } from '../shared/destroy-dialog.component';
import { ResumeDialogComponent, ResumeDialogData } from '../shared/resume-dialog.component';
import { BulkDestroyDialogComponent, BulkDestroyDialogData } from '../shared/bulk-destroy-dialog.component';

/** Calls in flight at once for an action on the selected rows. */
export const BULK_CONCURRENCY = 4;

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

export interface ExecutionSort { field: ExecutionSortField; dir: SortDir }
/** Started, newest first: the list's order before columns sorted; no sort/dir in the URL or the call. */
export const DEFAULT_SORT: ExecutionSort = { field: 'started_at', dir: 'desc' };
/** A column's first click: text columns A→Z, numbers and time biggest/newest first. */
export const FIRST_DIR: Record<ExecutionSortField, SortDir> = {
  started_at: 'desc', status: 'asc', agent_name: 'asc', trigger: 'asc',
  steps_count: 'desc', failure_conditions: 'desc', vars_changed: 'desc', duration_ms: 'desc',
};

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
  /** The table's headers, in column order; each one sorts the list. */
  readonly sortColumns: Array<{ field: ExecutionSortField; label: string }> = [
    { field: 'status', label: 'Executions.Columns.Status' },
    { field: 'agent_name', label: 'Executions.Columns.Agent' },
    { field: 'trigger', label: 'Executions.Columns.Trigger' },
    { field: 'started_at', label: 'Executions.Columns.Started' },
    { field: 'steps_count', label: 'Executions.Columns.Blocks' },
    { field: 'failure_conditions', label: 'Executions.Columns.FailureConditions' },
    { field: 'vars_changed', label: 'Executions.Columns.VarsChanged' },
    { field: 'duration_ms', label: 'Executions.Columns.Duration' },
  ];

  @ViewChild('graph') graph: { refresh(): void } | undefined;

  /** List or Graph: the same header (cards, toolbar, Refresh) over both (URL view=graph, absent: list). */
  view: ExecutionsView = 'list';
  projectId: string;
  projectName = '';
  agentId: string | null = null;
  configured = false;
  /** null until the role is known */
  permitted: boolean | null = null;
  /** What the role may do on the rows (pause/resume, destroy): owner and admin everything. */
  grants: ExecutionGrants = { control: false, destroy: false };
  /** The checked rows, by id (only rows of the list: a reload drops the ones no longer shown). */
  selected = new Set<string>();
  /** An action is running on rows: the action buttons are disabled. */
  actionBusy = false;
  /** The result of the last row/bulk action, shown above the table. */
  actionMessage: { kind: 'ok' | 'error'; key: string; params: any } | null = null;

  filters: ExecutionFilters = this.defaultFilters();
  /** The list's column sort (URL sort, dir); server-side, the graph ignores it. */
  sort: ExecutionSort = DEFAULT_SORT;
  rows: ExecutionRow[] = [];
  /** Load more added rows past the first page (a poll then keeps them). */
  private pagedPastFirst = false;
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
    private dialog: MatDialog,
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
      const sortField = params.get('sort') as ExecutionSortField;
      if ((EXECUTION_SORT_FIELDS as readonly string[]).includes(sortField)) {
        const dir = params.get('dir');
        this.sort = { field: sortField, dir: dir === 'asc' || dir === 'desc' ? dir : FIRST_DIR[sortField] };
      } else {
        this.sort = DEFAULT_SORT;
      }
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
      this.grants = executionGrants(status.role, status.matchedPermissions);
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
    if (!this.isDefaultSort(this.sort)) {
      params.sort = this.sort.field;
      params.dir = this.sort.dir;
    }
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
    this.pagedPastFirst = false;
    this.pruneSelection();
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
          this.pagedPastFirst = true;
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
        if (this.isDefaultSort(this.sort)) {
          const fresh = new Map(page.items.map(r => [r._id, r] as [string, ExecutionRow]));
          const known = new Set(this.rows.map(r => r._id));
          this.rows = page.items.filter(r => !known.has(r._id)).concat(this.rows.map(r => fresh.get(r._id) || r));
          if (this.rows.length === page.items.length) this.nextCursor = page.next_cursor;
        } else if (!this.pagedPastFirst) {
          // a column sort: the values move rows, so the first page is taken in the server's order
          this.rows = page.items;
          this.nextCursor = page.next_cursor;
        } else {
          // more pages loaded: the fresh first page on top, the loaded rows not in it kept below (and the cursor)
          const fresh = new Set(page.items.map(r => r._id));
          this.rows = page.items.concat(this.rows.filter(r => !fresh.has(r._id)));
        }
        this.pruneSelection();
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

  /** A header click: the same column flips its direction, another starts at its first direction; the default leaves the URL. */
  sortBy(field: ExecutionSortField) {
    const next: ExecutionSort = this.sort.field === field
      ? { field, dir: this.sort.dir === 'asc' ? 'desc' : 'asc' }
      : { field, dir: FIRST_DIR[field] };
    this.navigateWith(this.isDefaultSort(next) ? { sort: null, dir: null } : { sort: next.field, dir: next.dir });
  }

  /** aria-sort of a column header. */
  ariaSort(field: ExecutionSortField): 'ascending' | 'descending' | 'none' {
    return this.sort.field !== field ? 'none' : this.sort.dir === 'asc' ? 'ascending' : 'descending';
  }

  private isDefaultSort(s: ExecutionSort): boolean {
    return s.field === DEFAULT_SORT.field && s.dir === DEFAULT_SORT.dir;
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

  // ---- selection (checkbox column) ----

  get hasActionColumns(): boolean {
    return this.grants.control || this.grants.destroy;
  }

  isSelectable(row: ExecutionRow): boolean {
    return selectable(row, this.grants);
  }

  isSelected(row: ExecutionRow): boolean {
    return this.selected.has(row._id);
  }

  toggleRow(row: ExecutionRow, checked: boolean) {
    if (!this.isSelectable(row)) return;
    const next = new Set(this.selected);
    if (checked) next.add(row._id); else next.delete(row._id);
    this.selected = next;
  }

  get selectableRows(): ExecutionRow[] {
    return this.rows.filter(r => this.isSelectable(r));
  }

  get allSelected(): boolean {
    const rows = this.selectableRows;
    return rows.length > 0 && rows.every(r => this.selected.has(r._id));
  }

  get someSelected(): boolean {
    return this.selected.size > 0 && !this.allSelected;
  }

  toggleAll(checked: boolean) {
    this.selected = checked ? new Set(this.selectableRows.map(r => r._id)) : new Set();
  }

  clearSelection() {
    this.selected = new Set();
  }

  get selectedRows(): ExecutionRow[] {
    return this.rows.filter(r => this.selected.has(r._id));
  }

  /** How many selected rows an action applies to (its button shows the number, 0 disables it). */
  selectedFor(action: RowAction): number {
    return rowsFor(this.selectedRows, action, this.grants).length;
  }

  /** Rows that left the list, or can no longer be acted on, leave the selection. */
  private pruneSelection() {
    if (!this.selected.size) return;
    const keep = new Set(this.rows.filter(r => this.selected.has(r._id) && this.isSelectable(r)).map(r => r._id));
    if (keep.size !== this.selected.size) this.selected = keep;
  }

  // ---- row actions (actions column) ----

  offers(row: ExecutionRow, action: RowAction): boolean {
    return rowOffers(row, action, this.grants);
  }

  rowAction(row: ExecutionRow, action: RowAction, event?: Event) {
    if (event) event.stopPropagation();
    if (this.actionBusy || !this.offers(row, action)) return;
    if (action === 'pause') {
      this.askStopMode().subscribe(mode => {
        if (mode) this.runOn([row], action, r => this.executionsService.stop(this.projectId, r._id, mode).pipe(map(() => 'done' as const)));
      });
    } else if (action === 'resume') {
      this.askResume([row]).subscribe(ok => {
        if (ok) this.runOn([row], action, r => this.resumeOne(r), () => this.confirmCallingResume(row));
      });
    } else {
      const data: DestroyDialogData = { executionId: row._id };
      this.dialog.open(DestroyDialogComponent, { data, width: '480px' }).afterClosed().pipe(takeUntil(this.destroy$))
        .subscribe((code: string | null) => {
          if (code) this.runOn([row], action, r => this.executionsService.destroy(this.projectId, r._id, code).pipe(map(() => 'done' as const)));
        });
    }
  }

  // ---- bulk actions (on the selected rows) ----

  bulkAction(action: RowAction) {
    if (this.actionBusy) return;
    const rows = rowsFor(this.selectedRows, action, this.grants);
    if (!rows.length) return;
    if (action === 'pause') {
      this.askStopMode().subscribe(mode => {
        if (mode) this.runOn(rows, action, r => this.executionsService.stop(this.projectId, r._id, mode).pipe(map(() => 'done' as const)));
      });
    } else if (action === 'resume') {
      this.askResume(rows).subscribe(ok => {
        if (ok) this.runOn(rows, action, r => this.resumeOne(r));
      });
    } else {
      const data: BulkDestroyDialogData = { count: rows.length };
      this.dialog.open(BulkDestroyDialogComponent, { data, width: '480px' }).afterClosed().pipe(takeUntil(this.destroy$))
        .subscribe((ok: true | null) => {
          if (ok === true) {
            this.runOn(rows, action, r => this.executionsService.destroy(this.projectId, r._id, destroyConfirmCode(r._id)).pipe(map(() => 'done' as const)));
          }
        });
    }
  }

  private askStopMode(): Observable<StopMode | null> {
    const data: StopDialogData = { action: null, hardOnly: false };
    return this.dialog.open(StopDialogComponent, { data, width: '480px' }).afterClosed().pipe(
      map((mode: StopMode | null) => (mode === 'soft' || mode === 'hard' ? mode : null)),
      takeUntil(this.destroy$));
  }

  private askResume(rows: ExecutionRow[]): Observable<boolean> {
    const data: ResumeDialogData = { action: null, calling: false, automation: rows.some(r => r.trigger && r.trigger.type === 'automation') };
    return this.dialog.open(ResumeDialogComponent, { data, width: '480px' }).afterClosed().pipe(
      map((ok: true | null) => ok === true),
      takeUntil(this.destroy$));
  }

  /**
   * Resume without the confirm: an action that calls an external system answers 409 confirm_required and is
   * counted apart (it is resumed one at a time from its page, where the user sees the action).
   */
  private resumeOne(row: ExecutionRow): Observable<'done' | 'confirm'> {
    return this.executionsService.resume(this.projectId, row._id, false).pipe(
      map(() => 'done' as const),
      catchError(err => {
        if (err && err.status === 409 && err.error && err.error.error === 'confirm_required') return of('confirm' as const);
        throw err;
      }));
  }

  /**
   * One row's resume answered confirm_required: its action calls an external system. As on the execution page,
   * the user confirms it knowing that, and the resume is sent again with the confirm.
   */
  private confirmCallingResume(row: ExecutionRow) {
    const data: ResumeDialogData = { action: null, calling: true, automation: !!row.trigger && row.trigger.type === 'automation' };
    this.dialog.open(ResumeDialogComponent, { data, width: '480px' }).afterClosed().pipe(takeUntil(this.destroy$))
      .subscribe((ok: true | null) => {
        if (ok !== true) return;
        this.runOn([row], 'resume', r => this.executionsService.resume(this.projectId, r._id, true).pipe(map(() => 'done' as const)));
      });
  }

  /**
   * Sends the action on each row (at most BULK_CONCURRENCY at once), then reports and refreshes the list.
   * onConfirm: a single row that needs a confirm (resume of a calling action) asks for it instead of reporting.
   */
  private runOn(rows: ExecutionRow[], action: RowAction, call: (r: ExecutionRow) => Observable<'done' | 'confirm'>, onConfirm?: () => void) {
    this.actionBusy = true;
    this.actionMessage = null;
    from(rows).pipe(
      mergeMap(r => call(r).pipe(
        map(result => ({ id: r._id, result })),
        catchError(err => {
          this.logger.error('[EXECUTIONS-LIST] ' + action + ' error ', r._id, err && err.status);
          return of({ id: r._id, result: 'failed' as const });
        })), BULK_CONCURRENCY),
      toArray(),
      takeUntil(this.destroy$)
    ).subscribe(results => {
      this.actionBusy = false;
      const outcome: BulkOutcome = { done: 0, failed: 0, confirm: 0 };
      results.forEach(x => { outcome[x.result] += 1; });
      if (onConfirm && rows.length === 1 && outcome.confirm === 1) {
        onConfirm();
        return;
      }
      // the rows done leave the selection; the others stay checked for another try
      const done = new Set(results.filter(x => x.result === 'done').map(x => x.id));
      this.selected = new Set(Array.from(this.selected).filter(id => !done.has(id)));
      this.actionMessage = {
        kind: outcome.failed || outcome.confirm ? 'error' : 'ok',
        key: 'Executions.Bulk.Result.' + action,
        params: outcome,
      };
      this.refreshNow();
    });
  }

  dismissActionMessage() {
    this.actionMessage = null;
  }
}
