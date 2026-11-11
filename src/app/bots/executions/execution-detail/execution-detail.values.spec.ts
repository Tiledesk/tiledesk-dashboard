import { ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ExecutionDetailComponent, POLL_MS } from './execution-detail.component';
import { ExecutionStatusChipComponent } from '../shared/execution-status-chip.component';
import { FlowStatePanelComponent, MaskedValueComponent } from '../shared/flow-state-panel.component';
import { VarHistoryDrawerComponent } from '../shared/var-history-drawer.component';
import { ValueCellComponent } from '../shared/value-cell.component';
import { GrantInfo } from '../executions.models';
import { ExecutionsService } from '../../../services/executions.service';
import { RolesService } from '../../../services/roles.service';
import { LoggerService } from '../../../services/logger/logger.service';
import * as enJson from '../../../../assets/i18n/en.json';

const EN = (enJson as any).default || enJson;
const EXEC_ID = '0193a2f4-0000-7000-8000-000000000001';

function detail(running = false): any {
  return {
    execution: {
      _id: EXEC_ID, id_project: 'p1', agent_id: 'a1', agent_name: 'Nightly checks', agent_version: 'v1',
      test: false, request_id: 'r1', conversation_link: null, trigger: { type: 'scheduled' },
      status: running ? 'running' : 'completed', end_reason: null, error: null, handed_to_bot_id: null,
      failure_conditions: 0, steps_count: 2, actions_count: 2, vars_changed: 1,
      started_at: '2026-11-09T03:00:00.000Z', ended_at: running ? null : '2026-11-09T03:00:01.000Z',
      last_event_at: null, duration_ms: 1000, last_seq: 2, trace_complete: true, missing_seq: [],
      has_checkpoint: false, has_data: true,
      retention: { trace_until: '2027-02-07T03:00:00.000Z', data_until: '2026-12-09T03:00:00.000Z' },
    },
    steps: [
      { seq: 1, block_id: 'b1', block_name: 'start', started_at: '2026-11-09T03:00:00.010Z', ended_at: '2026-11-09T03:00:00.020Z',
        duration_ms: 10, outcome: 'success', changed_keys: 1, outside: [], actions: [] },
      { seq: 2, block_id: 'b2', block_name: 'Call status API', started_at: '2026-11-09T03:00:00.300Z',
        ended_at: running ? null : '2026-11-09T03:00:01.000Z', duration_ms: running ? null : 700,
        outcome: running ? null : 'success', changed_keys: 1, outside: [], actions: [] },
    ],
    allowed_controls: [],
    lineage: { parent: null, previous: null, retry_of: null, retried_as: [] },
  };
}

/** A block's state: with a grant, the after side carries a value naming the block and the grant. */
function view(seq: number, grantId?: string): any {
  const after: any = { type: 'string', size: 5, hash: 'h' + seq };
  if (grantId) after.value = 'VAL-' + seq + '-' + grantId;
  return { step_seq: seq, partial: false, vars: [{ key: 'last_status', reserved: false, before: null, after, changed: true, by: 'x1' }] };
}

/** History of last_status: one change per block, with values when read with a grant (the client filters by scope). */
function historyOf(grantId?: string): any[] {
  return [1, 2].map(seq => {
    const e: any = { seq: seq * 10, step_seq: seq, action_id: 'x1', by: 'x1', op: 'set', type: 'string', size: 5,
      hash_before: null, hash_after: 'h' + seq };
    if (grantId) e.after_value = 'HIST-' + seq + '-' + grantId;
    return e;
  });
}

