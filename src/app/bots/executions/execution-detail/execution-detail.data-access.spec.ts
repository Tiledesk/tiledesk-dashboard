import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ExecutionDetailComponent } from './execution-detail.component';
import { ExecutionStatusChipComponent } from '../shared/execution-status-chip.component';
import { DataAccessDialogComponent } from '../shared/data-access-dialog.component';
import { dataRetentionDays, GrantInfo } from '../executions.models';
import { ExecutionsService } from '../../../services/executions.service';
import { RolesService } from '../../../services/roles.service';
import { LoggerService } from '../../../services/logger/logger.service';
import { PERMISSIONS } from '../../../utils/permissions.constants';
import * as enJson from '../../../../assets/i18n/en.json';

const EN = (enJson as any).default || enJson;
const EXEC_ID = '0193a2f4-0000-7000-8000-000000000001';
const DAY = 86400000;

function detail(extra: any = {}): any {
  return {
    execution: {
      _id: EXEC_ID, id_project: 'p1', agent_id: 'a1', agent_name: 'Nightly checks', agent_version: 'v1',
      test: false, request_id: 'r1', conversation_link: null, trigger: { type: 'scheduled' }, status: 'completed',
      end_reason: null, error: null, handed_to_bot_id: null, failure_conditions: 0, steps_count: 2,
      actions_count: 2, vars_changed: 1, started_at: '2026-11-09T03:00:00.000Z', ended_at: '2026-11-09T03:00:01.000Z',
      last_event_at: null, duration_ms: 1000, last_seq: 2, trace_complete: true, missing_seq: [],
      has_checkpoint: false, has_data: true,
      retention: { trace_until: '2027-02-07T03:00:00.000Z', data_until: '2026-12-09T03:00:00.000Z' },
      ...(extra.execution || {}),
    },
    steps: [
      { seq: 1, block_id: 'b1', block_name: 'start', started_at: '2026-11-09T03:00:00.010Z', ended_at: '2026-11-09T03:00:00.020Z',
        duration_ms: 10, outcome: 'success', changed_keys: 1, outside: [], actions: [] },
      { seq: 2, block_id: 'b2', block_name: 'Call status API', started_at: '2026-11-09T03:00:00.300Z', ended_at: '2026-11-09T03:00:01.000Z',
        duration_ms: 700, outcome: 'success', changed_keys: 0, outside: [], actions: [] },
    ],
    allowed_controls: [],
    lineage: { parent: null, previous: null, retry_of: null, retried_as: [] },
  };
}

const MASKED_VIEW = { step_seq: 1, partial: false, vars: [
  { key: 'last_status', reserved: false, before: null, after: { type: 'string', size: 5, hash: 'h1' }, changed: true, by: 'x1' },
] };
const VALUE_VIEW = { step_seq: 1, partial: false, grant: { expires_at: '' }, actions: [], vars: [
  { key: 'last_status', reserved: false, before: null, after: { type: 'string', size: 5, hash: 'h1', value: '500' }, changed: true, by: 'x1' },
] };

