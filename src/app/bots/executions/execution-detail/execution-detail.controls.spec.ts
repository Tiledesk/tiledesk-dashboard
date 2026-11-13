import { actionLabel } from '../shared/execution-format';
import { ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ExecutionDetailComponent, POLL_MS, POLL_WAITING_MS } from './execution-detail.component';
import { ExecutionStatusChipComponent } from '../shared/execution-status-chip.component';
import { StopDialogComponent } from '../shared/stop-dialog.component';
import { DestroyDialogComponent } from '../shared/destroy-dialog.component';
import { ExecutionsService } from '../../../services/executions.service';
import { RolesService } from '../../../services/roles.service';
import { LoggerService } from '../../../services/logger/logger.service';
import * as enJson from '../../../../assets/i18n/en.json';

const EN = (enJson as any).default || enJson;
const EXEC_ID = '0193a2f4-0000-7000-8000-000000000001';

function detail(status: string, controls: any[], extra: any = {}): any {
  return {
    execution: {
      _id: EXEC_ID, id_project: 'p1', agent_id: 'a1', agent_name: 'Nightly checks', agent_version: 'v1',
      test: false, request_id: 'r1', conversation_link: null, trigger: { type: 'scheduled' }, status,
      end_reason: null, error: null, handed_to_bot_id: null, failure_conditions: 0, steps_count: 2,
      actions_count: 2, vars_changed: 0, started_at: '2026-11-09T03:00:00.000Z', ended_at: null,
      last_event_at: null, duration_ms: null, last_seq: 2, trace_complete: true, missing_seq: [],
      has_checkpoint: false, has_data: false, retention: null, ...(extra.execution || {}),
    },
    steps: [
      { seq: 1, block_id: 'b1', block_name: 'start', started_at: '2026-11-09T03:00:00.010Z', ended_at: '2026-11-09T03:00:00.020Z',
        duration_ms: 10, outcome: 'success', changed_keys: 0, outside: [],
        actions: [{ index: 0, action_id: 'x1', type: 'setattribute', title: 'Set config' }] },
      { seq: 2, block_id: 'b2', block_name: 'Call status API', started_at: '2026-11-09T03:00:00.300Z', ended_at: null,
        duration_ms: null, outcome: null, changed_keys: 0, outside: [],
        actions: [
          { index: 0, action_id: 'x2', type: 'setattribute', title: 'Prepare' },
          { index: 1, action_id: 'x3', type: 'webrequestv2', title: 'GET status' },
        ] },
    ],
    allowed_controls: controls,
    lineage: { parent: null, previous: null, retry_of: null, retried_as: [] },
  };
}

const ALL_RUNNING = [
  { name: 'stop', allowed: true },
  { name: 'destroy', allowed: true },
];

