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
import { ExecutionDetailComponent, POLL_MS, START_NEW_WAIT_MS } from './execution-detail.component';
import { ExecutionStatusChipComponent } from '../shared/execution-status-chip.component';
import { ResumeDialogComponent } from '../shared/resume-dialog.component';
import { StartNewDialogComponent } from '../shared/start-new-dialog.component';
import { ExecutionsService } from '../../../services/executions.service';
import { RolesService } from '../../../services/roles.service';
import { LoggerService } from '../../../services/logger/logger.service';
import * as enJson from '../../../../assets/i18n/en.json';

const EN = (enJson as any).default || enJson;
const EXEC_ID = '0193a2f4-0000-7000-8000-000000000001';
const NEW_ID = '0193a2f4-0000-7000-8000-000000000099';
/** short id: the last 8 characters of the id without dashes */
const NEW_TAIL = NEW_ID.replace(/-/g, '').slice(-8);

function detail(status: string, controls: any[], extra: any = {}): any {
  return {
    execution: {
      _id: EXEC_ID, id_project: 'p1', agent_id: 'a1', agent_name: 'Nightly checks', agent_version: 'v1',
      test: false, request_id: 'r1', conversation_link: null, trigger: { type: 'scheduled' }, status,
      end_reason: null, error: null, handed_to_bot_id: null, failure_conditions: 0, steps_count: 1,
      actions_count: 1, vars_changed: 0, started_at: '2026-11-09T03:00:00.000Z', ended_at: null,
      last_event_at: null, duration_ms: null, last_seq: 1, trace_complete: true, missing_seq: [],
      has_checkpoint: true, has_data: false, retention: null, ...(extra.execution || {}),
    },
    steps: [
      { seq: 1, block_id: 'b1', block_name: 'Call status API', started_at: '2026-11-09T03:00:00.010Z', ended_at: '2026-11-09T03:00:00.020Z',
        duration_ms: 10, outcome: 'interrupted', changed_keys: 0, outside: [],
        actions: [{ index: 0, action_id: 'x1', type: 'webrequestv2', title: 'GET status' }] },
    ],
    allowed_controls: controls,
    lineage: { parent: null, previous: null, retry_of: null, retried_as: [], ...(extra.lineage || {}) },
  };
}

const STOPPED = [
  { name: 'destroy', allowed: true },
  { name: 'resume', allowed: true },
  { name: 'start_new', allowed: true },
];