describe('ExecutionDetailComponent data access', () => {
  let fixture: ComponentFixture<ExecutionDetailComponent>;
  let executions: any;
  let dialog: { open: jasmine.Spy };
  let dialogResult: any;
  let perms$: Subject<any>;

  function grant(seconds = 900, scope: GrantInfo['scope'] = { type: 'execution' }): GrantInfo {
    return { grant_id: 'g1', expires_at: new Date(Date.now() + seconds * 1000).toISOString(), scope };
  }

  function setup(role: string, matchedPermissions: string[] = [], d: any = detail()) {
    executions = {
      isConfigured: jasmine.createSpy('isConfigured').and.returnValue(true),
      get: jasmine.createSpy('get').and.returnValue(of(d)),
      state: jasmine.createSpy('state').and.returnValue(of(MASKED_VIEW)),
      history: jasmine.createSpy('history').and.returnValue(of([])),
      revokeDataAccess: jasmine.createSpy('revokeDataAccess').and.returnValue(of(null)),
    };
    dialogResult = null;
    dialog = { open: jasmine.createSpy('open').and.callFake(() => ({ afterClosed: () => of(dialogResult) })) };
    perms$ = new Subject<any>();
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
    perms$.next({ role, matchedPermissions });
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const cmp = () => fixture.componentInstance;
  const viewData = () => el().querySelector('.ex-view-data') as HTMLButtonElement;
  const strip = () => el().querySelector('.ex-grant-strip') as HTMLElement;

  afterEach(() => { if (fixture) fixture.destroy(); });

  /** Opens a grant through the header button. */
  function openGrant(info: GrantInfo) {
    dialogResult = info;
    viewData().click();
    fixture.detectChanges();
  }

  it('View data shown only with data access', fakeAsync(() => {
    const cases: Array<[string, string[], boolean]> = [
      ['owner', [], true],
      ['admin', [], true],
      ['supervisor', [], false],
      ['custom', [PERMISSIONS.EXECUTIONS_READ], false],
      ['custom', [PERMISSIONS.EXECUTIONS_READ, PERMISSIONS.EXECUTIONS_DATA_ACCESS], true],
    ];
    cases.forEach(([role, perms, shown], i) => {
      if (i) { fixture.destroy(); TestBed.resetTestingModule(); }
      setup(role, perms);
      expect(!!viewData()).toBe(shown, role + ' ' + perms.join(','));
      if (shown) expect(viewData().textContent.trim()).toBe('View data');
    });
  }));

  it('retention days come from data_until and started_at; unknown when they do not make whole days', () => {
    const e: any = detail().execution;
    expect(dataRetentionDays(e)).toBe(30);
    expect(dataRetentionDays({ ...e, retention: null })).toBeNull();
    expect(dataRetentionDays({ ...e, started_at: null })).toBeNull();
    expect(dataRetentionDays({ ...e, retention: { trace_until: null, data_until: '2026-11-10T15:00:00.000Z' } })).toBeNull();
    expect(dataRetentionDays({ ...e, retention: { trace_until: null, data_until: e.started_at } })).toBeNull();
  });

  it('View data opens the dialog on the whole execution; the grant shows the strip with a countdown', fakeAsync(() => {
    setup('owner');
    openGrant(grant(900));
    expect(dialog.open).toHaveBeenCalledTimes(1);
    const [component, config] = dialog.open.calls.mostRecent().args;
    expect(component).toBe(DataAccessDialogComponent);
    expect(config.data).toEqual({ projectId: 'p1', executionId: EXEC_ID, stepSeq: null, blockName: null, retentionDays: 30 });
    expect(strip()).toBeTruthy();
    expect(strip().textContent).toContain('Sealed data');
    expect(strip().textContent).toContain('recorded in the audit log');
    expect(strip().textContent).toContain('whole execution');
    expect(el().querySelector('.ex-grant-countdown').textContent).toContain('15:00');
    tick(1000);
    fixture.detectChanges();
    expect(el().querySelector('.ex-grant-countdown').textContent).toContain('14:59');
    expect(cmp().session.active).toBe(true);
    expect(cmp().session.covers(2)).toBe(true);
    cmp().closeGrant();
  }));

  it('a block grant names the block in the strip', fakeAsync(() => {
    setup('owner');
    dialogResult = grant(900, { type: 'step', step_seq: 2 });
    cmp().openDataAccess(2);
    fixture.detectChanges();
    expect(dialog.open.calls.mostRecent().args[1].data).toEqual(
      { projectId: 'p1', executionId: EXEC_ID, stepSeq: 2, blockName: 'Call status API', retentionDays: 30 });
    expect(strip().textContent).toContain('block Call status API');
    expect(cmp().session.covers(1)).toBe(false);
    cmp().closeGrant();
  }));

  it('cancelling the dialog starts nothing', fakeAsync(() => {
    setup('owner');
    openGrant(null);
    expect(strip()).toBeNull();
    expect(cmp().session.active).toBe(false);
  }));

  /** A block and the history loaded with values under the grant (Task 7 loads them; the clearing is here). */
  function seedValues(grantId: string) {
    cmp().expanded.add(1);
    cmp().states[1] = { view: VALUE_VIEW as any, loading: false, error: false, live: false, grantId };
    cmp().states[2] = { view: VALUE_VIEW as any, loading: false, error: false, live: false, grantId };
    cmp().historyKey = 'last_status';
    cmp().history = [{ seq: 3, step_seq: 1, action_id: 'x1', by: 'x1', op: 'set', type: 'string', size: 5,
      hash_before: null, hash_after: 'h1', after_value: '500' }];
    cmp().historyGrantId = grantId;
  }

  function expectNoValues() {
    const json = JSON.stringify({ states: Object.values(cmp().states).map(s => s.view), history: cmp().history });
    expect(json).not.toContain('"value"');
    expect(json).not.toContain('after_value');
    expect(json).not.toContain('500');
  }

  it('Close revokes and clears values', fakeAsync(() => {
    setup('owner');
    openGrant(grant(900));
    seedValues('g1');
    executions.state.calls.reset();
    (el().querySelector('.ex-grant-close') as HTMLElement).click();
    fixture.detectChanges();
    expect(executions.revokeDataAccess).toHaveBeenCalledWith('p1', EXEC_ID, 'g1');
    expect(strip()).toBeNull();
    expect(cmp().session.active).toBe(false);
    // the expanded block is reloaded without the grant, the hidden one dropped, the history reloaded
    expect(executions.state).toHaveBeenCalledWith('p1', EXEC_ID, 1);
    expect(cmp().states[2]).toBeUndefined();
    expect(executions.history).toHaveBeenCalledWith('p1', EXEC_ID, 'last_status');
    expectNoValues();
  }));

  it('expiry ends the strip and clears values without a revoke', fakeAsync(() => {
    setup('owner');
    openGrant(grant(5));
    seedValues('g1');
    tick(5000);
    fixture.detectChanges();
    expect(strip()).toBeNull();
    expect(executions.revokeDataAccess).not.toHaveBeenCalled();
    expectNoValues();
  }));

  it('a late value response after Close is discarded', fakeAsync(() => {
    setup('owner');
    openGrant(grant(900));
    const late = new Subject<any>();
    const seen: any[] = [];
    late.pipe(cmp().session.guard(cmp().session.grantId)).subscribe(v => seen.push(v));
    cmp().closeGrant();
    late.next(VALUE_VIEW);
    expect(seen).toEqual([]);
  }));

  it('leaving the page revokes an active grant', fakeAsync(() => {
    setup('owner');
    openGrant(grant(900));
    fixture.destroy();
    expect(executions.revokeDataAccess).toHaveBeenCalledWith('p1', EXEC_ID, 'g1');
  }));

  it('nothing is written to localStorage or sessionStorage', fakeAsync(() => {
    const setItem = spyOn(Storage.prototype, 'setItem').and.callThrough();
    setup('owner');
    openGrant(grant(5));
    seedValues('g1');
    tick(1000);
    fixture.detectChanges();
    cmp().closeGrant();
    openGrant(grant(3));
    tick(3000);
    fixture.detectChanges();
    expect(setItem).not.toHaveBeenCalled();
  }));
});
