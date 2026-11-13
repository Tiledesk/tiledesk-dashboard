import { ComponentFixture, fakeAsync, TestBed, tick, discardPeriodicTasks } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { ExecutionDetailComponent, POLL_MS } from './execution-detail.component';
import { ExecutionStatusChipComponent } from '../shared/execution-status-chip.component';
import { FlowStatePanelComponent, MaskedValueComponent } from '../shared/flow-state-panel.component';
import { ValueCellComponent } from '../shared/value-cell.component';
import { VarHistoryDrawerComponent } from '../shared/var-history-drawer.component';
import { ExecutionsService } from '../../../services/executions.service';
import { RolesService } from '../../../services/roles.service';
import { LoggerService } from '../../../services/logger/logger.service';
import { ExecutionDetail, StateView } from '../executions.models';
import * as enJson from '../../../../assets/i18n/en.json';

const EN = (enJson as any).default || enJson;
const EXEC_ID = '0193a2f4-0000-7000-8000-000000000001';

function action(id: string, extra: any = {}) {
  return {
    index: 0, action_id: id, type: 'setattribute', title: null, outcome: 'success', exit_taken: null,
    duration_ms: 3, error_code: null, has_data: false, hard_degraded: false, at: null, ...extra,
  };
}

function step(seq: number, extra: any = {}) {
  return {
    seq, block_id: 'b' + seq, block_name: 'Block ' + seq, agent_id: 'a1', agent_version: 'v1',
    started_at: '2026-11-09T03:00:00.010Z', ended_at: '2026-11-09T03:00:00.020Z', duration_ms: 10,
    outcome: 'success', exit_taken: null, state_vars: 3, changed_keys: 0, actions: [], outside: [], ...extra,
  };
}

function detail(status = 'completed', extra: any = {}): ExecutionDetail {
  return {
    execution: {
      _id: EXEC_ID, id_project: 'p1', agent_id: 'a1', agent_name: 'Nightly checks', agent_version: 'v1abcdef',
      test: false, request_id: 'support-group-p1-r1', conversation_link: 'support-group-p1-r1',
      trigger: { type: 'scheduled' }, status, end_reason: null,
      error: status === 'failed' ? { code: 'web_request_error', message: 'x', step_seq: 2 } : null,
      handed_to_bot_id: null, failure_conditions: 0, steps_count: 2, actions_count: 2, vars_changed: 3,
      started_at: '2026-11-09T03:00:00.000Z', ended_at: null, last_event_at: null, duration_ms: 2100,
      last_seq: 5, trace_complete: true, missing_seq: [], has_checkpoint: false, has_data: false, retention: null,
    },
    steps: [
      step(1, { block_name: 'start', changed_keys: 1, actions: [action('act1', { title: 'Set config' })] }),
      step(2, {
        block_name: 'Call status API', outcome: 'error', changed_keys: 2,
        outside: [{ key: 'lastUserText', by: 'message_in' }, { key: 'transcript', by: 'message_in' }, { key: 'ticket_priority', by: 'external' }],
        actions: [action('act2', { type: 'webrequestv2', title: 'GET status', outcome: 'error', exit_taken: 'false', error_code: 'http_500' })],
      }),
    ],
    allowed_controls: [],
    lineage: { parent: null, previous: null, retry_of: null, retried_as: [] },
    ...extra,
  } as any;
}

function stateView(seq: number, vars: any[] = [], partial = false): StateView {
  return { step_seq: seq, partial, vars };
}

