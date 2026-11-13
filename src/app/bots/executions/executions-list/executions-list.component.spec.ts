import { ComponentFixture, fakeAsync, TestBed, tick, discardPeriodicTasks } from '@angular/core/testing';
import { Component, EventEmitter, Input, NO_ERRORS_SCHEMA, Output } from '@angular/core';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, NgModel } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NgSelectModule } from '@ng-select/ng-select';
import { ExecutionStatCardsModule } from '../shared/execution-stat-cards.module';
import { ExecutionsListComponent } from './executions-list.component';
import { ExecutionStatusChipComponent } from '../shared/execution-status-chip.component';
import { ExecutionsService } from '../../../services/executions.service';
import { FaqKbService } from '../../../services/faq-kb.service';
import { RolesService } from '../../../services/roles.service';
import { LoggerService } from '../../../services/logger/logger.service';
import { AuthService } from '../../../core/auth.service';

/** The embedded graph: its inputs, its outputs, and refresh(). */
@Component({ selector: 'execution-graph', template: '<div class="graph-stub"></div>' })
class GraphStubComponent {
  @Input() projectId: string;
  @Input() projectName: string;
  @Input() agents: any[];
  @Input() range: string;
  @Input() filters: any;
  @Output() updated = new EventEmitter<any>();
  @Output() loadingChange = new EventEmitter<boolean>();
  @Output() unavailable = new EventEmitter<void>();
  refresh = jasmine.createSpy('graphRefresh');
}

const NOW = Date.parse('2026-11-09T12:00:00Z');
const STATUSES = { running: 1, waiting: 0, stopping: 1, stopped: 3, failed: 2, completed: 9, destroyed: 4 };
const STATS = (statuses: any = STATUSES) => ({ range: '7d', from: null, statuses, with_errors: 6, agents: {} });

function row(id: string, status = 'completed', extra: any = {}) {
  return {
    _id: id, agent_id: 'a1', agent_name: 'Nightly', status, end_reason: null, trigger: { type: 'scheduled' },
    started_at: '2026-11-09T03:00:00Z', duration_ms: 2100, steps_count: 4, failure_conditions: 1, errors: 0, vars_changed: 7,
    trace_complete: true, test: false, ...extra,
  };
}