describe('ExecutionDetailComponent resume and start new', () => {
  let fixture: ComponentFixture<ExecutionDetailComponent>;
  let executions: any;
  let dialog: { open: jasmine.Spy };
  let results: any[];

  function setup(d: any) {
    executions = {
      isConfigured: jasmine.createSpy('isConfigured').and.returnValue(true),
      get: jasmine.createSpy('get').and.returnValue(of(d)),
      state: jasmine.createSpy('state').and.returnValue(of({ step_seq: 1, partial: false, vars: [] })),
      history: jasmine.createSpy('history').and.returnValue(of([])),
      stop: jasmine.createSpy('stop').and.returnValue(of({ status: 'stopping' })),
      destroy: jasmine.createSpy('destroy').and.returnValue(of({ status: 'destroyed', close: 'skipped' })),
      resume: jasmine.createSpy('resume').and.returnValue(of({ status: 'running' })),
      startNewInput: jasmine.createSpy('startNewInput').and.returnValue(of({ input: { customer: { api_key: null } }, masked: ['customer.api_key'] })),
      startNew: jasmine.createSpy('startNew').and.returnValue(of({ status: 'started' })),
    };
    // one dialog answer per open, in order
    results = [];
    dialog = { open: jasmine.createSpy('open').and.callFake(() => ({ afterClosed: () => of(results.length ? results.shift() : null) })) };
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
  const msg = () => { const m = el().querySelector('.ex-control-msg'); return m ? m.textContent.replace(/\s+/g, ' ') : ''; };
  const err409 = (error: any) => new HttpErrorResponse({ status: 409, error });

  function end() {
    fixture.destroy();
    discardPeriodicTasks();
  }

  afterEach(() => { if (fixture) fixture.destroy(); });

  it('resume and start new are rendered from allowed_controls; a blocked one shows its reason', fakeAsync(() => {
    setup(detail('stopped', [
      { name: 'destroy', allowed: true },
      { name: 'resume', allowed: false, reason: 'no_checkpoint' },
      { name: 'start_new', allowed: false, reason: 'role' },
    ]));
    expect(label('resume')).toBe('Resume');
    expect(label('start_new')).toBe('Start new');
    expect(btn('resume').disabled).toBe(true);
    expect(btn('start_new').disabled).toBe(true);
    // resume is the primary for stopped (its reason a tooltip); start new is in the menu (its reason under its name)
    expect(el().querySelector('.ex-controls .ex-ctl-resume')).not.toBeNull();
    const tips = fixture.debugElement.queryAll(By.directive(MatTooltip)).map(d => d.injector.get(MatTooltip))
      .map(t => t.message).filter(m => !!m);
    expect(tips).toContain('There is no saved point to continue from');
    expect(btn('start_new').querySelector('.ex-ctl-reason').textContent.trim()).toBe("You don't have permission to control executions");
    end();
  }));

  it('resume opens the dialog with the interrupted action, sends no confirm and shows resuming…', fakeAsync(() => {
    setup(detail('stopped', STOPPED, { execution: {
      stop_mode: 'hard', interrupted_action: { index: 0, action_id: 'x1', type: 'webrequestv2', title: 'GET status' },
    } }));
    const answer$ = new Subject<any>();
    executions.resume.and.returnValue(answer$);
    results.push(true);
    btn('resume').click();
    expect(dialog.open).toHaveBeenCalledWith(ResumeDialogComponent, jasmine.objectContaining({
      data: { action: 'GET status', calling: false, automation: false },
    }));
    expect(executions.resume).toHaveBeenCalledWith('p1', EXEC_ID, false);
    fixture.detectChanges();
    expect(chip()).toBe('resuming…');
    expect(btn('start_new').disabled).toBe(true);

    executions.get.and.returnValue(of(detail('running', [{ name: 'stop', allowed: true }, { name: 'destroy', allowed: true }])));
    answer$.next({ status: 'running' });
    fixture.detectChanges();
    expect(chip()).toBe('running');
    expect(btn('stop')).not.toBeNull();
    end();
  }));

  it('cancelling the resume dialog sends nothing', fakeAsync(() => {
    setup(detail('stopped', STOPPED));
    results.push(null);
    btn('resume').click();
    expect(executions.resume).not.toHaveBeenCalled();
    end();
  }));

  it('confirm_required reopens the dialog with the warning', fakeAsync(() => {
    setup(detail('failed', STOPPED, { execution: { trigger: { type: 'automation' } } }));
    executions.resume.and.returnValues(
      throwError(err409({ error: 'confirm_required', action: { index: 0, type: 'webrequestv2', title: null } })),
      of({ status: 'running' }),
    );
    results.push(true, true);
    btn('resume').click();
    expect(dialog.open).toHaveBeenCalledTimes(2);
    expect(dialog.open.calls.argsFor(1)).toEqual([ResumeDialogComponent, jasmine.objectContaining({
      data: { action: 'webrequestv2', calling: true, automation: true },
    })]);
    expect(executions.resume.calls.allArgs()).toEqual([['p1', EXEC_ID, false], ['p1', EXEC_ID, true]]);
    fixture.detectChanges();
    expect(msg()).toBe('');
    expect(chip()).toBe('resuming…');
    end();
  }));

  it('confirm_required then cancel: nothing more is sent and the chip reverts', fakeAsync(() => {
    setup(detail('stopped', STOPPED));
    executions.resume.and.returnValue(throwError(err409({ error: 'confirm_required', action: { index: 2, type: 'webrequestv2', title: 'POST order' } })));
    results.push(true, null);
    btn('resume').click();
    expect(dialog.open.calls.argsFor(1)[1].data).toEqual({ action: 'POST order', calling: true, automation: false });
    expect(executions.resume).toHaveBeenCalledTimes(1);
    fixture.detectChanges();
    expect(chip()).toBe('stopped');
    expect(btn('resume').disabled).toBe(false);
    end();
  }));

  it('not_resumable offers start new', fakeAsync(() => {
    setup(detail('stopped', STOPPED));
    const allowed = [{ name: 'destroy', allowed: true }, { name: 'resume', allowed: false, reason: 'version_gone' }, { name: 'start_new', allowed: true }];
    executions.resume.and.returnValue(throwError(err409({ error: 'not_resumable', reason: 'version_gone', allowed })));
    executions.get.and.returnValue(of(detail('stopped', allowed.filter(a => a.name !== 'resume'))));
    results.push(true);
    btn('resume').click();
    fixture.detectChanges();
    expect(msg()).toContain('It cannot be resumed: the agent version it ran is no longer available.');
    const offer = el().querySelector('.ex-offer-start-new') as HTMLButtonElement;
    expect(offer).not.toBeNull();
    expect(offer.textContent.trim()).toBe('Start new');

    results.push({ customer: { api_key: 'k' } });
    offer.click();
    expect(executions.startNewInput).toHaveBeenCalledWith('p1', EXEC_ID);
    expect(dialog.open.calls.mostRecent().args[0]).toBe(StartNewDialogComponent);
    expect(executions.startNew).toHaveBeenCalledWith('p1', EXEC_ID, { customer: { api_key: 'k' } });
    end();
  }));

  it('not_resumable without start new allowed shows no offer', fakeAsync(() => {
    setup(detail('stopped', STOPPED));
    const allowed = [{ name: 'destroy', allowed: true }, { name: 'resume', allowed: false, reason: 'no_checkpoint' }, { name: 'start_new', allowed: false, reason: 'not_unattended' }];
    executions.resume.and.returnValue(throwError(err409({ error: 'not_resumable', reason: 'no_checkpoint', allowed })));
    executions.get.and.returnValue(of(detail('stopped', allowed)));
    results.push(true);
    btn('resume').click();
    fixture.detectChanges();
    expect(msg()).toContain('It cannot be resumed: there is no saved point to continue from.');
    expect(el().querySelector('.ex-offer-start-new')).toBeNull();
    end();
  }));

  it('busy, no agent server and unseal failures have their own messages', fakeAsync(() => {
    const cases: [number, any, string][] = [
      [409, { error: 'busy' }, 'still releasing this execution'],
      [503, { error: 'no_agent_server' }, 'No agent server is available'],
      [503, { error: 'control_unavailable' }, 'Controls are temporarily unavailable'],
      [500, { error: 'unseal_failed' }, 'saved state of this execution could not be read'],
      [502, { error: 'version_check_failed' }, 'agent version could not be checked'],
    ];
    cases.forEach(([status, error, text], i) => {
      if (i) { fixture.destroy(); TestBed.resetTestingModule(); }
      setup(detail('stopped', STOPPED));
      executions.resume.and.returnValue(throwError(new HttpErrorResponse({ status, error })));
      results.push(true);
      btn('resume').click();
      fixture.detectChanges();
      expect(msg()).toContain(text);
    });
    end();
  }));

  it('start new loads the input, opens the dialog and sends exactly the edited object', fakeAsync(() => {
    setup(detail('completed', [{ name: 'start_new', allowed: true }]));
    const edited = { customer: { api_key: 'k-1' }, note: 'edited' };
    results.push(edited);
    btn('start_new').click();
    expect(executions.startNewInput).toHaveBeenCalledWith('p1', EXEC_ID);
    expect(dialog.open).toHaveBeenCalledWith(StartNewDialogComponent, jasmine.objectContaining({
      data: jasmine.objectContaining({ agentName: 'Nightly checks', input: { customer: { api_key: null } }, masked: ['customer.api_key'] }),
    }));
    expect(executions.startNew).toHaveBeenCalledWith('p1', EXEC_ID, edited);
    fixture.detectChanges();
    expect(el().querySelector('.ex-starting').textContent).toContain('Starting a new execution');
    expect(chip()).toBe('completed');

    // the new execution appears in retried_as on the next poll: a link to it
    executions.get.and.returnValue(of(detail('completed', [{ name: 'start_new', allowed: true }], { lineage: { retried_as: [NEW_ID] } })));
    tick(POLL_MS);
    fixture.detectChanges();
    expect(el().querySelector('.ex-starting')).toBeNull();
    const link = el().querySelector('.ex-started-link') as HTMLButtonElement;
    expect(link.textContent).toContain(NEW_TAIL);
    link.click();
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['/project', 'p1', 'monitor', 'a1', 'executions', NEW_ID]);
    end();
  }));

  it('start new: an id already in retried_as is not taken for the new one', fakeAsync(() => {
    const OLD = '0193a2f4-0000-7000-8000-000000000050';
    setup(detail('failed', STOPPED, { lineage: { retried_as: [OLD] } }));
    results.push({ customer: { api_key: 'k' } });
    btn('start_new').click();
    tick(POLL_MS);
    fixture.detectChanges();
    expect(el().querySelector('.ex-started-link')).toBeNull();
    expect(el().querySelector('.ex-starting')).not.toBeNull();
    executions.get.and.returnValue(of(detail('failed', STOPPED, { lineage: { retried_as: [OLD, NEW_ID] } })));
    tick(POLL_MS);
    fixture.detectChanges();
    expect(el().querySelector('.ex-started-link').textContent).toContain(NEW_TAIL);
    end();
  }));

  it('start new: polling gives up when the new execution does not appear', fakeAsync(() => {
    setup(detail('completed', [{ name: 'start_new', allowed: true }]));
    results.push({ customer: { api_key: 'k' } });
    btn('start_new').click();
    tick(START_NEW_WAIT_MS + POLL_MS);
    fixture.detectChanges();
    expect(el().querySelector('.ex-starting')).toBeNull();
    expect(msg()).toContain('has not appeared yet');
    const calls = executions.get.calls.count();
    tick(POLL_MS * 5);
    expect(executions.get.calls.count()).toBe(calls);
    expect(btn('start_new').disabled).toBe(false);
    end();
  }));

  it('already_started shows "A new run was just started"', fakeAsync(() => {
    setup(detail('completed', [{ name: 'start_new', allowed: true }]));
    executions.startNew.and.returnValue(throwError(err409({ error: 'already_started' })));
    results.push({ customer: { api_key: 'k' } });
    btn('start_new').click();
    fixture.detectChanges();
    expect(msg()).toContain('A new run was just started');
    end();
  }));

  it('missing_input reopens the dialog with the fields highlighted and the edited input', fakeAsync(() => {
    setup(detail('completed', [{ name: 'start_new', allowed: true }]));
    const first = { customer: { api_key: 'k' } };
    executions.startNew.and.returnValues(
      throwError(new HttpErrorResponse({ status: 400, error: { error: 'missing_input', fields: ['customer.api_key'] } })),
      of({ status: 'started' }),
    );
    results.push(first, { customer: { api_key: 'k2' } });
    btn('start_new').click();
    expect(dialog.open).toHaveBeenCalledTimes(2);
    const data = dialog.open.calls.argsFor(1)[1].data;
    expect(data.missing).toEqual(['customer.api_key']);
    expect(data.masked).toEqual(['customer.api_key']);
    expect(JSON.parse(data.text)).toEqual(first);
    expect(executions.startNewInput).toHaveBeenCalledTimes(1);
    expect(executions.startNew.calls.argsFor(1)).toEqual(['p1', EXEC_ID, { customer: { api_key: 'k2' } }]);
    end();
  }));

  it('start new input load errors are shown and nothing is sent', fakeAsync(() => {
    setup(detail('completed', [{ name: 'start_new', allowed: true }]));
    executions.startNewInput.and.returnValue(throwError(new HttpErrorResponse({ status: 503, error: { error: 'control_unavailable' } })));
    btn('start_new').click();
    fixture.detectChanges();
    expect(dialog.open).not.toHaveBeenCalled();
    expect(executions.startNew).not.toHaveBeenCalled();
    expect(msg()).toContain('Controls are temporarily unavailable');
    expect(btn('start_new').disabled).toBe(false);
    end();
  }));

  // ---- fix wave: contracts 1-4, M3/M4, deadlines ----

  it('no_trigger_source has its own tooltip', fakeAsync(() => {
    setup(detail('completed', [{ name: 'start_new', allowed: false, reason: 'no_trigger_source' }]));
    const tips = fixture.debugElement.queryAll(By.directive(MatTooltip)).map(d => d.injector.get(MatTooltip))
      .map(t => t.message).filter(m => !!m);
    expect(tips).toContain('Started by a direct call, not through a webhook: there is nothing to run again');
    end();
  }));

  ['not_unattended', 'unsupported_trigger'].forEach(reason => {
    it('not_resumable ' + reason + ' has a specific message', fakeAsync(() => {
      setup(detail('stopped', STOPPED));
      results.push(true);
      executions.resume.and.returnValue(throwError(err409({ error: 'not_resumable', reason, allowed: [{ name: 'destroy', allowed: true }] })));
      btn('resume').click();
      fixture.detectChanges();
      expect(msg()).toContain(reason === 'not_unattended'
        ? 'only scheduled, webhook and automation runs can be resumed'
        : 'connector triggers are not supported yet');
      end();
    }));
  });

  it('start new: 409 not_startable shows the reason and stops pending', fakeAsync(() => {
    setup(detail('completed', [{ name: 'start_new', allowed: true }]));
    executions.startNew.and.returnValue(throwError(err409({ error: 'not_startable', reason: 'webhook_not_found' })));
    results.push({ customer: { api_key: 'k' } });
    btn('start_new').click();
    fixture.detectChanges();
    expect(msg()).toContain('This run cannot be started again (webhook_not_found).');
    expect(el().querySelector('.ex-starting')).toBeNull();
    expect(btn('start_new').disabled).toBe(false);
    end();
  }));

  it('start new: 504 refire_unconfirmed says it may have started and keeps polling for retried_as', fakeAsync(() => {
    setup(detail('completed', [{ name: 'start_new', allowed: true }]));
    executions.startNew.and.returnValue(throwError(new HttpErrorResponse({ status: 504, error: { error: 'refire_unconfirmed' } })));
    results.push({ customer: { api_key: 'k' } });
    btn('start_new').click();
    fixture.detectChanges();
    expect(msg()).toContain('The new run may have started. Checking…');
    expect(el().querySelector('.ex-starting')).not.toBeNull();
    executions.get.and.returnValue(of(detail('completed', [{ name: 'start_new', allowed: true }], { lineage: { retried_as: [NEW_ID] } })));
    tick(POLL_MS);
    fixture.detectChanges();
    expect(el().querySelector('.ex-started-link').textContent).toContain(NEW_TAIL);
    expect(msg()).not.toContain('may have started');
    end();
  }));

  it('start new: 504 refire_unconfirmed gives up at the same deadline', fakeAsync(() => {
    setup(detail('completed', [{ name: 'start_new', allowed: true }]));
    executions.startNew.and.returnValue(throwError(new HttpErrorResponse({ status: 504, error: { error: 'refire_unconfirmed' } })));
    results.push({ customer: { api_key: 'k' } });
    btn('start_new').click();
    tick(START_NEW_WAIT_MS + POLL_MS);
    fixture.detectChanges();
    expect(el().querySelector('.ex-starting')).toBeNull();
    expect(msg()).toContain('has not appeared yet');
    end();
  }));

  it('start new: 502 refire_failed keeps the Try again copy', fakeAsync(() => {
    setup(detail('completed', [{ name: 'start_new', allowed: true }]));
    executions.startNew.and.returnValue(throwError(new HttpErrorResponse({ status: 502, error: { error: 'refire_failed' } })));
    results.push({ customer: { api_key: 'k' } });
    btn('start_new').click();
    fixture.detectChanges();
    expect(msg()).toContain('could not be started. Try again.');
    end();
  }));

  it('start new: polling gives up even when every poll fails', fakeAsync(() => {
    setup(detail('completed', [{ name: 'start_new', allowed: true }]));
    results.push({ customer: { api_key: 'k' } });
    btn('start_new').click();
    executions.get.and.returnValue(throwError(new HttpErrorResponse({ status: 500 })));
    tick(START_NEW_WAIT_MS + POLL_MS * 2);
    fixture.detectChanges();
    expect(el().querySelector('.ex-starting')).toBeNull();
    expect(msg()).toContain('has not appeared yet');
    const calls = executions.get.calls.count();
    tick(POLL_MS * 5);
    expect(executions.get.calls.count()).toBe(calls);
    end();
  }));

  it('a pending resume ends at the deadline when every poll fails', fakeAsync(() => {
    setup(detail('stopped', STOPPED));
    results.push(true);
    executions.resume.and.returnValue(of({ status: 'running' }));
    executions.get.and.returnValue(throwError(new HttpErrorResponse({ status: 500 })));
    btn('resume').click();
    tick(START_NEW_WAIT_MS + POLL_MS * 2);
    fixture.detectChanges();
    expect(chip()).toBe('stopped');
    const calls = executions.get.calls.count();
    tick(POLL_MS * 5);
    expect(executions.get.calls.count()).toBe(calls);
    end();
  }));

  it('resumed_at clears a pending resume even if the status is back to the one it started from', fakeAsync(() => {
    setup(detail('stopped', STOPPED));
    results.push(true);
    executions.resume.and.returnValue(of({ status: 'running' }));
    executions.get.and.returnValue(of(detail('stopped', STOPPED, { execution: { resumed_at: '2026-11-11T10:00:00.000Z' } })));
    btn('resume').click();
    fixture.detectChanges();
    expect(chip()).toBe('stopped');
    expect(btn('resume').disabled).toBe(false);
    end();
  }));

  it('the stop banner and interrupted action show only while stopping or stopped', fakeAsync(() => {
    const stale = { stop_mode: 'hard', interrupted_action: { index: 0, action_id: 'x1', type: 'webrequestv2', title: 'GET status' } };
    setup(detail('running', [{ name: 'stop', allowed: true }], { execution: stale }));
    expect(el().querySelector('.ex-stop-mode')).toBeNull();
    expect(el().querySelector('.ex-interrupted')).toBeNull();
    end();
  }));

  it('the stop banner shows while stopped', fakeAsync(() => {
    const info = { stop_mode: 'hard', interrupted_action: { index: 0, action_id: 'x1', type: 'webrequestv2', title: 'GET status' } };
    setup(detail('stopped', STOPPED, { execution: info }));
    expect(el().querySelector('.ex-stop-mode')).not.toBeNull();
    expect(el().querySelector('.ex-interrupted').textContent).toContain('GET status');
    end();
  }));

  it('start new passes stored to the dialog', fakeAsync(() => {
    setup(detail('completed', [{ name: 'start_new', allowed: true }]));
    executions.startNewInput.and.returnValue(of({ input: {}, masked: [], stored: 'none' }));
    btn('start_new').click();
    expect(dialog.open.calls.argsFor(0)[1].data.stored).toBe('none');
    end();
  }));
});