describe('ExecutionDetailComponent', () => {
  let fixture: ComponentFixture<ExecutionDetailComponent>;
  let component: ExecutionDetailComponent;
  let executions: { isConfigured: jasmine.Spy; get: jasmine.Spy; state: jasmine.Spy; history: jasmine.Spy };
  let router: { navigate: jasmine.Spy };
  let params$: BehaviorSubject<any>;
  let perms$: Subject<any>;

  function setup(opts: { detail?: any; executionid?: string; role?: string; getError?: boolean } = {}) {
    executions = {
      isConfigured: jasmine.createSpy('isConfigured').and.returnValue(true),
      get: jasmine.createSpy('get').and.returnValue(opts.getError ? throwError(() => new Error('500')) : of(opts.detail || detail())),
      state: jasmine.createSpy('state').and.callFake((_p, _id, seq) => of(stateView(seq, [
        { key: 'kept', reserved: false, before: { type: 'string', size: 4, hash: 'h' }, after: { type: 'string', size: 4, hash: 'h' }, changed: false, by: null },
      ]))),
      history: jasmine.createSpy('history').and.returnValue(of([])),
    };
    router = { navigate: jasmine.createSpy('navigate') };
    params$ = new BehaviorSubject(convertToParamMap({ projectid: 'p1', botid: 'a1', executionid: opts.executionid || EXEC_ID }));
    perms$ = new Subject();
    TestBed.configureTestingModule({
      declarations: [ExecutionDetailComponent, ExecutionStatusChipComponent, FlowStatePanelComponent, MaskedValueComponent, ValueCellComponent, VarHistoryDrawerComponent],
      imports: [TranslateModule.forRoot(), MatIconModule, MatTooltipModule, MatMenuModule, NoopAnimationsModule, MatDialogModule],
      providers: [
        { provide: ExecutionsService, useValue: executions },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { paramMap: params$ } },
        { provide: RolesService, useValue: { listenToProjectUserPermissions() {}, getUpdateRequestPermission: () => perms$ } },
        { provide: LoggerService, useValue: { log() {}, debug() {}, warn() {}, error() {} } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    const t = TestBed.inject(TranslateService);
    t.setTranslation('en', EN);
    t.use('en');
    fixture = TestBed.createComponent(ExecutionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    perms$.next({ role: opts.role === undefined ? 'owner' : opts.role, matchedPermissions: [] });
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const text = () => el().textContent.replace(/\s+/g, ' ');
  const stepButtons = () => Array.from(el().querySelectorAll('.tl-step')) as HTMLButtonElement[];

  describe('header', () => {
    it('shows agent, trigger, version, status, error code, short id, conversation and lineage', () => {
      setup({ detail: detail('failed', { lineage: { parent: null, previous: null, retry_of: '0193b7aa-1111', retried_as: ['0193c8bb-2222'] } }) });
      expect(executions.get).toHaveBeenCalledWith('p1', EXEC_ID);
      const head = el().querySelector('.ex-head').textContent;
      expect(head).toContain('Nightly checks');
      expect(head).toContain('scheduled');
      expect(head).toContain('v1abcdef');
      expect(head).toContain('web_request_error');
      expect(head).toContain('00000001');
      expect(el().querySelector('execution-status-chip')).not.toBeNull();
      expect(head).toContain('retry of');
      expect(head).toContain('retried as');

      (el().querySelector('.ex-conversation') as HTMLButtonElement).click();
      expect(router.navigate).toHaveBeenCalledWith(['/project', 'p1', 'wsrequest', 'support-group-p1-r1', 'messages']);
      (el().querySelector('.ex-lineage-link') as HTMLButtonElement).click();
      expect(router.navigate).toHaveBeenCalledWith(['/project', 'p1', 'monitor', 'a1', 'executions', '0193b7aa-1111']);
    });

    it('renders the control row from allowed_controls (empty in Phase 1: nothing shows)', () => {
      setup();
      expect(el().querySelector('.ex-controls')).toBeNull();
      TestBed.resetTestingModule();
      setup({ detail: detail('running', { allowed_controls: [{ name: 'stop', allowed: true }] }) });
      expect(el().querySelectorAll('.ex-controls button').length).toBe(1);
      fixture.destroy();
    });

    it('no conversation link when conversation_link is null', () => {
      const d = detail();
      d.execution.conversation_link = null;
      setup({ detail: d });
      expect(el().querySelector('.ex-conversation')).toBeNull();
    });
  });

  describe('timeline', () => {
    it('one row per step with outcome and vars changed', () => {
      setup();
      expect(stepButtons().length).toBe(2);
      expect(stepButtons()[1].textContent).toContain('Call status API');
      expect(stepButtons()[1].textContent).toContain('2 attributes changed');
      expect(stepButtons()[0].textContent).toContain('1 attribute changed');
    });

    it('no rows for changes made outside the blocks (incoming message, parameters, outside the flow): the Flow state tab has them', () => {
      setup();
      expect(el().querySelectorAll('.tl-outside').length).toBe(0);
      expect(el().textContent).not.toContain('Incoming message set');
      expect(stepButtons().length).toBe(2);
    });

    it('[Not successful] hides successful steps', () => {
      setup();
      (el().querySelector('.tl-filter-failed') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(stepButtons().length).toBe(1);
      expect(stepButtons()[0].textContent).toContain('Call status API');
    });

    it('an unhandled action shows "not handled" next to its outcome; a handled one does not', () => {
      const d = detail('completed');
      d.steps[1].actions = [
        action('act2', { type: 'webrequestv2', outcome: 'error', exit_taken: null, unhandled: true }),
        action('act3', { index: 1, type: 'webrequestv2', outcome: 'failure_condition', exit_taken: 'false' }),
      ];
      setup({ detail: d });
      stepButtons()[1].click();
      fixture.detectChanges();
      const acts = Array.from(el().querySelectorAll('.tl-action')) as HTMLElement[];
      const mark = acts[0].querySelector('.tl-unhandled');
      expect(mark).not.toBeNull();
      expect(mark.textContent.trim()).toBe(EN.Executions.Detail.NotHandled);
      expect(EN.Executions.Detail.NotHandled).toBe('not handled');
      // right after the outcome
      expect(mark.previousElementSibling.textContent).toContain(EN.Executions.Outcomes.error);
      expect(acts[1].querySelector('.tl-unhandled')).toBeNull();
    });

    it('expanding a step shows its actions and loads its flow state once', () => {
      setup();
      expect(executions.state).not.toHaveBeenCalled();
      stepButtons()[1].click();
      fixture.detectChanges();
      expect(stepButtons()[1].getAttribute('aria-expanded')).toBe('true');
      expect(executions.state).toHaveBeenCalledWith('p1', EXEC_ID, 2);
      const act = el().querySelector('.tl-action').textContent;
      expect(act).toContain('webrequestv2');
      expect(act).toContain('GET status');
      expect(act).toContain('http_500');
      expect(el().querySelector('flow-state-panel')).not.toBeNull();
      // collapse and expand again: cached
      stepButtons()[1].click();
      fixture.detectChanges();
      stepButtons()[1].click();
      fixture.detectChanges();
      expect(executions.state).toHaveBeenCalledTimes(1);
    });

    describe('running action and interrupted block', () => {
      const runningRow = () => el().querySelector('.tl-running-action') as HTMLElement;
      function hung(status: string, extra: any = {}) {
        const d = detail(status, extra);
        d.steps[1].ended_at = null;
        d.steps[1].outcome = null;
        d.steps[1].duration_ms = null;
        d.steps[1].started_at = '2026-11-09T03:00:00.000Z';
        d.steps[1].actions = [action('act2', { title: 'Say hi', at: '2026-11-09T03:00:01.000Z' })];
        return d;
      }

      it('an open block of a running execution shows its next action as running, with elapsed time', () => {
        setup({ detail: hung('running') });
        spyOn(component, 'now').and.returnValue(Date.parse('2026-11-09T03:08:01.000Z'));
        fixture.detectChanges();
        const rows = el().querySelectorAll('.tl-running-action');
        expect(rows.length).toBe(1);
        const t = runningRow().textContent.replace(/\s+/g, ' ');
        // index = number of recorded actions (1); no label known before a stop
        expect(t).toContain('action #1');
        expect(t).toContain('running…');
        expect(t).toContain('8 min');
        expect(component.runningAction(component.detail.steps[1])).toEqual({ index: 1, label: null, elapsed: '8 min' });
        fixture.destroy();
      });

      it('takes the label of the interrupted action with that index, and the block start without actions', () => {
        const d = hung('stopping');
        d.execution.interrupted_action = { index: 1, action_id: 'dep1', type: 'department', title: 'Change department' };
        setup({ detail: d });
        spyOn(component, 'now').and.returnValue(Date.parse('2026-11-09T03:00:31.000Z'));
        fixture.detectChanges();
        expect(runningRow().textContent).toContain('Change department');
        d.steps[1].actions = [];
        expect(component.runningAction(d.steps[1])).toEqual({ index: 0, label: null, elapsed: '31.0 s' });
        fixture.destroy();
      });

      it('no running row when the execution is terminal or stopped, or the block ended', () => {
        setup({ detail: hung('completed') });
        expect(runningRow()).toBeNull();
        expect(component.runningAction(component.detail.steps[0])).toBeNull();
        fixture.destroy();
        TestBed.resetTestingModule();
        setup({ detail: hung('stopped') });
        expect(runningRow()).toBeNull();
        fixture.destroy();
      });

      it('a block closed as interrupted shows the interrupted icon, style and label', () => {
        const d = detail('completed');
        d.steps[1].outcome = 'interrupted';
        setup({ detail: d });
        const b = stepButtons()[1];
        expect(b.classList).toContain('tl-interrupted');
        expect(b.querySelector('.tl-icon').classList).toContain('o-interrupted');
        expect(b.querySelector('.tl-icon').textContent.trim()).toBe('stop_circle');
        expect(b.querySelector('.tl-outcome').textContent.trim()).toBe('interrupted');
        expect(stepButtons()[0].classList).not.toContain('tl-interrupted');
        expect(runningRow()).toBeNull();
      });
    });

    it('a failed state load shows a retry inside the panel', () => {
      setup();
      executions.state.and.returnValue(throwError(() => new Error('500')));
      stepButtons()[0].click();
      fixture.detectChanges();
      expect(text()).toContain('Could not load the flow state.');
      executions.state.and.returnValue(of(stateView(1, [])));
      (el().querySelector('.fs-retry') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(text()).not.toContain('Could not load the flow state.');
      expect(executions.state).toHaveBeenCalledTimes(2);
    });
  });

  describe('flow state tab', () => {
    const vars = [
      { key: 'created', reserved: false, before: null, after: { type: 'string', size: 3, hash: 'a' }, changed: true, by: 'act2' },
      { key: 'removed', reserved: false, before: { type: 'number', size: 2, hash: 'b' }, after: null, changed: true, by: 'act2' },
      { key: 'sys', reserved: true, before: { type: 'string', size: 1, hash: 'c' }, after: { type: 'string', size: 1, hash: 'c' }, changed: false, by: null },
    ];
    const tabKeys = () => Array.from(el().querySelectorAll('.st-row .st-key-name')).map(e => e.textContent.trim());

    function openTab() {
      executions.state.and.callFake((_p, _id, seq) => of(stateView(seq, vars)));
      (el().querySelector('.ex-tab-state') as HTMLButtonElement).click();
      fixture.detectChanges();
    }

    it('Flow state tab switches before/after', () => {
      setup();
      openTab();
      expect(executions.state).toHaveBeenCalledWith('p1', EXEC_ID, 2);
      expect(tabKeys()).toEqual(['created']);
      (el().querySelector('.st-before') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(tabKeys()).toEqual(['removed']);
      expect((el().querySelector('.st-before') as HTMLElement).getAttribute('aria-pressed')).toBe('true');
      // system attributes only when toggled
      (el().querySelector('.st-system-toggle') as HTMLInputElement).click();
      fixture.detectChanges();
      expect(tabKeys()).toEqual(['removed', 'sys']);
    });

    it('shows the partial note in the tab', () => {
      setup();
      executions.state.and.callFake((_p, _id, seq) => of(stateView(seq, vars, true)));
      (el().querySelector('.ex-tab-state') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(text()).toContain('State before this block may be incomplete');
    });

    it('the dropdown picks another step', () => {
      setup();
      openTab();
      component.selectStateStep('1');
      fixture.detectChanges();
      expect(executions.state).toHaveBeenCalledWith('p1', EXEC_ID, 1);
      component.selectStateStep('nope');
      expect(component.fsSeq).toBe(1);
    });

    it('shows the first 50 variables, then "show all"', () => {
      setup();
      const many = Array.from({ length: 60 }, (_, i) => ({
        key: 'v' + String(i).padStart(2, '0'), reserved: false, before: null, after: { type: 'string', size: 1, hash: 'x' }, changed: true, by: 'act1',
      }));
      executions.state.and.callFake((_p, _id, seq) => of(stateView(seq, many)));
      (el().querySelector('.ex-tab-state') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(tabKeys().length).toBe(50);
      (el().querySelector('.st-show-all') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(tabKeys().length).toBe(60);
    });

    it('clicking a variable opens its history drawer', () => {
      setup();
      openTab();
      executions.history.and.returnValue(of([
        { seq: 4, step_seq: 2, block_name: 'Call status API', action_id: 'act2', by: 'act2', op: 'set', type: 'string', size: 3, hash_before: null, hash_after: 'a' },
      ]));
      (el().querySelector('.st-row') as HTMLElement).click();
      fixture.detectChanges();
      expect(executions.history).toHaveBeenCalledWith('p1', EXEC_ID, 'created');
      const drawer = el().querySelector('var-history-drawer');
      expect(drawer.textContent).toContain('GET status');
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      fixture.detectChanges();
      expect(el().querySelector('var-history-drawer')).toBeNull();
    });
  });

  describe('polling', () => {
    it('polling only while running', fakeAsync(() => {
      setup({ detail: detail('running') });
      expect(executions.get).toHaveBeenCalledTimes(1);
      tick(POLL_MS);
      expect(executions.get).toHaveBeenCalledTimes(2);
      tick(POLL_MS);
      expect(executions.get).toHaveBeenCalledTimes(3);
      fixture.destroy();
      tick(POLL_MS * 3);
      expect(executions.get).toHaveBeenCalledTimes(3);
    }));

    it('never polls a finished execution', fakeAsync(() => {
      setup({ detail: detail('completed') });
      tick(POLL_MS * 5);
      expect(executions.get).toHaveBeenCalledTimes(1);
    }));

    it('polling stops on non-running', fakeAsync(() => {
      setup({ detail: detail('running') });
      executions.get.and.returnValue(of(detail('completed')));
      tick(POLL_MS);
      expect(executions.get).toHaveBeenCalledTimes(2);
      tick(POLL_MS * 5);
      expect(executions.get).toHaveBeenCalledTimes(2);
      fixture.detectChanges();
      expect(el().querySelector('execution-status-chip').textContent).toContain('completed');
    }));

    it('polls while stopping too', fakeAsync(() => {
      setup({ detail: detail('stopping') });
      tick(POLL_MS);
      expect(executions.get).toHaveBeenCalledTimes(2);
      fixture.destroy();
    }));

    it('refreshes the open panel of the running step on poll', fakeAsync(() => {
      const running = detail('running');
      running.steps[1].ended_at = null;
      running.steps[1].outcome = null;
      setup({ detail: running });
      stepButtons()[0].click();
      fixture.detectChanges();
      stepButtons()[1].click();
      fixture.detectChanges();
      expect(executions.state.calls.allArgs().map(a => a[2])).toEqual([1, 2]);
      tick(POLL_MS);
      fixture.detectChanges();
      // only the running step (2) is refetched
      expect(executions.state.calls.allArgs().map(a => a[2])).toEqual([1, 2, 2]);
      fixture.destroy();
    }));

    it('a response slower than the poll interval still lands, and the next poll follows it (D2)', fakeAsync(() => {
      setup({ detail: detail('running') });
      const slow = new Subject<any>();
      executions.get.and.returnValue(slow);
      tick(POLL_MS);
      expect(executions.get).toHaveBeenCalledTimes(2);
      tick(POLL_MS * 2); // > 2 s pending: not cancelled by a new poll
      expect(executions.get).toHaveBeenCalledTimes(2);
      slow.next(detail('running', { steps: [...detail('running').steps, step(3, { block_name: 'Third' })] }));
      slow.complete();
      expect(component.timeline.length).toBe(3);
      executions.get.and.returnValue(of(detail('running')));
      tick(POLL_MS - 1);
      expect(executions.get).toHaveBeenCalledTimes(2);
      tick(1);
      expect(executions.get).toHaveBeenCalledTimes(3);
      fixture.destroy();
    }));

    it('a poll error keeps the page and keeps polling', fakeAsync(() => {
      setup({ detail: detail('running') });
      executions.get.and.returnValue(throwError(() => new Error('502')));
      tick(POLL_MS);
      fixture.detectChanges();
      expect(el().querySelector('.ex-head')).not.toBeNull();
      executions.get.and.returnValue(of(detail('running')));
      tick(POLL_MS);
      expect(executions.get).toHaveBeenCalledTimes(3);
      fixture.destroy();
    }));
  });

  describe('errors and route', () => {
    it('error state recoverable', () => {
      setup({ getError: true });
      expect(text()).toContain('Could not load this execution.');
      expect(el().querySelector('.ex-head')).toBeNull();
      executions.get.and.returnValue(of(detail()));
      (el().querySelector('.ex-retry') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(el().querySelector('.ex-head')).not.toBeNull();
      expect(text()).not.toContain('Could not load this execution.');
      expect(executions.get).toHaveBeenCalledTimes(2);
    });

    it('an invalid execution id makes no API call', () => {
      setup({ executionid: '../../etc' });
      expect(executions.get).not.toHaveBeenCalled();
      expect(text()).toContain('This execution id is not valid.');
    });

    it('a route change cancels the in-flight load and clears the old execution', () => {
      setup();
      const slow = new Subject<any>();
      executions.get.and.returnValue(slow);
      params$.next(convertToParamMap({ projectid: 'p1', botid: 'a1', executionid: 'other-id' }));
      fixture.detectChanges();
      expect(component.detail).toBeNull();
      expect(slow.observers.length).toBe(1);
      executions.get.and.returnValue(of(detail()));
      params$.next(convertToParamMap({ projectid: 'p1', botid: 'a1', executionid: EXEC_ID }));
      fixture.detectChanges();
      expect(slow.observers.length).toBe(0);
      expect(component.detail.execution._id).toBe(EXEC_ID);
    });

    it('agents get the no-permission view and no API call', () => {
      setup({ role: 'agent' });
      expect(executions.get).not.toHaveBeenCalled();
      expect(el().querySelector('.unauthorized-message-container-in-page')).not.toBeNull();
    });
  });

  it('role not known yet (\'\'): neither the no-permission view nor an API call (D4)', () => {
    setup({ role: '' });
    expect(component.permitted).toBeNull();
    expect(el().querySelector('.unauthorized-message-container-in-page')).toBeNull();
    expect(executions.get).not.toHaveBeenCalled();
    perms$.next({ role: 'admin', matchedPermissions: [] });
    expect(executions.get).toHaveBeenCalledTimes(1);
  });
});
