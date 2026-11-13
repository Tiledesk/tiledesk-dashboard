import { ComponentFixture, fakeAsync, TestBed, tick, discardPeriodicTasks } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
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
      declarations: [ExecutionsListComponent, ExecutionStatusChipComponent],
      imports: [TranslateModule.forRoot(), MatIconModule, MatTooltipModule, FormsModule, NgSelectModule, ExecutionStatCardsModule],
      providers: [
        { provide: ExecutionsService, useValue: executions },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap(routeParams) }, paramMap: params$, queryParamMap: query$ } },
        { provide: FaqKbService, useValue: faqKb },
        { provide: RolesService, useValue: { listenToProjectUserPermissions() {}, getUpdateRequestPermission: () => perms$ } },
        { provide: LoggerService, useValue: { log() {}, debug() {}, warn() {}, error() {} } },
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

  it('default filter: every trigger, test runs included, from = now-7d', () => {
    setup({ botid: 'a1' });
    const params = executions.list.calls.mostRecent().args[1];
    expect(executions.list.calls.mostRecent().args[0]).toBe('p1');
    expect(params.trigger).toBeUndefined();
    expect(params.test).toBe('all');
    expect(params.agent_id).toBe('a1');
    expect(params.from).toBe(new Date(NOW - 7 * 24 * 3600 * 1000).toISOString());
    expect(params.status).toBeUndefined();
  });

  it('filters come from the URL and map to API params', () => {
    setup({ query: { trigger: 'all', status: 'failed', has_failures: 'true', has_errors: 'true', period: '24h', q: ' abc ' } });
    const p = executions.list.calls.mostRecent().args[1];
    expect(p.trigger).toBeUndefined();
    expect(p.status).toBe('failed');
    expect(p.has_failures).toBe(true);
    expect(p.has_errors).toBe(true);
    expect(p.q).toBe('abc');
    expect(p.agent_id).toBeUndefined();
    expect(p.from).toBe(new Date(NOW - 24 * 3600 * 1000).toISOString());
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
    }));

    it('polling stops when no row is running (never starts)', fakeAsync(() => {
      setup({ page: { items: [row('e1', 'failed')], next_cursor: null } });
      const initial = executions.list.calls.count();
      tick(60000);
      expect(executions.list.calls.count()).toBe(initial);
    }));

    it('stops on destroy', fakeAsync(() => {
      setup({ page: { items: [row('e1', 'running')], next_cursor: null } });
      fixture.destroy();
      const n = executions.list.calls.count();
      tick(60000);
      expect(executions.list.calls.count()).toBe(n);
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
      setup();
      expect(component.hasActiveFilters).toBe(false);
      expect(text()).toContain('Executions.EmptyNone');
      expect(text()).not.toContain('Executions.EmptyFiltered');
    });

    it('with filters, and Clear filters resets them in the URL', () => {
      setup({ query: { status: 'failed' } });
      expect(component.hasActiveFilters).toBe(true);
      expect(text()).toContain('Executions.EmptyFiltered');
      component.clearFilters();
      expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ trigger: null, status: null, has_failures: null, has_errors: null, period: null, q: null, tests: null });
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

    it('one-agent view: one list call with the stats of the list period, agent and test runs; no stats or summary call', () => {
      setup({ botid: 'a1' });
      expect(executions.list).toHaveBeenCalledTimes(1);
      const p = executions.list.calls.mostRecent().args[1];
      expect(p.with_stats).toBe(true);
      expect(p.stats_range).toBe('7d');
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
      expect(more.stats_range).toBeUndefined();
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

    it('the period maps to the stats range', () => {
      setup({ query: { period: '24h' } });
      expect(executions.list.calls.mostRecent().args[1].stats_range).toBe('24h');
      query$.next(convertToParamMap({ period: '30d' }));
      expect(executions.list.calls.mostRecent().args[1].stats_range).toBe('30d');
    });

    it('clicking a card sets the status filter and shows every trigger; Stopped lists stopped and stopping', () => {
      setup({ botid: 'a1', query: { trigger: 'unattended' } });
      cards()[3].click();
      expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ status: 'failed', trigger: null });
      cards()[1].click();
      expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ status: 'waiting', trigger: null });
      query$.next(convertToParamMap({ status: 'waiting', trigger: 'all' }));
      fixture.detectChanges();
      expect(cards()[1].getAttribute('aria-pressed')).toBe('true');
      expect(executions.list.calls.mostRecent().args[1].trigger).toBeUndefined();
      expect(executions.list.calls.mostRecent().args[1].status).toBe('waiting');
      cards()[1].click();
      expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ status: null });
      cards()[2].click();
      expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ status: 'stopped', trigger: null });
      query$.next(convertToParamMap({ status: 'stopped', trigger: 'all' }));
      expect(executions.list.calls.mostRecent().args[1].status).toBe('stopped,stopping');
    });

    it('the hint names the period and says the cards count every trigger', () => {
      setup({ query: { period: '30d' } });
      const hint = fixture.nativeElement.querySelector('.exec-cards-hint').textContent;
      expect(hint).toContain('Executions.Periods.30d');
      expect(hint).toContain('Executions.Triggers.all');
    });

    it('test runs off: list and cards leave them out, and the toggle counts as a filter', () => {
      setup({ botid: 'a1', query: { tests: 'false' } });
      expect(component.filters.tests).toBe(false);
      expect(executions.list.calls.mostRecent().args[1].test).toBeUndefined();
      // no test param: the list and its stats both take real runs only
      expect(executions.list.calls.mostRecent().args[1].with_stats).toBe(true);
      expect(component.hasActiveFilters).toBe(true);
    });

    it('all-agents view: cards for every agent (no agent_id), Agent column from agent_name', () => {
      setup({ page: { items: [row('e1', 'failed', { agent_name: 'Nightly' })], next_cursor: null } });
      const p = executions.list.calls.mostRecent().args[1];
      expect(p.agent_id).toBeUndefined();
      expect(p.with_stats).toBe(true);
      expect(p.stats_range).toBe('7d');
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
      expect(p.stats_range).toBe('7d');
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
    }));

    it('invalid URL values fall back to defaults', () => {
      setup({ query: { period: 'constructor', trigger: 'bogus', status: 'toString', has_failures: 'yes' } });
      expect(component.filters).toEqual({ trigger: 'all', status: '', has_failures: false, has_errors: false, period: '7d', q: '', tests: true });
      expect(executions.list.calls.mostRecent().args[1].from).toBe(new Date(NOW - 7 * 24 * 3600 * 1000).toISOString());
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
    }));

    it('a failed refresh still schedules the next one while rows run (D2)', fakeAsync(() => {
      setup({ page: { items: [row('e1', 'running')], next_cursor: null } });
      executions.list.and.returnValue(throwError(() => new Error('502')));
      const n = executions.list.calls.count();
      tick(10000);
      tick(10000);
      expect(executions.list.calls.count()).toBe(n + 2);
      fixture.destroy();
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

    it('agent switcher, trigger, status and period are ng-selects bound to the current values', async () => {
      setup({ botid: 'a1', query: { trigger: 'webhook', status: 'failed', period: '30d' } });
      await fixture.whenStable();
      expect(select('exec-agent-switcher').injector.get(NgModel).model).toBe('a1');
      expect(select('exec-filter-trigger').injector.get(NgModel).model).toBe('webhook');
      expect(select('exec-filter-status').injector.get(NgModel).model).toBe('failed');
      expect(select('exec-filter-period').injector.get(NgModel).model).toBe('30d');
      expect(fixture.nativeElement.querySelector('select')).toBeNull();
    });

    it('a choice writes the filter to the URL, like the native selects did', () => {
      setup();
      select('exec-filter-trigger').triggerEventHandler('ngModelChange', 'webhook');
      expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ trigger: 'webhook' });
      select('exec-filter-period').triggerEventHandler('ngModelChange', '24h');
      expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ period: '24h' });
      select('exec-filter-period').triggerEventHandler('ngModelChange', '7d');
      expect(router.navigate.calls.mostRecent().args[1].queryParams).toEqual({ period: null });
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
});