describe('ExecutionsListComponent', () => {
  let fixture: ComponentFixture<ExecutionsListComponent>;
  let component: ExecutionsListComponent;
  let executions: { isConfigured: jasmine.Spy; list: jasmine.Spy; summary: jasmine.Spy; stats: jasmine.Spy };
  let router: { navigate: jasmine.Spy };
  let query$: BehaviorSubject<any>;
  let perms$: Subject<any>;
  let faqKb: { getFaqKbByProjectId: jasmine.Spy };
  let params$: BehaviorSubject<any>;

  function setup(opts: { botid?: string; query?: any; configured?: boolean; role?: string; perms?: string[]; page?: any } = {}) {
    executions = {
      isConfigured: jasmine.createSpy('isConfigured').and.returnValue(opts.configured !== false),
      // the list answers with the cards' stats (with_stats=true) unless a test gives its own page
      list: jasmine.createSpy('list').and.returnValue(of({ stats: STATS(), ...(opts.page || { items: [], next_cursor: null }) })),
      summary: jasmine.createSpy('summary'),
      stats: jasmine.createSpy('stats').and.returnValue(of(STATS())),
    };
    router = { navigate: jasmine.createSpy('navigate') };
    query$ = new BehaviorSubject(convertToParamMap(opts.query || {}));
    const routeParams = { projectid: 'p1', ...(opts.botid ? { botid: opts.botid } : {}) };
    params$ = new BehaviorSubject(convertToParamMap(routeParams));
    perms$ = new Subject();
    faqKb = { getFaqKbByProjectId: jasmine.createSpy('faq').and.returnValue(of([
      { _id: 'v2', root_id: 'a1', name: 'Nightly' }, { _id: 'v1', root_id: 'a1', name: 'Nightly' }, { _id: 'b2', name: 'Alpha' }, { _id: 'z', name: 'Gone', trashed: true }])) };
    TestBed.configureTestingModule({
      declarations: [ExecutionsListComponent, ExecutionStatusChipComponent, GraphStubComponent],
      imports: [TranslateModule.forRoot(), MatIconModule, MatTooltipModule, FormsModule, NgSelectModule, ExecutionStatCardsModule],
      providers: [
        { provide: ExecutionsService, useValue: executions },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap(routeParams) }, paramMap: params$, queryParamMap: query$ } },
        { provide: FaqKbService, useValue: faqKb },
        { provide: RolesService, useValue: { listenToProjectUserPermissions() {}, getUpdateRequestPermission: () => perms$ } },
        { provide: LoggerService, useValue: { log() {}, debug() {}, warn() {}, error() {} } },
        { provide: AuthService, useValue: { project_bs: new BehaviorSubject({ _id: 'p1', name: 'Acme' }) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(ExecutionsListComponent);
    component = fixture.componentInstance;
    spyOn(component, 'now').and.returnValue(NOW);
    fixture.detectChanges();
    perms$.next({ role: opts.role === undefined ? 'owner' : opts.role, matchedPermissions: opts.perms || [] });
    fixture.detectChanges();
  }

  const text = () => fixture.nativeElement.textContent as string;
  const graph = () => { const d = fixture.debugElement.query(By.directive(GraphStubComponent)); return d ? d.componentInstance as GraphStubComponent : null; };

  it('default filter: every trigger, test runs included, range Now (no from/to)', () => {
    setup({ botid: 'a1' });
    const params = executions.list.calls.mostRecent().args[1];
    expect(executions.list.calls.mostRecent().args[0]).toBe('p1');
    expect(params.trigger).toBeUndefined();
    expect(params.test).toBe('all');
    expect(params.agent_id).toBe('a1');
    expect(params.range).toBe('now');
    expect(params.from).toBeUndefined();
    expect(params.to).toBeUndefined();
    expect(params.status).toBeUndefined();
  });

  it('filters come from the URL and map to API params', () => {
    setup({ query: { trigger: 'all', status: 'failed', has_failures: 'true', has_errors: 'true', range: '24h', q: ' abc ' } });
    const p = executions.list.calls.mostRecent().args[1];
    expect(p.trigger).toBeUndefined();
    expect(p.status).toBe('failed');
    expect(p.has_failures).toBe(true);
    expect(p.has_errors).toBe(true);
    expect(p.q).toBe('abc');
    expect(p.agent_id).toBeUndefined();
    expect(p.range).toBe('24h');
    expect(p.from).toBeUndefined();
  });

  describe('time (range)', () => {
    it('the time select offers Now, 1 hour, 24 hours, 7 days, 30 days; Now is the default and has no param', () => {
      setup();
      expect(component.rangeOptions).toEqual(['now', '1h', '24h', '7d', '30d']);
      expect(component.filters.range).toBe('now');
      component.setFilter('range', '1h');
      expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ range: '1h', period: null });
      component.setFilter('range', 'now');
      expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ range: null, period: null });
    });

    it('the old period param (24h, 7d, 30d) is read as range; range wins over it', () => {
      setup({ query: { period: '30d' } });
      expect(component.filters.range).toBe('30d');
      expect(executions.list.calls.mostRecent().args[1].range).toBe('30d');
      query$.next(convertToParamMap({ period: '24h', range: '7d' }));
      expect(executions.list.calls.mostRecent().args[1].range).toBe('7d');
      query$.next(convertToParamMap({ period: 'bogus' }));
      expect(executions.list.calls.mostRecent().args[1].range).toBe('now');
    });

    it('one call asks the page and its cards: range + with_stats, no from and no stats_range', () => {
      setup({ query: { range: '7d' } });
      expect(executions.list).toHaveBeenCalledTimes(1);
      const p = executions.list.calls.mostRecent().args[1];
      expect(p.range).toBe('7d');
      expect(p.with_stats).toBe(true);
      expect(p.stats_range).toBeUndefined();
      expect(p.from).toBeUndefined();
    });

    it('on Now with no filters and nothing listed: the note says nothing is running and to pick a longer time', () => {
      setup();
      expect(text()).toContain('Executions.EmptyNow');
      expect(text()).not.toContain('Executions.EmptyNone');
    });
  });

  it('changing a filter writes it to the URL (defaults are removed)', () => {
    setup();
    component.setFilter('status', 'failed');
    expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ status: 'failed' });
    component.setFilter('trigger', 'all');
    expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ trigger: null });
    component.setFilter('trigger', 'unattended');
    expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ trigger: 'unattended' });
    component.setFilter('tests', false);
    expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ tests: 'false' });
    component.setFilter('tests', true);
    expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ tests: null });
    component.setFilter('has_failures', true);
    expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ has_failures: 'true' });
    component.setFilter('has_errors', true);
    expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ has_errors: 'true' });
    component.setFilter('has_errors', false);
    expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ has_errors: null });
  });

  it('without has_errors in the URL, the list sends no has_errors', () => {
    setup({ query: { has_failures: 'true' } });
    const p = executions.list.calls.mostRecent().args[1];
    expect(p.has_errors).toBeUndefined();
    expect(p.has_failures).toBe(true);
  });

  it('reloads when the query params change', () => {
    setup();
    const calls = executions.list.calls.count();
    query$.next(convertToParamMap({ status: 'failed' }));
    expect(executions.list.calls.count()).toBe(calls + 1);
    expect(executions.list.calls.mostRecent().args[1].status).toBe('failed');
  });

  it('load more appends with next_cursor', () => {
    setup({ page: { items: [row('e1'), row('e2')], next_cursor: 'c1' } });
    expect(component.rows.length).toBe(2);
    executions.list.and.returnValue(of({ items: [row('e3')], next_cursor: null }));
    component.loadMore();
    expect(executions.list.calls.mostRecent().args[1].cursor).toBe('c1');
    expect(component.rows.map(r => r._id)).toEqual(['e1', 'e2', 'e3']);
    expect(component.nextCursor).toBeNull();
  });

  it('shows the Load more button only with a cursor', () => {
    setup({ page: { items: [row('e1')], next_cursor: 'c1' } });
    expect(fixture.nativeElement.querySelector('.exec-load-more')).not.toBeNull();
    component.nextCursor = null;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.exec-load-more')).toBeNull();
  });

  describe('polling', () => {
    it('polls every 10 s while a row is running, and stops when none is', fakeAsync(() => {
      setup({ page: { items: [row('e1', 'running')], next_cursor: null } });
      const initial = executions.list.calls.count();
      tick(10000);
      expect(executions.list.calls.count()).toBe(initial + 1);
      tick(10000);
      expect(executions.list.calls.count()).toBe(initial + 2);
      executions.list.and.returnValue(of({ items: [row('e1', 'completed')], next_cursor: null }));
      tick(10000);
      const afterDone = executions.list.calls.count();
      tick(30000);
      expect(executions.list.calls.count()).toBe(afterDone);
      expect(component.rows[0].status).toBe('completed');
      discardPeriodicTasks(); // the page's "updated … ago" ticker
    }));

    it('polling stops when no row is running (never starts)', fakeAsync(() => {
      setup({ page: { items: [row('e1', 'failed')], next_cursor: null } });
      const initial = executions.list.calls.count();
      tick(60000);
      expect(executions.list.calls.count()).toBe(initial);
      discardPeriodicTasks(); // the page's "updated … ago" ticker
    }));

    it('stops on destroy', fakeAsync(() => {
      setup({ page: { items: [row('e1', 'running')], next_cursor: null } });
      fixture.destroy();
      const n = executions.list.calls.count();
      tick(60000);
      expect(executions.list.calls.count()).toBe(n);
      discardPeriodicTasks(); // the page's "updated … ago" ticker
    }));

    it('a refresh puts new rows on top and updates known ones', fakeAsync(() => {
      setup({ page: { items: [row('e1', 'running')], next_cursor: null } });
      executions.list.and.returnValue(of({ items: [row('e2', 'running'), row('e1', 'running', { steps_count: 9 })], next_cursor: null }));
      tick(10000);
      expect(component.rows.map(r => r._id)).toEqual(['e2', 'e1']);
      expect(component.rows[1].steps_count).toBe(9);
      discardPeriodicTasks();
    }));
  });

  describe('empty states', () => {
    it('without filters', () => {
      setup({ query: { range: '7d' } });
      expect(component.hasActiveFilters).toBe(false);
      expect(text()).toContain('Executions.EmptyNone');
      expect(text()).not.toContain('Executions.EmptyFiltered');
    });

    it('with filters, and Clear filters resets them in the URL', () => {
      setup({ query: { status: 'failed' } });
      expect(component.hasActiveFilters).toBe(true);
      expect(text()).toContain('Executions.EmptyFiltered');
      component.clearFilters();
      // the time and the view are no filters: they stay
      expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ trigger: null, status: null, has_failures: null, has_errors: null, q: null, tests: null });
    });
  });

  describe('permission and configuration', () => {
    it('shows the no-permission view for the agent role and does not call the API', () => {
      setup({ role: 'agent' });
      expect(executions.list).not.toHaveBeenCalled();
      expect(text()).toContain('UnauthorizedPage.OopsYouDontHave');
    });

    it('custom role needs executions_read', () => {
      setup({ role: 'custom', perms: ['executions_read'] });
      expect(executions.list).toHaveBeenCalled();
    });

    it('shows the not-configured state and does not call the API', () => {
      setup({ configured: false });
      expect(executions.list).not.toHaveBeenCalled();
      expect(text()).toContain('Executions.NotConfigured');
    });

    it('shows a retryable error when the list fails', () => {
      setup();
      executions.list.and.returnValue(throwError(() => new Error('boom')));
      component.loadFirstPage();
      fixture.detectChanges();
      expect(text()).toContain('Executions.LoadError');
    });
  });

  describe('cards and agent column', () => {
    const cards = () => Array.from(fixture.nativeElement.querySelectorAll('.exec-stat-card')) as HTMLElement[];
    const values = () => cards().map(c => c.querySelector('.exec-stat-value').textContent.trim());

    it('one-agent view: one list call with the stats of the list range, agent and test runs; no stats or summary call', () => {
      setup({ botid: 'a1' });
      expect(executions.list).toHaveBeenCalledTimes(1);
      const p = executions.list.calls.mostRecent().args[1];
      expect(p.with_stats).toBe(true);
      expect(p.range).toBe('now');
      expect(p.agent_id).toBe('a1');
      expect(p.test).toBe('all');
      expect(executions.stats).not.toHaveBeenCalled();
      expect(executions.summary).not.toHaveBeenCalled();
      expect(values()).toEqual(['1', '0', '4', '2', '6', '9', '4']);
    });

    it('each load is one call: a filter change asks the list for the stats again, load more does not', () => {
      setup({ page: { items: [row('e1')], next_cursor: 'c1' } });
      executions.list.calls.reset();
      executions.list.and.returnValue(of({ items: [row('e1')], next_cursor: 'c1', stats: STATS({ ...STATUSES, failed: 7 }) }));
      query$.next(convertToParamMap({ status: 'failed' }));
      fixture.detectChanges();
      expect(executions.list).toHaveBeenCalledTimes(1);
      expect(executions.list.calls.mostRecent().args[1].with_stats).toBe(true);
      expect(values()[3]).toBe('7');
      executions.list.and.returnValue(of({ items: [row('e2')], next_cursor: null }));
      component.loadMore();
      expect(executions.list).toHaveBeenCalledTimes(2);
      const more = executions.list.calls.mostRecent().args[1];
      expect(more.cursor).toBe('c1');
      expect(more.with_stats).toBeUndefined();
      expect(more.range).toBe('now');
      expect(values()[3]).toBe('7');
      expect(executions.stats).not.toHaveBeenCalled();
    });

    it('With errors toggles has_errors (it is no status) and shows pressed while on; failure conditions untouched', () => {
      setup({ botid: 'a1' });
      cards()[4].click();
      expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ has_errors: 'true' });
      query$.next(convertToParamMap({ has_errors: 'true' }));
      fixture.detectChanges();
      expect(cards()[4].getAttribute('aria-pressed')).toBe('true');
      expect(component.hasActiveFilters).toBe(true);
      const p = executions.list.calls.mostRecent().args[1];
      expect(p.has_errors).toBe(true);
      expect(p.has_failures).toBeUndefined();
      expect((fixture.nativeElement.querySelector('.exec-filter-failures') as HTMLInputElement).checked).toBe(false);
      cards()[4].click();
      expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ has_errors: null });
    });

    it('"With failure conditions" alone does not press the With errors card', () => {
      setup({ botid: 'a1', query: { has_failures: 'true' } });
      expect(cards()[4].getAttribute('aria-pressed')).not.toBe('true');
      expect((fixture.nativeElement.querySelector('.exec-filter-failures') as HTMLInputElement).checked).toBe(true);
    });

    it('cards follow every filter: the stats come with the list call that carries them', () => {
      setup({ botid: 'a1', query: { range: '24h', trigger: 'unattended', status: 'failed', has_failures: 'true', q: 'r1', tests: 'false' } });
      const p = executions.list.calls.mostRecent().args[1];
      expect(p).toEqual(jasmine.objectContaining({
        with_stats: true, range: '24h', agent_id: 'a1', trigger: 'unattended', status: 'failed', has_failures: true, q: 'r1', test: false,
      }));
      query$.next(convertToParamMap({ range: '30d' }));
      expect(executions.list.calls.mostRecent().args[1].range).toBe('30d');
    });

    it('clicking a card sets the status filter; Stopped lists stopped and stopping', () => {
      setup({ botid: 'a1', query: { trigger: 'unattended' } });
      // the cards follow the trigger filter now: a card keeps it
      cards()[3].click();
      expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ status: 'failed' });
      cards()[1].click();
      expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ status: 'waiting' });
      query$.next(convertToParamMap({ status: 'waiting', trigger: 'all' }));
      fixture.detectChanges();
      expect(cards()[1].getAttribute('aria-pressed')).toBe('true');
      expect(executions.list.calls.mostRecent().args[1].trigger).toBeUndefined();
      expect(executions.list.calls.mostRecent().args[1].status).toBe('waiting');
      cards()[1].click();
      expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ status: null });
      cards()[2].click();
      expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ status: 'stopped' });
      query$.next(convertToParamMap({ status: 'stopped', trigger: 'all' }));
      expect(executions.list.calls.mostRecent().args[1].status).toBe('stopped,stopping');
    });

    it('the hint names the time range (the cards follow the filters, no "every trigger" any more)', () => {
      setup({ query: { range: '30d' } });
      const hint = fixture.nativeElement.querySelector('.exec-cards-hint').textContent;
      expect(hint).toContain('Executions.Range.30d');
      expect(hint).not.toContain('Executions.Triggers.all');
    });

    it('test runs off: list and cards leave them out, and the toggle counts as a filter', () => {
      setup({ botid: 'a1', query: { tests: 'false' } });
      expect(component.filters.tests).toBe(false);
      expect(executions.list.calls.mostRecent().args[1].test).toBe(false);
      // test=false: the list and its stats both take real runs only
      expect(executions.list.calls.mostRecent().args[1].with_stats).toBe(true);
      expect(component.hasActiveFilters).toBe(true);
    });

    it('all-agents view: cards for every agent (no agent_id), Agent column from agent_name', () => {
      setup({ page: { items: [row('e1', 'failed', { agent_name: 'Nightly' })], next_cursor: null } });
      const p = executions.list.calls.mostRecent().args[1];
      expect(p.agent_id).toBeUndefined();
      expect(p.with_stats).toBe(true);
      expect(p.range).toBe('now');
      expect(cards().length).toBe(7);
      expect(fixture.nativeElement.querySelector('.exec-agent').textContent).toContain('Nightly');
    });

    it('a list error keeps the previous numbers', () => {
      setup();
      executions.list.and.returnValue(throwError(() => new Error('503')));
      component.loadFirstPage();
      fixture.detectChanges();
      expect(values()[0]).toBe('1');
    });

    it('agent column is absent in the one-agent view', () => {
      setup({ botid: 'a1', page: { items: [row('e1')], next_cursor: null } });
      expect(fixture.nativeElement.querySelector('.exec-agent')).toBeNull();
    });

    it('switcher lists the agents from one FaqKb call, deduped by root id', () => {
      setup();
      expect(faqKb.getFaqKbByProjectId.calls.count()).toBe(1);
      expect(component.agents).toEqual([{ id: 'b2', name: 'Alpha' }, { id: 'a1', name: 'Nightly' }]);
      component.switchAgent('a1');
      expect(router.navigate.calls.mostRecent().args[0]).toEqual(['/project', 'p1', 'monitor', 'a1', 'executions']);
      component.switchAgent('');
      expect(router.navigate.calls.mostRecent().args[0]).toEqual(['/project', 'p1', 'monitor', 'executions']);
    });
  });

  describe('rows', () => {
    it('renders the warning icon for incomplete traces, humanized duration, and opens the detail', () => {
      setup({ page: { items: [row('e1', 'failed', { trace_complete: false }), row('e2')], next_cursor: null } });
      expect(fixture.nativeElement.querySelectorAll('.exec-warn-icon').length).toBe(1);
      expect(text()).toContain('2.1 s');
      fixture.nativeElement.querySelector('.exec-row').click();
      expect(router.navigate.calls.mostRecent().args[0]).toEqual(['/project', 'p1', 'monitor', 'a1', 'executions', 'e1']);
    });
  });

  describe('errors mark', () => {
    it('a row with errors > 0 gets a red errors mark beside its failure conditions; others none', () => {
      setup({ page: { items: [row('e1', 'completed', { errors: 2, failure_conditions: 0 }), row('e2', 'completed', { failure_conditions: 3 }), row('e3', 'completed', { errors: undefined })], next_cursor: null } });
      const rows = Array.from(fixture.nativeElement.querySelectorAll('.exec-row')) as HTMLElement[];
      const mark = (r: HTMLElement) => r.querySelector('.exec-errors-mark');
      expect(mark(rows[0])).not.toBeNull();
      expect(mark(rows[0]).textContent).toContain('Executions.ErrorsMark');
      expect(mark(rows[0]).closest('td').classList.contains('exec-fc-cell')).toBe(true);
      expect(mark(rows[1])).toBeNull();
      expect(mark(rows[2])).toBeNull();
    });
  });

  describe('fix round 1', () => {
    it('survives a list error: Retry and filter changes still reload', () => {
      setup();
      executions.list.and.returnValue(throwError(() => new Error('boom')));
      component.loadFirstPage();
      fixture.detectChanges();
      expect(text()).toContain('Executions.LoadError');
      executions.list.and.returnValue(of({ items: [row('e1')], next_cursor: null }));
      component.loadFirstPage();
      fixture.detectChanges();
      expect(component.error).toBe(false);
      expect(fixture.nativeElement.querySelectorAll('.exec-row').length).toBe(1);

      executions.list.and.returnValue(throwError(() => new Error('boom')));
      component.loadFirstPage();
      executions.list.and.returnValue(of({ items: [row('e2')], next_cursor: null }));
      query$.next(convertToParamMap({ status: 'failed' }));
      expect(component.rows.map(r => r._id)).toEqual(['e2']);
    });

    it('counters are not cleared while polling', fakeAsync(() => {
      setup({ botid: 'a1', page: { items: [row('e1', 'running')], next_cursor: null } });
      const pending = new Subject<any>();
      executions.list.and.returnValue(pending);
      tick(10000);
      expect(component.counters).not.toBeNull();
      discardPeriodicTasks();
    }));

    it('a poll is one call too: it asks for the stats and updates the cards', fakeAsync(() => {
      setup({ botid: 'a1', page: { items: [row('e1', 'running')], next_cursor: null } });
      executions.list.and.returnValue(of({ items: [row('e1', 'running')], next_cursor: null, stats: STATS({ ...STATUSES, running: 5 }) }));
      const n = executions.list.calls.count();
      tick(10000);
      expect(executions.list.calls.count()).toBe(n + 1);
      const p = executions.list.calls.mostRecent().args[1];
      expect(p.with_stats).toBe(true);
      expect(p.range).toBe('now');
      expect(component.counters.running).toBe(5);
      expect(executions.stats).not.toHaveBeenCalled();
      discardPeriodicTasks();
    }));

    it('a filter change while load-more is pending ignores its result and resets loadingMore', () => {
      setup({ page: { items: [row('e1')], next_cursor: 'c1' } });
      const pending = new Subject<any>();
      executions.list.and.returnValue(pending);
      component.loadMore();
      expect(component.loadingMore).toBe(true);
      executions.list.and.returnValue(of({ items: [row('n1')], next_cursor: null }));
      query$.next(convertToParamMap({ status: 'failed' }));
      expect(component.loadingMore).toBe(false);
      pending.next({ items: [row('old')], next_cursor: null });
      expect(component.rows.map(r => r._id)).toEqual(['n1']);
    });

    it('a pending refresh is ignored after a reload', fakeAsync(() => {
      setup({ page: { items: [row('e1', 'running')], next_cursor: null } });
      const pending = new Subject<any>();
      executions.list.and.returnValue(pending);
      tick(10000);
      executions.list.and.returnValue(of({ items: [row('n1', 'failed')], next_cursor: null }));
      query$.next(convertToParamMap({ status: 'failed' }));
      pending.next({ items: [row('old', 'running')], next_cursor: null });
      expect(component.rows.map(r => r._id)).toEqual(['n1']);
      discardPeriodicTasks(); // the page's "updated … ago" ticker
    }));

    it('invalid URL values fall back to defaults', () => {
      setup({ query: { range: 'constructor', period: 'toString', trigger: 'bogus', status: 'toString', has_failures: 'yes', view: 'bogus' } });
      expect(component.filters).toEqual({ trigger: 'all', status: '', has_failures: false, has_errors: false, range: 'now', q: '', tests: true });
      expect(component.view).toBe('list');
      expect(executions.list.calls.mostRecent().args[1].range).toBe('now');
    });

    it('trigger column uses the Triggers translation', () => {
      setup({ page: { items: [row('e1')], next_cursor: null } });
      expect(fixture.nativeElement.querySelector('.exec-row').textContent).toContain('Executions.Triggers.scheduled');
    });
  });

  describe('final review fixes', () => {
    it('switching agent A -> B on the reused component reloads the list and the counters for B (D1)', () => {
      setup({ botid: 'a1' });
      executions.list.and.returnValue(of({ items: [], next_cursor: null, stats: STATS({ ...STATUSES, waiting: 4 }) }));
      const lists = executions.list.calls.count();
      params$.next(convertToParamMap({ projectid: 'p1', botid: 'b2' }));
      expect(component.agentId).toBe('b2');
      expect(executions.list.calls.count()).toBe(lists + 1);
      expect(executions.list.calls.mostRecent().args[1].agent_id).toBe('b2');
      expect(component.counters.waiting).toBe(4);
      const pending = new Subject<any>();
      executions.list.and.returnValue(pending);
      params$.next(convertToParamMap({ projectid: 'p1' }));
      expect(component.agentId).toBeNull();
      // B's numbers are not shown for all agents while theirs load
      expect(component.counters).toBeNull();
      expect(executions.list.calls.mostRecent().args[1].agent_id).toBeUndefined();
    });

    it('a refresh slower than the poll interval still lands, and the next poll follows it (D2)', fakeAsync(() => {
      setup({ page: { items: [row('e1', 'running')], next_cursor: null } });
      const slow = new Subject<any>();
      executions.list.and.returnValue(slow);
      const n = executions.list.calls.count();
      tick(10000);
      expect(executions.list.calls.count()).toBe(n + 1);
      tick(15000); // response still pending: no second request piles up
      expect(executions.list.calls.count()).toBe(n + 1);
      slow.next({ items: [row('e1', 'running', { steps_count: 42 })], next_cursor: null });
      slow.complete();
      expect(component.rows[0].steps_count).toBe(42);
      executions.list.and.returnValue(of({ items: [row('e1', 'completed')], next_cursor: null }));
      tick(9999);
      expect(executions.list.calls.count()).toBe(n + 1);
      tick(1);
      expect(executions.list.calls.count()).toBe(n + 2);
      tick(60000);
      expect(executions.list.calls.count()).toBe(n + 2);
      discardPeriodicTasks(); // the page's "updated … ago" ticker
    }));

    it('a failed refresh still schedules the next one while rows run (D2)', fakeAsync(() => {
      setup({ page: { items: [row('e1', 'running')], next_cursor: null } });
      executions.list.and.returnValue(throwError(() => new Error('502')));
      const n = executions.list.calls.count();
      tick(10000);
      tick(10000);
      expect(executions.list.calls.count()).toBe(n + 2);
      fixture.destroy();
      discardPeriodicTasks(); // the page's "updated … ago" ticker
    }));

    it('role not known yet (\'\'): neither the no-permission view nor an API call (D4)', () => {
      setup({ role: '' });
      expect(component.permitted).toBeNull();
      expect(text()).not.toContain('UnauthorizedPage.OopsYouDontHave');
      expect(executions.list).not.toHaveBeenCalled();
      perms$.next({ role: 'owner', matchedPermissions: [] });
      expect(component.permitted).toBe(true);
      expect(executions.list).toHaveBeenCalled();
    });
  });

  it('a test run is listed with a test badge', () => {
    setup({ page: { items: [Object.assign(row('t1'), { test: true }), row('r1')], next_cursor: null } });
    const badges = fixture.nativeElement.querySelectorAll('.exec-test-badge');
    expect(badges.length).toBe(1);
    expect(badges[0].textContent.trim()).toBe('Executions.TestBadge');
  });

  describe('dropdowns (ng-select)', () => {
    const select = (cls: string) => fixture.debugElement.query(By.css('ng-select.' + cls));

    it('agent switcher, trigger, status and time are ng-selects bound to the current values', async () => {
      setup({ botid: 'a1', query: { trigger: 'webhook', status: 'failed', range: '30d' } });
      await fixture.whenStable();
      expect(select('exec-agent-switcher').injector.get(NgModel).model).toBe('a1');
      expect(select('exec-filter-trigger').injector.get(NgModel).model).toBe('webhook');
      expect(select('exec-filter-status').injector.get(NgModel).model).toBe('failed');
      expect(select('exec-filter-range').injector.get(NgModel).model).toBe('30d');
      expect(fixture.nativeElement.querySelector('select')).toBeNull();
    });

    it('a choice writes the filter to the URL, like the native selects did', () => {
      setup();
      select('exec-filter-trigger').triggerEventHandler('ngModelChange', 'webhook');
      expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ trigger: 'webhook' });
      select('exec-filter-range').triggerEventHandler('ngModelChange', '24h');
      expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ range: '24h', period: null });
      select('exec-filter-range').triggerEventHandler('ngModelChange', 'now');
      expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ range: null, period: null });
      select('exec-filter-status').triggerEventHandler('ngModelChange', 'waiting');
      expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ status: 'waiting' });
      // cleared: any status
      select('exec-filter-status').triggerEventHandler('ngModelChange', null);
      expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ status: null });
    });

    it('the agent switcher navigates to the agent, and cleared to all agents, keeping the filters', () => {
      setup({ botid: 'a1' });
      select('exec-agent-switcher').triggerEventHandler('ngModelChange', 'b2');
      expect(router.navigate.calls.mostRecent().args).toEqual([['/project', 'p1', 'monitor', 'b2', 'executions'], { queryParamsHandling: 'preserve' }]);
      select('exec-agent-switcher').triggerEventHandler('ngModelChange', null);
      expect(router.navigate.calls.mostRecent().args[0]).toEqual(['/project', 'p1', 'monitor', 'executions']);
    });
  });
  describe('List | Graph switch', () => {
    const switchButtons = () => Array.from(fixture.nativeElement.querySelectorAll('.exec-view-switch button')) as HTMLButtonElement[];

    it('a segmented control with icons; List is pressed by default and the list is shown', () => {
      setup();
      const b = switchButtons();
      expect(b.length).toBe(2);
      expect(b[0].textContent).toContain('Executions.View.list');
      expect(b[1].textContent).toContain('Executions.View.graph');
      expect(b.every(x => !!x.querySelector('mat-icon'))).toBe(true);
      expect(b.map(x => x.getAttribute('aria-pressed'))).toEqual(['true', 'false']);
      expect(component.view).toBe('list');
      expect(graph()).toBeNull();
    });

    it('the view lives in the URL as view=graph (absent: list), merged so every filter stays', () => {
      setup({ query: { status: 'failed', range: '24h' } });
      switchButtons()[1].click();
      expect(router.navigate.calls.mostRecent().args[1]).toEqual(jasmine.objectContaining({ queryParams: { view: 'graph' }, queryParamsHandling: 'merge' }));
      component.setView('list');
      expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ view: null });
    });

    it('graph view: the graph is shown instead of the table, and the list is not asked', () => {
      setup({ query: { view: 'graph' } });
      expect(component.view).toBe('graph');
      expect(graph()).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.exec-table')).toBeNull();
      expect(fixture.nativeElement.querySelector('.exec-load-more')).toBeNull();
      expect(executions.list).not.toHaveBeenCalled();
      expect(switchButtons().map(x => x.getAttribute('aria-pressed'))).toEqual(['false', 'true']);
    });

    it('the graph gets the range and every filter (agent, trigger, status, failure conditions, errors, test runs, search)', () => {
      setup({ botid: 'a1', query: { view: 'graph', range: '24h', trigger: 'unattended', status: 'stopped', has_failures: 'true', has_errors: 'true', q: ' r1 ', tests: 'false' } });
      const g = graph();
      expect(g.projectId).toBe('p1');
      expect(g.projectName).toBe('Acme');
      expect(g.range).toBe('24h');
      expect(g.filters).toEqual({ agent_id: 'a1', trigger: 'unattended', status: 'stopped,stopping', has_failures: true, has_errors: true, q: 'r1', test: false });
      // the agents for the graph's names: every bot of the project (one per root id), trashed ones too (not marked deleted)
      expect(g.agents.map((a: any) => a.id)).toEqual(['a1', 'b2', 'z']);
    });

    it('default filters go to the graph as all triggers and test runs included; a filter change hands it a new object once', () => {
      setup({ query: { view: 'graph' } });
      const first = graph().filters;
      expect(first).toEqual({ test: 'all' });
      fixture.detectChanges();
      expect(graph().filters).toBe(first); // no new object per change detection
      query$.next(convertToParamMap({ view: 'graph', q: 'x' }));
      fixture.detectChanges();
      expect(graph().filters).toEqual({ q: 'x', test: 'all' });
      expect(graph().range).toBe('now');
    });

    it('graph view: the cards and the updated note come from the graph answer', () => {
      setup({ query: { view: 'graph' } });
      graph().updated.emit({ graph: { statuses: { ...STATUSES, running: 8 }, with_errors: 3 }, fetchedAt: NOW - 5000 });
      fixture.detectChanges();
      expect(component.counters.running).toBe(8);
      expect(component.withErrors).toBe(3);
      expect(component.updatedAt).toBe(NOW - 5000);
      expect(fixture.nativeElement.querySelector('.exec-updated').textContent).toContain('Executions.UpdatedSeconds');
    });

    it('switching back to the list loads its page (with the stats) at once', () => {
      setup({ query: { view: 'graph' } });
      expect(executions.list).not.toHaveBeenCalled();
      query$.next(convertToParamMap({ view: null }));
      fixture.detectChanges();
      expect(executions.list).toHaveBeenCalledTimes(1);
      expect(executions.list.calls.mostRecent().args[1].with_stats).toBe(true);
      expect(graph()).toBeNull();
    });
  });

  describe('Refresh and the updated note (both views)', () => {
    const refreshButton = () => fixture.nativeElement.querySelector('button.exec-refresh') as HTMLButtonElement;

    it('list view: Refresh re-reads the first page with its stats (one call), disabled while it is in flight', () => {
      setup({ page: { items: [row('e1')], next_cursor: null } });
      expect(refreshButton()).not.toBeNull();
      expect(refreshButton().querySelector('mat-icon, svg')).not.toBeNull();
      const pending = new Subject<any>();
      executions.list.and.returnValue(pending);
      const n = executions.list.calls.count();
      refreshButton().click();
      fixture.detectChanges();
      expect(executions.list.calls.count()).toBe(n + 1);
      expect(executions.list.calls.mostRecent().args[1].with_stats).toBe(true);
      expect(refreshButton().disabled).toBe(true);
      refreshButton().click();
      expect(executions.list.calls.count()).toBe(n + 1);
      pending.next({ items: [row('e2'), row('e1')], next_cursor: null, stats: STATS({ ...STATUSES, failed: 9 }) });
      fixture.detectChanges();
      expect(refreshButton().disabled).toBe(false);
      expect(component.rows.map(r => r._id)).toEqual(['e2', 'e1']);
      expect(component.counters.failed).toBe(9);
    });

    it('list view: "updated N s ago" after each answer', () => {
      setup();
      expect(component.updatedAt).toBe(NOW);
      expect(fixture.nativeElement.querySelector('.exec-updated').textContent).toContain('Executions.UpdatedSeconds');
    });

    it('graph view: Refresh asks the graph, disabled while the graph has a call in flight', () => {
      setup({ query: { view: 'graph' } });
      graph().loadingChange.emit(true);
      fixture.detectChanges();
      expect(refreshButton().disabled).toBe(true);
      graph().loadingChange.emit(false);
      fixture.detectChanges();
      refreshButton().click();
      expect(graph().refresh).toHaveBeenCalledTimes(1);
      expect(executions.list).not.toHaveBeenCalled();
    });
  });

  describe('polling per view', () => {
    let hidden = false;
    const visibility = (h: boolean) => { hidden = h; document.dispatchEvent(new Event('visibilitychange')); };

    it('list view: no 10 s poll fires while the tab is hidden; visible again, it refreshes at once', fakeAsync(() => {
      setup({ page: { items: [row('e1', 'running')], next_cursor: null } });
      hidden = false;
      spyOn(component, 'isHidden').and.callFake(() => hidden);
      const n = executions.list.calls.count();
      visibility(true);
      tick(30000);
      expect(executions.list.calls.count()).toBe(n);
      visibility(false);
      expect(executions.list.calls.count()).toBe(n + 1);
      tick(10000);
      expect(executions.list.calls.count()).toBe(n + 2);
      fixture.destroy();
      discardPeriodicTasks(); // the page's "updated … ago" ticker
    }));

    it('list view: visible again with nothing running asks nothing', fakeAsync(() => {
      setup({ page: { items: [row('e1', 'completed')], next_cursor: null } });
      spyOn(component, 'isHidden').and.callFake(() => hidden);
      const n = executions.list.calls.count();
      visibility(true);
      visibility(false);
      tick(30000);
      expect(executions.list.calls.count()).toBe(n);
      discardPeriodicTasks(); // the page's "updated … ago" ticker
    }));

    it('graph view: the list does not poll (the graph refreshes itself every 60 s)', fakeAsync(() => {
      setup({ page: { items: [row('e1', 'running')], next_cursor: null } });
      const n = executions.list.calls.count();
      query$.next(convertToParamMap({ view: 'graph' }));
      fixture.detectChanges();
      tick(60000);
      expect(executions.list.calls.count()).toBe(n);
      fixture.destroy();
      discardPeriodicTasks(); // the page's "updated … ago" ticker
    }));
  });

  describe('empty notes per view', () => {
    it('list: the filtered note with Clear filters; graph: none of the list notes (the graph has its own)', () => {
      setup({ query: { status: 'failed' } });
      expect(text()).toContain('Executions.EmptyFiltered');
      query$.next(convertToParamMap({ status: 'failed', view: 'graph' }));
      fixture.detectChanges();
      expect(text()).not.toContain('Executions.EmptyFiltered');
      expect(text()).not.toContain('Executions.EmptyNow');
    });
  });
  describe('column sort (feedback 2026-11-13 item 5)', () => {
    const headers = () => Array.from(fixture.nativeElement.querySelectorAll('.exec-table thead th')) as HTMLElement[];
    const sortButton = (field: string) => fixture.nativeElement.querySelector(`.exec-sort[data-sort="${field}"]`) as HTMLButtonElement;
    const th = (field: string) => sortButton(field).closest('th') as HTMLElement;
    const page = { items: [row('e1'), row('e2')], next_cursor: 'c1' };

    it('every column but the chevron has a sort button; Started is sorted newest first by default (aria-sort)', () => {
      setup({ page });
      for (const f of ['status', 'agent_name', 'trigger', 'started_at', 'steps_count', 'failure_conditions', 'vars_changed', 'duration_ms']) {
        expect(sortButton(f)).not.toBeNull(f);
        expect(sortButton(f).getAttribute('type')).toBe('button');
      }
      expect(th('started_at').getAttribute('aria-sort')).toBe('descending');
      expect(th('status').getAttribute('aria-sort')).toBe('none');
      expect(sortButton('started_at').querySelector('.exec-sort-arrow').textContent.trim()).toBe('arrow_downward');
      expect(sortButton('status').querySelector('.exec-sort-arrow')).toBeNull();
      expect(headers()[headers().length - 1].querySelector('.exec-sort')).toBeNull();
    });

    it('the default sort sends no sort/dir (the request is as before)', () => {
      setup({ page });
      const p = executions.list.calls.mostRecent().args[1];
      expect(p.sort).toBeUndefined();
      expect(p.dir).toBeUndefined();
    });

    it('a header click writes sort and dir to the URL: text columns start ascending, numbers and time descending; a second click flips', () => {
      setup({ page });
      sortButton('agent_name').click();
      expect(router.navigate.calls.mostRecent().args[1]).toEqual(jasmine.objectContaining({ queryParams: { sort: 'agent_name', dir: 'asc' }, queryParamsHandling: 'merge' }));
      sortButton('duration_ms').click();
      expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ sort: 'duration_ms', dir: 'desc' });
      // flipping the current sort
      query$.next(convertToParamMap({ sort: 'duration_ms', dir: 'desc' }));
      fixture.detectChanges();
      sortButton('duration_ms').click();
      expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ sort: 'duration_ms', dir: 'asc' });
      // back to the default: no params
      query$.next(convertToParamMap({ sort: 'started_at', dir: 'asc' }));
      fixture.detectChanges();
      sortButton('started_at').click();
      expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ sort: null, dir: null });
    });

    it('sort and dir from the URL go to the list call, the header shows them; invalid values fall back to Started newest first', () => {
      setup({ page, query: { sort: 'steps_count', dir: 'asc' } });
      const p = executions.list.calls.mostRecent().args[1];
      expect(p.sort).toBe('steps_count');
      expect(p.dir).toBe('asc');
      expect(th('steps_count').getAttribute('aria-sort')).toBe('ascending');
      expect(th('started_at').getAttribute('aria-sort')).toBe('none');
      expect(sortButton('steps_count').querySelector('.exec-sort-arrow').textContent.trim()).toBe('arrow_upward');
      query$.next(convertToParamMap({ sort: 'bogus', dir: 'sideways' }));
      fixture.detectChanges();
      expect(component.sort).toEqual({ field: 'started_at', dir: 'desc' });
      expect(executions.list.calls.mostRecent().args[1].sort).toBeUndefined();
      // a valid field without dir: that field's first direction
      query$.next(convertToParamMap({ sort: 'status' }));
      expect(component.sort).toEqual({ field: 'status', dir: 'asc' });
    });

    it('a sort change reloads the first page (no cursor)', () => {
      setup({ page });
      const n = executions.list.calls.count();
      query$.next(convertToParamMap({ sort: 'trigger', dir: 'desc' }));
      expect(executions.list.calls.count()).toBe(n + 1);
      const p = executions.list.calls.mostRecent().args[1];
      expect(p.cursor).toBeUndefined();
      expect(p.sort).toBe('trigger');
    });

    it('Load more keeps the sort', () => {
      setup({ page, query: { sort: 'vars_changed', dir: 'asc' } });
      executions.list.and.returnValue(of({ items: [row('e3')], next_cursor: null }));
      component.loadMore();
      const p = executions.list.calls.mostRecent().args[1];
      expect(p.cursor).toBe('c1');
      expect(p.sort).toBe('vars_changed');
      expect(p.dir).toBe('asc');
    });

    it('the poll keeps the sort, and its page replaces the rows in the server order', fakeAsync(() => {
      setup({ page: { items: [row('e1', 'running', { duration_ms: 50 }), row('e2', 'running', { duration_ms: 10 })], next_cursor: null },
        query: { sort: 'duration_ms', dir: 'desc' } });
      executions.list.and.returnValue(of({ items: [row('e2', 'running', { duration_ms: 90 }), row('e3', 'running', { duration_ms: 70 }), row('e1', 'running', { duration_ms: 60 })], next_cursor: null }));
      tick(10000);
      const p = executions.list.calls.mostRecent().args[1];
      expect(p.sort).toBe('duration_ms');
      expect(p.dir).toBe('desc');
      expect(p.with_stats).toBe(true);
      expect(component.rows.map(r => r._id)).toEqual(['e2', 'e3', 'e1']);
      discardPeriodicTasks();
    }));

    it('a poll under a custom sort with more pages loaded keeps the loaded rows past the first page', fakeAsync(() => {
      setup({ page: { items: [row('e1', 'running'), row('e2', 'running')], next_cursor: 'c1' }, query: { sort: 'status', dir: 'asc' } });
      executions.list.and.returnValue(of({ items: [row('e3', 'running'), row('e4', 'running')], next_cursor: 'c2' }));
      component.loadMore();
      expect(component.rows.map(r => r._id)).toEqual(['e1', 'e2', 'e3', 'e4']);
      executions.list.and.returnValue(of({ items: [row('e2', 'running'), row('e5', 'running')], next_cursor: 'cx' }));
      tick(10000);
      expect(component.rows.map(r => r._id)).toEqual(['e2', 'e5', 'e1', 'e3', 'e4']);
      expect(component.nextCursor).toBe('c2');
      discardPeriodicTasks();
    }));

    it('the graph ignores the sort: its filters do not change and no list call is made in the graph view', () => {
      setup({ query: { view: 'graph' } });
      const before = graph().filters;
      query$.next(convertToParamMap({ view: 'graph', sort: 'status', dir: 'asc' }));
      fixture.detectChanges();
      expect(graph().filters).toBe(before);
      expect(executions.list).not.toHaveBeenCalled();
      expect(fixture.nativeElement.querySelector('.exec-sort')).toBeNull();
    });

    it('Clear filters keeps the sort (it is no filter)', () => {
      setup({ query: { status: 'failed', sort: 'status', dir: 'asc' } });
      component.clearFilters();
      const qp = router.navigate.calls.mostRecent().args[1].queryParams;
      expect('sort' in qp).toBe(false);
      expect('dir' in qp).toBe(false);
    });
  });
});