describe('ExecutionDetailComponent values under a grant', () => {
  let fixture: ComponentFixture<ExecutionDetailComponent>;
  let executions: any;
  let dialog: { open: jasmine.Spy };
  let dialogResult: any;
  let perms$: Subject<any>;
  /** requests the test answers itself, when the matching hook is on */
  let pendingState: Array<{ seq: number; grantId?: string; s: Subject<any> }>;
  let pendingHistory: Array<{ grantId?: string; s: Subject<any> }>;
  let pendingTrigger: Array<{ grantId: string; s: Subject<any> }>;
  let holdState: (seq: number, grantId?: string) => boolean;
  let holdHistory: (grantId?: string) => boolean;
  let holdTrigger: boolean;
  let triggerAnswer: any;

  function grant(id = 'g1', scope: GrantInfo['scope'] = { type: 'execution' }, seconds = 900): GrantInfo {
    return { grant_id: id, expires_at: new Date(Date.now() + seconds * 1000).toISOString(), scope, ttl_s: seconds };
  }

  function setup(role = 'owner', d: any = detail()) {
    pendingState = []; pendingHistory = []; pendingTrigger = [];
    holdState = () => false; holdHistory = () => false; holdTrigger = false;
    triggerAnswer = { value: { order_id: 'A-1001', customer: { name: 'Ada', api_key: '[secret]' } } };
    executions = {
      isConfigured: jasmine.createSpy('isConfigured').and.returnValue(true),
      get: jasmine.createSpy('get').and.callFake(() => of(d)),
      state: jasmine.createSpy('state').and.callFake((pid: string, id: string, seq: number, g?: string): Observable<any> => {
        if (holdState(seq, g)) { const s = new Subject<any>(); pendingState.push({ seq, grantId: g, s }); return s; }
        return of(view(seq, g));
      }),
      history: jasmine.createSpy('history').and.callFake((pid: string, id: string, key: string, g?: string): Observable<any> => {
        if (holdHistory(g)) { const s = new Subject<any>(); pendingHistory.push({ grantId: g, s }); return s; }
        return of(historyOf(g));
      }),
      triggerData: jasmine.createSpy('triggerData').and.callFake((pid: string, id: string, g: string): Observable<any> => {
        if (holdTrigger) { const s = new Subject<any>(); pendingTrigger.push({ grantId: g, s }); return s; }
        return of(triggerAnswer);
      }),
      revokeDataAccess: jasmine.createSpy('revokeDataAccess').and.returnValue(of(null)),
    };
    dialogResult = null;
    dialog = { open: jasmine.createSpy('open').and.callFake(() => ({ afterClosed: () => of(dialogResult) })) };
    perms$ = new Subject<any>();
    const params$ = new BehaviorSubject(convertToParamMap({ projectid: 'p1', botid: 'a1', executionid: EXEC_ID }));
    TestBed.configureTestingModule({
      declarations: [ExecutionDetailComponent, ExecutionStatusChipComponent, FlowStatePanelComponent, MaskedValueComponent,
        VarHistoryDrawerComponent, ValueCellComponent],
      imports: [TranslateModule.forRoot(), MatIconModule, MatTooltipModule],
      providers: [
        { provide: ExecutionsService, useValue: executions },
        { provide: MatDialog, useValue: dialog },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
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
    fixture.detectChanges();
    perms$.next({ role, matchedPermissions: [] });
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const cmp = () => fixture.componentInstance;
  const panels = () => Array.from(el().querySelectorAll('flow-state-panel')) as HTMLElement[];
  const drawer = () => el().querySelector('var-history-drawer') as HTMLElement;
  const stateTab = () => el().querySelector('.st') as HTMLElement;
  const strip = () => el().querySelector('.ex-grant-strip') as HTMLElement;
  const trigger = () => el().querySelector('.ex-grant-trigger') as HTMLElement;
  const render = () => fixture.detectChanges();

  afterEach(() => { if (fixture) fixture.destroy(); });

  function openGrant(info: GrantInfo, stepSeq: number | null = null) {
    dialogResult = info;
    cmp().openDataAccess(stepSeq);
    render();
  }

  function expandBoth() {
    const d = cmp().detail;
    cmp().toggleStep(d.steps[0]);
    cmp().toggleStep(d.steps[1]);
    render();
  }

  /** Nothing in memory or on the page holds a value. */
  function expectNoValues() {
    const json = JSON.stringify({ s: Object.values(cmp().states).map(s => s.view), h: cmp().history, t: cmp().triggerSide });
    expect(json).not.toContain('VAL-');
    expect(json).not.toContain('HIST-');
    expect(json).not.toContain('A-1001');
    expect(el().textContent).not.toContain('VAL-');
    expect(el().textContent).not.toContain('HIST-');
    expect(el().textContent).not.toContain('A-1001');
  }

  // ---- brief specs ----

  it('covered block shows values, uncovered keeps masks with View values', fakeAsync(() => {
    setup();
    expandBoth();
    // no grant: both masked, both offer View values
    expect(panels().length).toBe(2);
    panels().forEach(p => expect(p.querySelector('.fs-view-values')).toBeTruthy());
    expect(el().textContent).not.toContain('VAL-');

    openGrant(grant('g1', { type: 'step', step_seq: 2 }), 2);
    expect(executions.state).toHaveBeenCalledWith('p1', EXEC_ID, 2, 'g1');
    expect(executions.state).not.toHaveBeenCalledWith('p1', EXEC_ID, 1, 'g1');
    const [p1, p2] = panels();
    expect(p2.textContent).toContain('"VAL-2-g1"');
    expect(p2.querySelector('.fs-view-values')).toBeNull();
    expect(p1.textContent).not.toContain('VAL-');
    expect(p1.querySelector('.mv-mask')).toBeTruthy();
    const link = p1.querySelector('.fs-view-values') as HTMLButtonElement;
    expect(link.textContent.trim()).toBe('View values');
    dialogResult = null;
    link.click();
    expect(dialog.open.calls.mostRecent().args[1].data.stepSeq).toBe(1);
    cmp().closeGrant();
  }));

  it('no View values without data access', fakeAsync(() => {
    setup('supervisor');
    expandBoth();
    expect(panels().length).toBe(2);
    expect(el().querySelector('.fs-view-values')).toBeNull();
  }));

  it('Flow state tab shows values only for a covered block', fakeAsync(() => {
    setup();
    cmp().setTab('state');
    render();
    expect(cmp().fsSeq).toBe(2);
    openGrant(grant('g1', { type: 'step', step_seq: 1 }), 1);
    expect(stateTab().textContent).not.toContain('VAL-');
    expect(stateTab().querySelector('.st-view-values')).toBeTruthy();
    cmp().selectStateStep('1');
    render();
    expect(stateTab().textContent).toContain('"VAL-1-g1"');
    expect(stateTab().querySelector('.st-view-values')).toBeNull();
    cmp().closeGrant();
  }));

  it('history drawer shows values only for covered steps', fakeAsync(() => {
    setup();
    openGrant(grant('g1', { type: 'step', step_seq: 2 }), 2);
    cmp().openHistory('last_status');
    render();
    expect(executions.history).toHaveBeenCalledWith('p1', EXEC_ID, 'last_status', 'g1');
    const entries = Array.from(drawer().querySelectorAll('.vh-entry')) as HTMLElement[];
    expect(entries.length).toBe(2);
    expect(entries[0].textContent).not.toContain('HIST-1');
    expect(entries[0].querySelector('.mv-mask')).toBeTruthy();
    expect(entries[1].textContent).toContain('"HIST-2-g1"');
    cmp().closeGrant();
  }));

  it('trigger input shown for execution scope', fakeAsync(() => {
    setup();
    openGrant(grant('g1'));
    expect(executions.triggerData).toHaveBeenCalledWith('p1', EXEC_ID, 'g1');
    expect(trigger().textContent).toContain('Trigger input');
    expect(trigger().textContent).toContain('A-1001');
    cmp().closeGrant();
    render();
    // a block grant has no trigger input
    executions.triggerData.calls.reset();
    openGrant(grant('g2', { type: 'step', step_seq: 1 }), 1);
    expect(strip()).toBeTruthy();
    expect(trigger()).toBeNull();
    expect(executions.triggerData).not.toHaveBeenCalled();
    cmp().closeGrant();
    render();
    // a value_state gets its label
    triggerAnswer = { value_state: 'expired' };
    openGrant(grant('g3'));
    expect(trigger().textContent).toContain('no longer kept');
    cmp().closeGrant();
  }));

  it('end of grant restores masks', fakeAsync(() => {
    setup();
    expandBoth();
    cmp().openHistory('last_status');
    openGrant(grant('g1', { type: 'execution' }, 30));
    expect(el().textContent).toContain('VAL-1-g1');
    expect(el().textContent).toContain('HIST-1-g1');
    expect(trigger().textContent).toContain('A-1001');
    cmp().closeGrant();
    render();
    expectNoValues();
    expect(panels()[0].querySelector('.mv-mask')).toBeTruthy();
    expect(drawer().querySelector('.mv-mask')).toBeTruthy();
    // and on expiry
    openGrant(grant('g2', { type: 'execution' }, 5));
    expect(el().textContent).toContain('VAL-1-g2');
    tick(5000);
    render();
    expect(strip()).toBeNull();
    expectNoValues();
    expect(panels()[0].querySelector('.mv-mask')).toBeTruthy();
  }));

  // ---- carried from the Task 6 review ----

  it('[1] slot and history markers are set when the request is sent, not on arrival', fakeAsync(() => {
    setup();
    expandBoth();
    cmp().openHistory('last_status');
    holdState = (_, g) => !!g;
    holdHistory = g => !!g;
    openGrant(grant('g1'));
    expect(cmp().states[1].loading).toBe(true);
    expect(cmp().states[1].grantId).toBe('g1');
    expect(cmp().states[2].grantId).toBe('g1');
    expect(cmp().historyLoading).toBe(true);
    expect(cmp().historyGrantId).toBe('g1');
    cmp().closeGrant();
    expect(cmp().states[1].grantId).toBeNull();
    expect(cmp().historyGrantId).toBeNull();
  }));

  it('[2] every grant read goes through session.guard with the grant id at request', fakeAsync(() => {
    setup();
    expandBoth();
    const guard = spyOn(cmp().session, 'guard').and.callThrough();
    cmp().openHistory('last_status');
    guard.calls.reset();
    openGrant(grant('g1'));
    const ids = guard.calls.allArgs().map(a => a[0]);
    // block 1, block 2, history, trigger
    expect(ids.length).toBe(4);
    expect(ids.every(id => id === 'g1')).toBe(true);
    // and the accept check: a response that slips past the guard with a stale id is not assigned
    const accept = spyOn(cmp().session, 'accept').and.callThrough();
    cmp().loadState(1, true);
    expect(accept).toHaveBeenCalledWith('g1');
    cmp().closeGrant();
  }));

  it('[2] a response assigned only while accept holds', fakeAsync(() => {
    setup();
    expandBoth();
    openGrant(grant('g1'));
    holdState = (_, g) => !!g;
    // a guard that lets everything through: the component's own accept check must still hold the value back
    spyOn(cmp().session, 'guard').and.returnValue((s: any) => s);
    cmp().loadState(1, true);
    const req = pendingState.find(p => p.seq === 1 && p.grantId === 'g1');
    spyOn(cmp().session, 'accept').and.returnValue(false);
    req.s.next({ ...view(1, 'g1'), vars: [{ ...view(1, 'g1').vars[0], after: { type: 'string', size: 5, hash: 'h', value: 'VAL-LATE' } }] });
    render();
    expect(JSON.stringify(cmp().states[1].view)).not.toContain('VAL-LATE');
    (cmp().session.accept as jasmine.Spy).and.callThrough();
    cmp().closeGrant();
  }));

  function pendingAcrossEnd(end: () => void) {
    setup();
    expandBoth();
    cmp().openHistory('last_status');
    holdState = (_, g) => !!g;
    holdHistory = g => !!g;
    holdTrigger = true;
    openGrant(grant('g1', { type: 'execution' }, 5));
    const st = pendingState.filter(p => p.grantId === 'g1');
    const hi = pendingHistory.filter(p => p.grantId === 'g1');
    expect(st.length).toBe(2);
    expect(hi.length).toBe(1);
    expect(pendingTrigger.length).toBe(1);
    end();
    render();
    // the late answers come in after the grant ended
    st.forEach(p => { p.s.next(view(p.seq, 'g1')); p.s.complete(); });
    hi.forEach(p => { p.s.next(historyOf('g1')); p.s.complete(); });
    pendingTrigger.forEach(p => { p.s.next(triggerAnswer); p.s.complete(); });
    render();
    expect(strip()).toBeNull();
    expectNoValues();
    // the visible ones were read again without the grant
    expect(cmp().states[1].view).toEqual(view(1));
    expect(cmp().history).toEqual(historyOf());
  }

  it('[3] state and history pending when the grant is closed show no values', fakeAsync(() => {
    pendingAcrossEnd(() => cmp().closeGrant());
  }));

  it('[3] state and history pending when the grant expires show no values', fakeAsync(() => {
    pendingAcrossEnd(() => tick(5000));
  }));

  it('[4] the trigger value has its own marker and is cleared when the grant ends', fakeAsync(() => {
    setup();
    openGrant(grant('g1'));
    expect(cmp().triggerGrantId).toBe('g1');
    expect(cmp().triggerSide.value).toEqual(triggerAnswer.value);
    // one copy of the trigger input in memory: the side the strip shows
    expect('triggerValue' in cmp()).toBe(false);
    cmp().closeGrant();
    render();
    expect(cmp().triggerGrantId).toBeNull();
    expect(cmp().triggerSide).toBeNull();
    expect(trigger()).toBeNull();
    // replaced by a block grant: the trigger of the first grant goes too
    openGrant(grant('g2'));
    expect(cmp().triggerGrantId).toBe('g2');
    openGrant(grant('g3', { type: 'step', step_seq: 1 }), 1);
    expect(cmp().triggerSide).toBeNull();
    expect(cmp().triggerGrantId).toBeNull();
    cmp().closeGrant();
  }));

  it('[5] a new grant force-reloads expanded blocks, the Flow state tab block and the open history', fakeAsync(() => {
    setup();
    const d = cmp().detail;
    cmp().toggleStep(d.steps[0]);
    cmp().setTab('state'); // fsSeq 2
    cmp().openHistory('last_status');
    render();
    executions.state.calls.reset();
    executions.history.calls.reset();
    openGrant(grant('g1'));
    expect(executions.state).toHaveBeenCalledWith('p1', EXEC_ID, 1, 'g1');
    expect(executions.state).toHaveBeenCalledWith('p1', EXEC_ID, 2, 'g1');
    expect(executions.history).toHaveBeenCalledWith('p1', EXEC_ID, 'last_status', 'g1');
    expect(stateTab().textContent).toContain('VAL-2-g1');
    expect(cmp().states[1].grantId).toBe('g1');
    // replaced: read again with the new grant
    openGrant(grant('g2'));
    expect(cmp().states[1].grantId).toBe('g2');
    expect(JSON.stringify(cmp().states[1].view)).toContain('VAL-1-g2');
    expect(JSON.stringify(cmp().states[2].view)).toContain('VAL-2-g2');
    expect(JSON.stringify(cmp().history)).toContain('HIST-1-g2');
    expect(cmp().historyGrantId).toBe('g2');
    cmp().closeGrant();
  }));

  it('[5] the masked reload after a replacement cannot overwrite the new values', fakeAsync(() => {
    setup();
    expandBoth();
    cmp().openHistory('last_status');
    openGrant(grant('g1'));
    // the reloads without a grant (made when g1 ends) hang until after g2's values came in
    holdState = (_, g) => !g;
    holdHistory = g => !g;
    openGrant(grant('g2'));
    const masked = pendingState.filter(p => !p.grantId);
    expect(masked.length).toBe(2);
    expect(pendingHistory.length).toBe(1);
    masked.forEach(p => { p.s.next(view(p.seq)); p.s.complete(); });
    pendingHistory.forEach(p => { p.s.next(historyOf()); p.s.complete(); });
    render();
    expect(JSON.stringify(cmp().states[1].view)).toContain('VAL-1-g2');
    expect(JSON.stringify(cmp().states[2].view)).toContain('VAL-2-g2');
    expect(JSON.stringify(cmp().history)).toContain('HIST-2-g2');
    expect(panels()[1].textContent).toContain('VAL-2-g2');
    cmp().closeGrant();
  }));

  it('[5] a block cached masked is read with the grant when it is shown', fakeAsync(() => {
    setup();
    const d = cmp().detail;
    cmp().toggleStep(d.steps[0]);
    cmp().toggleStep(d.steps[0]); // collapsed: its masked view stays cached
    render();
    openGrant(grant('g1'));
    executions.state.calls.reset();
    cmp().toggleStep(d.steps[0]);
    render();
    expect(executions.state).toHaveBeenCalledWith('p1', EXEC_ID, 1, 'g1');
    expect(panels()[0].textContent).toContain('VAL-1-g1');
    cmp().closeGrant();
  }));

  it('[6] poll reloads of a live step carry the covering grant', fakeAsync(() => {
    setup('owner', detail(true));
    const d = cmp().detail;
    cmp().toggleStep(d.steps[1]);
    render();
    expect(cmp().states[2].live).toBe(true);
    openGrant(grant('g1'));
    expect(panels()[0].textContent).toContain('VAL-2-g1');
    executions.state.calls.reset();
    tick(POLL_MS);
    render();
    expect(executions.state).toHaveBeenCalledWith('p1', EXEC_ID, 2, 'g1');
    expect(executions.state).not.toHaveBeenCalledWith('p1', EXEC_ID, 2);
    expect(panels()[0].textContent).toContain('VAL-2-g1');
    expect(strip()).toBeTruthy();
    // a block grant on another block: the live block is polled without it
    openGrant(grant('g2', { type: 'step', step_seq: 1 }), 1);
    executions.state.calls.reset();
    tick(POLL_MS);
    render();
    expect(executions.state).toHaveBeenCalledWith('p1', EXEC_ID, 2);
    expect(panels()[0].textContent).not.toContain('VAL-');
    cmp().closeGrant();
    fixture.destroy();
    discardPeriodicTasks();
  }));
});
