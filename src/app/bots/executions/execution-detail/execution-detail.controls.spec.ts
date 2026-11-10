import { ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ExecutionDetailComponent, POLL_MS } from './execution-detail.component';
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
      imports: [TranslateModule.forRoot(), MatIconModule, MatTooltipModule],
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
  const btn = (name: string) => el().querySelector('.ex-ctl-' + name) as HTMLButtonElement;
  const chip = () => el().querySelector('execution-status-chip').textContent.trim();

  /** Destroys the page inside the fake zone: ends the poll timer. */
  function end() {
    fixture.destroy();
    discardPeriodicTasks();
  }

  afterEach(() => { if (fixture) fixture.destroy(); });

  it('controls rendered from allowed_controls; disabled with tooltip when allowed is false', fakeAsync(() => {
    setup(detail('running', [{ name: 'stop', allowed: false, reason: 'role' }, { name: 'destroy', allowed: false, reason: 'role' }]));
    expect(el().querySelectorAll('.ex-controls button').length).toBe(2);
    expect(btn('stop').textContent.trim()).toBe('Stop');
    expect(btn('destroy').textContent.trim()).toBe('Destroy');
    expect(btn('stop').disabled).toBe(true);
    expect(btn('destroy').disabled).toBe(true);
    const tips = fixture.debugElement.queryAll(By.directive(MatTooltip)).map(d => d.injector.get(MatTooltip))
      .filter(t => t.message && t.message.indexOf('executions') >= 0).map(t => t.message);
    expect(tips).toEqual([
      "You don't have permission to stop executions",
      'Only the project owner can destroy executions',
    ]);
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

  it('stop_hard_now calls stop(hard)', fakeAsync(() => {
    setup(detail('stopping', [{ name: 'stop_hard_now', allowed: true }, { name: 'destroy', allowed: true }]));
    expect(btn('stop_hard_now').textContent.trim()).toBe('Stop now');
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

    answer$.error(new HttpErrorResponse({ status: 409, error: { error: 'not_allowed', allowed: [{ name: 'destroy', allowed: true }] } }));
    fixture.detectChanges();
    expect(chip()).toBe('running');
    const msg = el().querySelector('.ex-control-msg').textContent;
    expect(msg).toContain('This control is no longer allowed');
    expect(msg).toContain('Destroy');
    // the server's list replaces the buttons
    expect(btn('stop')).toBeNull();
    expect(btn('destroy')).not.toBeNull();
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

  it('polls while running, waiting and stopping; stops on stopped', fakeAsync(() => {
    setup(detail('waiting', ALL_RUNNING));
    tick(POLL_MS);
    expect(executions.get).toHaveBeenCalledTimes(2);
    executions.get.and.returnValue(of(detail('stopped', [{ name: 'destroy', allowed: true }])));
    tick(POLL_MS);
    expect(executions.get).toHaveBeenCalledTimes(3);
    tick(POLL_MS * 5);
    expect(executions.get).toHaveBeenCalledTimes(3);
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