describe('ExecutionDetailComponent controls', () => {
  let fixture: ComponentFixture<ExecutionDetailComponent>;
  let executions: any;
  let dialog: { open: jasmine.Spy };
  let dialogResult: any;

  function setup(d: any, configured = true) {
    executions = {
      isConfigured: jasmine.createSpy('isConfigured').and.returnValue(configured),
      get: jasmine.createSpy('get').and.returnValue(of(d)),
      state: jasmine.createSpy('state').and.returnValue(of({ step_seq: 1, partial: false, vars: [] })),
      history: jasmine.createSpy('history').and.returnValue(of([])),
      stop: jasmine.createSpy('stop').and.returnValue(of({ status: 'stopping' })),
      destroy: jasmine.createSpy('destroy').and.returnValue(of({ status: 'destroyed', close: 'skipped' })),
    };
    dialogResult = null;
    dialog = { open: jasmine.createSpy('open').and.callFake(() => ({ afterClosed: () => of(dialogResult) })) };
    const perms$ = new Subject<any>();
    TestBed.configureTestingModule({
      declarations: [ExecutionDetailComponent, ExecutionStatusChipComponent],
      imports: [TranslateModule.forRoot(), MatIconModule, MatTooltipModule, MatMenuModule, NoopAnimationsModule],
      providers: [
        { provide: ExecutionsService, useValue: executions },
        { provide: MatDialog, useValue: dialog },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        { provide: ActivatedRoute, useValue: { paramMap: new BehaviorSubject(convertToParamMap({ projectid: 'p1', botid: 'a1', executionid: EXEC_ID })) } },
        { provide: RolesService, useValue: { listenToProjectUserPermissions() {}, getUpdateRequestPermission: () => perms$ } },
        { provide: LoggerService, useValue: { log() {}, debug() {}, warn() {}, error() {} } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    const t = TestBed.inject(TranslateService);
    t.setTranslation('en', EN);
    t.use('en');
    fixture = TestBed.createComponent(ExecutionDetailComponent);
    fixture.detectChanges();
    perms$.next({ role: 'owner', matchedPermissions: [] });
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  /** A control: the header's primary button, or the overflow menu's item (the menu is opened to find it). */
  const btn = (name: string) => (el().querySelector('.ex-controls .ex-ctl-' + name) || menuItem('.ex-ctl-' + name)) as HTMLButtonElement;
  /** An item of the overflow menu (in the overlay, outside the component): opens the menu when it is closed. */
  function menuItem(sel: string): HTMLElement | null {
    const more = el().querySelector('.ex-more') as HTMLButtonElement;
    if (!more) return null;
    if (!document.querySelector('.ex-menu')) {
      more.click();
      fixture.detectChanges();
    }
    return document.querySelector('.ex-menu ' + sel) as HTMLElement;
  }
  /** The visible name of a control (a menu item also holds its icon and reason). */
  const label = (name: string) => {
    const b = btn(name);
    const l = b && b.querySelector('.ex-ctl-label');
    return ((l || b) as HTMLElement).textContent.trim();
  };
  const chip = () => el().querySelector('execution-status-chip').textContent.trim();

  /** Destroys the page inside the fake zone: ends the poll timer. */
  function end() {
    fixture.destroy();
    discardPeriodicTasks();
  }

  afterEach(() => { if (fixture) fixture.destroy(); });

  it('controls rendered from allowed_controls; disabled with tooltip when allowed is false', fakeAsync(() => {
    setup(detail('running', [{ name: 'stop', allowed: false, reason: 'role' }, { name: 'destroy', allowed: false, reason: 'role' }]));
    // stop is the primary button, destroy the overflow menu's last item
    expect(el().querySelectorAll('.ex-controls button').length).toBe(1);
    expect(el().querySelector('.ex-controls .ex-ctl-stop')).not.toBeNull();
    expect(label('stop')).toBe('Stop');
    expect(label('destroy')).toBe('Destroy');
    expect(document.querySelectorAll('.ex-menu button[class*="ex-ctl-"]').length).toBe(1);
    expect(btn('stop').disabled).toBe(true);
    expect(btn('destroy').disabled).toBe(true);
    // the primary's reason is its tooltip (as before); a menu item's is written under its name
    const tips = fixture.debugElement.queryAll(By.directive(MatTooltip)).map(d => d.injector.get(MatTooltip))
      .filter(t => t.message && t.message.indexOf('executions') >= 0).map(t => t.message);
    expect(tips).toEqual(["You don't have permission to stop executions"]);
    expect(btn('destroy').querySelector('.ex-ctl-reason').textContent.trim()).toBe('Only the project owner can destroy executions');
    fixture.destroy();

    TestBed.resetTestingModule();
    setup(detail('running', ALL_RUNNING));
    expect(btn('stop').disabled).toBe(false);
    expect(btn('destroy').disabled).toBe(false);
    expect(btn('stop_hard_now')).toBeNull();
    fixture.destroy();

    TestBed.resetTestingModule();
    setup(detail('completed', []));
    expect(el().querySelector('.ex-controls')).toBeNull();
    end();
  }));

  it('no controls when EXECUTIONS_BASE_URL is empty', fakeAsync(() => {
    setup(detail('running', ALL_RUNNING), false);
    expect(el().querySelector('.ex-controls')).toBeNull();
    expect(executions.get).not.toHaveBeenCalled();
    end();
  }));

  it('stop opens the stop dialog naming the current action and sends the picked mode', fakeAsync(() => {
    setup(detail('running', ALL_RUNNING));
    dialogResult = 'soft';
    btn('stop').click();
    expect(dialog.open).toHaveBeenCalledWith(StopDialogComponent, jasmine.objectContaining({
      data: jasmine.objectContaining({ action: 'GET status', hardOnly: false }),
    }));
    expect(executions.stop).toHaveBeenCalledWith('p1', EXEC_ID, 'soft');

    executions.stop.calls.reset();
    dialogResult = null;
    btn('stop').click();
    expect(executions.stop).not.toHaveBeenCalled();
    end();
  }));

  it('stop names the running web request even when the step already has finished replies', fakeAsync(() => {
    const d = detail('running', ALL_RUNNING);
    d.steps[1].actions = [
      { index: 0, action_id: 'x2', type: 'reply', title: 'Say hi', outcome: 'success', duration_ms: 5 },
      { index: 1, action_id: 'x4', type: 'reply', title: 'Wait please', outcome: 'success', duration_ms: 4 },
      { index: 2, action_id: 'x3', type: 'webrequestv2', title: null, outcome: null, duration_ms: null },
    ];
    setup(d);
    btn('stop').click();
    expect(dialog.open).toHaveBeenCalledWith(StopDialogComponent, jasmine.objectContaining({
      data: jasmine.objectContaining({ action: 'webrequestv2' }),
    }));
    end();
  }));

  it('stop names no action when none is open, and never a finished one', fakeAsync(() => {
    const d = detail('running', ALL_RUNNING);
    d.steps[1].actions = [
      { index: 0, action_id: 'x2', type: 'reply', title: 'Say hi', outcome: 'success', duration_ms: 5 },
    ];
    setup(d);
    btn('stop').click();
    expect(dialog.open).toHaveBeenCalledWith(StopDialogComponent, jasmine.objectContaining({
      data: jasmine.objectContaining({ action: null }),
    }));
    end();
  }));

  it('action label is the one the timeline panels use (title, else type)', () => {
    expect(actionLabel({ type: 'webrequestv2', title: 'GET status' })).toBe('GET status');
    expect(actionLabel({ type: 'webrequestv2', title: null })).toBe('webrequestv2');
    expect(actionLabel(null)).toBeNull();
  });

  it('stop_hard_now calls stop(hard)', fakeAsync(() => {
    setup(detail('stopping', [{ name: 'stop_hard_now', allowed: true }, { name: 'destroy', allowed: true }]));
    expect(label('stop_hard_now')).toBe('Stop now');
    dialogResult = 'hard';
    btn('stop_hard_now').click();
    expect(dialog.open).toHaveBeenCalledWith(StopDialogComponent, jasmine.objectContaining({
      data: jasmine.objectContaining({ hardOnly: true }),
    }));
    expect(executions.stop).toHaveBeenCalledWith('p1', EXEC_ID, 'hard');
    end();
  }));

  it('destroy opens the destroy dialog with the execution id and sends the confirm', fakeAsync(() => {
    setup(detail('stopped', [{ name: 'destroy', allowed: true }]));
    dialogResult = EXEC_ID.slice(0, 6);
    executions.get.and.returnValue(of(detail('destroyed', [], { execution: { end_reason: 'destroyed' } })));
    btn('destroy').click();
    expect(dialog.open).toHaveBeenCalledWith(DestroyDialogComponent, jasmine.objectContaining({
      data: jasmine.objectContaining({ executionId: EXEC_ID }),
    }));
    expect(executions.destroy).toHaveBeenCalledWith('p1', EXEC_ID, '0193a2');
    fixture.detectChanges();
    expect(chip()).toBe('destroyed');
    expect(el().querySelector('.ex-controls')).toBeNull();
    end();
  }));

  it('optimistic stopping chip then reverts on 409 with the reason', fakeAsync(() => {
    setup(detail('running', ALL_RUNNING));
    const answer$ = new Subject<any>();
    executions.stop.and.returnValue(answer$);
    dialogResult = 'hard';
    btn('stop').click();
    fixture.detectChanges();
    expect(chip()).toBe('stopping…');

    // the execution moved meanwhile (stopped is not polled): the 409 reloads the detail once
    const calls = executions.get.calls.count();
    executions.get.and.returnValue(of(detail('stopped', [{ name: 'destroy', allowed: true }])));
    answer$.error(new HttpErrorResponse({ status: 409, error: { error: 'not_allowed', allowed: [{ name: 'destroy', allowed: true }] } }));
    fixture.detectChanges();
    expect(executions.get.calls.count()).toBe(calls + 1);
    expect(chip()).toBe('stopped');
    const msg = el().querySelector('.ex-control-msg').textContent;
    expect(msg).toContain('This control is no longer allowed');
    expect(msg).toContain('Destroy');
    // the server's list replaces the buttons
    expect(btn('stop')).toBeNull();
    expect(btn('destroy')).not.toBeNull();
    tick(POLL_WAITING_MS * 2);
    expect(executions.get.calls.count()).toBe(calls + 1);
    end();
  }));

  it('a 409 swaps in the allowed list even before the reload answers', fakeAsync(() => {
    setup(detail('running', ALL_RUNNING));
    const answer$ = new Subject<any>();
    executions.stop.and.returnValue(answer$);
    dialogResult = 'hard';
    btn('stop').click();
    const reload$ = new Subject<any>();
    executions.get.and.returnValue(reload$);
    answer$.error(new HttpErrorResponse({ status: 409, error: { error: 'not_allowed', allowed: [{ name: 'destroy', allowed: true }] } }));
    fixture.detectChanges();
    expect(btn('stop')).toBeNull();
    expect(btn('destroy')).not.toBeNull();
    reload$.next(detail('stopped', [{ name: 'destroy', allowed: true }]));
    fixture.detectChanges();
    expect(chip()).toBe('stopped');
    end();
  }));

  it('the optimistic chip stays until a poll returns the new status', fakeAsync(() => {
    setup(detail('running', ALL_RUNNING));
    dialogResult = 'soft';
    // the immediate reload still sees running: chip stays
    btn('stop').click();
    fixture.detectChanges();
    expect(chip()).toBe('stopping…');
    executions.get.and.returnValue(of(detail('stopping', [{ name: 'stop_hard_now', allowed: true }])));
    tick(POLL_MS);
    fixture.detectChanges();
    expect(chip()).toBe('stopping');
    expect(btn('stop_hard_now')).not.toBeNull();
    end();
  }));

  it('503 shows "Controls are temporarily unavailable"', fakeAsync(() => {
    setup(detail('running', ALL_RUNNING));
    executions.stop.and.returnValue(throwError(new HttpErrorResponse({ status: 503, error: { error: 'control_unavailable' } }))); // rxjs 6: the value, not a factory
    dialogResult = 'soft';
    btn('stop').click();
    fixture.detectChanges();
    expect(chip()).toBe('running');
    expect(el().querySelector('.ex-control-msg').textContent).toContain('Controls are temporarily unavailable');
    end();
  }));

  it('polls running and stopping every 2 s, waiting every 10 s; stops on stopped', fakeAsync(() => {
    setup(detail('waiting', ALL_RUNNING));
    tick(POLL_MS);
    expect(executions.get).toHaveBeenCalledTimes(1); // waiting: not after 2 s
    tick(POLL_WAITING_MS - POLL_MS);
    expect(executions.get).toHaveBeenCalledTimes(2);
    executions.get.and.returnValue(of(detail('running', ALL_RUNNING)));
    tick(POLL_WAITING_MS);
    expect(executions.get).toHaveBeenCalledTimes(3);
    tick(POLL_MS);
    expect(executions.get).toHaveBeenCalledTimes(4); // running: every 2 s
    executions.get.and.returnValue(of(detail('stopping', [{ name: 'stop_hard_now', allowed: true }])));
    tick(POLL_MS);
    expect(executions.get).toHaveBeenCalledTimes(5);
    executions.get.and.returnValue(of(detail('stopped', [{ name: 'destroy', allowed: true }])));
    tick(POLL_MS);
    expect(executions.get).toHaveBeenCalledTimes(6);
    tick(POLL_WAITING_MS * 5);
    expect(executions.get).toHaveBeenCalledTimes(6);
    end();
  }));

  it('a control sent on a waiting execution polls every 2 s until the status moves', fakeAsync(() => {
    setup(detail('waiting', ALL_RUNNING));
    dialogResult = 'soft';
    executions.stop.and.returnValue(of({ status: 'stopping' }));
    btn('stop').click(); // reloads at once, still waiting
    const after = executions.get.calls.count();
    tick(POLL_MS);
    expect(executions.get.calls.count()).toBe(after + 1);
    end();
  }));

  it('interrupted action label falls back to #<index>; one message is singular', fakeAsync(() => {
    setup(detail('stopped', [{ name: 'destroy', allowed: true }], { execution: {
      stop_mode: 'hard', interrupted_action: { index: 3, action_id: null, type: null, title: null }, messages_while_stopped: 1,
    } }));
    let head = el().querySelector('.ex-head').textContent;
    expect(head).toContain('interrupted "#3"');
    expect(head).toContain('1 message received while stopped');
    expect(head).not.toContain('1 messages');
    fixture.destroy();
    TestBed.resetTestingModule();
    setup(detail('stopped', [{ name: 'destroy', allowed: true }], { execution: { messages_while_stopped: 4 } }));
    head = el().querySelector('.ex-head').textContent;
    expect(head).toContain('4 messages received while stopped');
    end();
  }));

  it('shows stop mode and the interrupted action', fakeAsync(() => {
    setup(detail('stopped', [{ name: 'destroy', allowed: true }], { execution: {
      stop_mode: 'hard', stopped_at: '2026-11-09T03:00:01.000Z',
      interrupted_action: { index: 1, action_id: 'x3', type: 'webrequestv2', title: 'GET status' },
    } }));
    const head = el().querySelector('.ex-head').textContent;
    expect(head).toContain('hard stop');
    expect(head).toContain('interrupted "GET status"');
    end();
  }));
});
