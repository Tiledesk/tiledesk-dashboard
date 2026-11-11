import { ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ExecutionDetailComponent } from './execution-detail.component';
import { ExecutionStatusChipComponent } from '../shared/execution-status-chip.component';
import { ExecutionsService } from '../../../services/executions.service';
import { RolesService } from '../../../services/roles.service';
import { LoggerService } from '../../../services/logger/logger.service';
import { auditSentence } from '../execution-audit';
import * as enJson from '../../../../assets/i18n/en.json';

const EN = (enJson as any).default || enJson;
const EXEC_ID = '0193a2f4-0000-7000-8000-000000000001';

function detail(): any {
  return {
    execution: {
      _id: EXEC_ID, id_project: 'p1', agent_id: 'a1', agent_name: 'Nightly checks', agent_version: 'v1', test: false,
      request_id: 'r1', conversation_link: null, trigger: { type: 'scheduled' }, status: 'stopped', end_reason: null,
      error: null, handed_to_bot_id: null, failure_conditions: 0, steps_count: 1, actions_count: 1, vars_changed: 0,
      started_at: '2026-11-09T03:00:00.000Z', ended_at: null, last_event_at: null, duration_ms: null, last_seq: 1,
      trace_complete: true, missing_seq: [], has_checkpoint: true, has_data: false, retention: null,
    },
    steps: [], allowed_controls: [], lineage: { parent: null, previous: null, retry_of: null, retried_as: [] },
  };
}

function entry(n: number, action: string, details: any = { result: 'accepted' }, reason: string | null = null): any {
  return { audit_id: 'au' + n, at: '2026-11-10T10:00:0' + (n % 10) + '.000Z', actor: { name: 'Anna Rossi', role: 'owner' }, action, reason, details };
}

describe('ExecutionDetailComponent audit tab', () => {
  let fixture: ComponentFixture<ExecutionDetailComponent>;
  let executions: any;
  let perms$: Subject<any>;

  function setup(role: string, matched: string[] = []) {
    executions = {
      isConfigured: jasmine.createSpy('isConfigured').and.returnValue(true),
      get: jasmine.createSpy('get').and.returnValue(of(detail())),
      state: jasmine.createSpy('state').and.returnValue(of({ step_seq: 1, partial: false, vars: [] })),
      history: jasmine.createSpy('history').and.returnValue(of([])),
      audit: jasmine.createSpy('audit').and.callFake((_p: string, _i: string, cursor?: string) => of(cursor
        ? { entries: [entry(3, 'destroy', { result: 'rejected:destroyed' }, 'again')], next_cursor: null }
        : { entries: [entry(1, 'data_viewed', { result: 'accepted', step_seq: 2 }), entry(2, 'stop_hard', { result: 'accepted' })], next_cursor: 'c2' })),
    };
    perms$ = new Subject<any>();
    TestBed.configureTestingModule({
      declarations: [ExecutionDetailComponent, ExecutionStatusChipComponent],
      imports: [TranslateModule.forRoot(), MatIconModule, MatTooltipModule],
      providers: [
        { provide: ExecutionsService, useValue: executions },
        { provide: MatDialog, useValue: { open: jasmine.createSpy('open') } },
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
    perms$.next({ role, matchedPermissions: matched });
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const tabBtn = () => el().querySelector('.ex-tab-audit') as HTMLButtonElement;
  const rows = () => Array.from(el().querySelectorAll('.au-row')).map(r => r.textContent.replace(/\s+/g, ' ').trim());

  afterEach(() => { if (fixture) fixture.destroy(); });

  it('audit tab only for owner or audit permission', fakeAsync(() => {
    setup('owner');
    expect(tabBtn()).not.toBeNull();
    fixture.destroy();
    TestBed.resetTestingModule();
    setup('admin');
    expect(tabBtn()).toBeNull();
    fixture.destroy();
    TestBed.resetTestingModule();
    setup('custom', ['executions_read']);
    expect(tabBtn()).toBeNull();
    fixture.destroy();
    TestBed.resetTestingModule();
    setup('custom', ['executions_read', 'executions_audit_read']);
    expect(tabBtn()).not.toBeNull();
    discardPeriodicTasks();
  }));

  it('load more appends the next page', fakeAsync(() => {
    setup('owner');
    tabBtn().click();
    fixture.detectChanges();
    expect(executions.audit).toHaveBeenCalledWith('p1', EXEC_ID, null);
    expect(rows().length).toBe(2);
    expect(rows()[0]).toContain('Anna Rossi viewed data (block 2)');
    expect(rows()[0]).toContain('accepted');
    (el().querySelector('.au-more') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(executions.audit).toHaveBeenCalledWith('p1', EXEC_ID, 'c2');
    expect(rows().length).toBe(3);
    expect(rows()[2]).toContain('tried to destroy execution 000001 of Nightly checks');
    expect(rows()[2]).toContain('rejected: destroyed');
    expect(rows()[2]).toContain('"again"');
    expect(el().querySelector('.au-more')).toBeNull();
    const router = TestBed.inject(Router) as any;
    (el().querySelector('.au-activities') as HTMLButtonElement).click();
    expect(router.navigate).toHaveBeenCalledWith(['/project', 'p1', 'activities']);
    discardPeriodicTasks();
  }));
});

describe('auditSentence', () => {
  const s = (a: string, d: any) => auditSentence(entry(1, a, d), EXEC_ID, 'Bot');
  it('uses the Activities wording', () => {
    expect(s('stop_soft', { result: 'accepted' })).toBe('Anna Rossi soft-stopped execution 000001 of Bot');
    expect(s('resume', { result: 'requested' })).toBe('Anna Rossi resumed execution 000001 of Bot');
    expect(s('start_new', { result: 'rejected:already_started' })).toBe('Anna Rossi tried to start a new run of execution 000001 of Bot');
    expect(s('data_viewed', { result: 'accepted', key: 'cart' })).toBe('Anna Rossi viewed data (attribute cart)');
    expect(s('data_viewed', { result: 'accepted', purpose: 'trigger' })).toBe('Anna Rossi viewed data (trigger input)');
    expect(s('data_access_requested', { result: 'accepted', scope: { type: 'step', step_seq: 4 } }))
      .toBe('Anna Rossi requested access to the data of execution 000001 of Bot · 1 block');
    expect(s('data_access_denied', { result: 'rejected:forbidden', role: 'admin' }))
      .toBe('Anna Rossi was denied access to the data of execution 000001 of Bot (role admin)');
  });
});
