import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, EventEmitter, Input, NO_ERRORS_SCHEMA, Output } from '@angular/core';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgSelectModule } from '@ng-select/ng-select';
import { ExecutionStatCardsModule } from '../shared/execution-stat-cards.module';
import { ExecutionsListComponent } from './executions-list.component';
import { ExecutionStatusChipComponent } from '../shared/execution-status-chip.component';
import { ExecutionsService } from '../../../services/executions.service';
import { FaqKbService } from '../../../services/faq-kb.service';
import { RolesService } from '../../../services/roles.service';
import { LoggerService } from '../../../services/logger/logger.service';
import { AuthService } from '../../../core/auth.service';
import { executionGrants, rowOffers, rowsFor, selectable } from './row-actions';
import { StopDialogComponent } from '../shared/stop-dialog.component';
import { DestroyDialogComponent, destroyConfirmCode } from '../shared/destroy-dialog.component';
import { ResumeDialogComponent } from '../shared/resume-dialog.component';
import { BulkDestroyDialogComponent } from '../shared/bulk-destroy-dialog.component';

@Component({ selector: 'execution-graph', template: '' })
class GraphStubComponent {
  @Input() projectId: string; @Input() projectName: string; @Input() agents: any[]; @Input() range: string; @Input() filters: any;
  @Output() updated = new EventEmitter<any>(); @Output() loadingChange = new EventEmitter<boolean>();
}

function row(id: string, status: string, extra: any = {}) {
  return {
    _id: id, agent_id: 'a1', agent_name: 'Nightly', status, end_reason: null, trigger: { type: 'scheduled' },
    started_at: '2026-11-09T03:00:00Z', duration_ms: 2100, steps_count: 4, failure_conditions: 0, errors: 0, vars_changed: 0,
    trace_complete: true, test: false, ...extra,
  };
}

describe('row-actions', () => {
  it('owner and admin get every grant; supervisor and agent none; custom roles by permission', () => {
    expect(executionGrants('owner', [])).toEqual({ control: true, destroy: true });
    expect(executionGrants('admin', [])).toEqual({ control: true, destroy: true });
    expect(executionGrants('supervisor', [])).toEqual({ control: false, destroy: false });
    expect(executionGrants('agent', [])).toEqual({ control: false, destroy: false });
    expect(executionGrants('ops', ['executions_read', 'executions_control'])).toEqual({ control: true, destroy: false });
    expect(executionGrants('ops', ['executions_destroy'])).toEqual({ control: false, destroy: true });
  });

  it('offers pause on running/waiting, resume on stopped/failed, destroy on unfinished runs', () => {
    const all = { control: true, destroy: true };
    expect(rowOffers({ status: 'running' }, 'pause', all)).toBe(true);
    expect(rowOffers({ status: 'waiting' }, 'pause', all)).toBe(true);
    expect(rowOffers({ status: 'stopped' }, 'pause', all)).toBe(false);
    expect(rowOffers({ status: 'stopped' }, 'resume', all)).toBe(true);
    expect(rowOffers({ status: 'failed' }, 'resume', all)).toBe(true);
    expect(rowOffers({ status: 'completed' }, 'resume', all)).toBe(false);
    expect(rowOffers({ status: 'stopping' }, 'destroy', all)).toBe(true);
    expect(rowOffers({ status: 'completed' }, 'destroy', all)).toBe(false);
    expect(rowOffers({ status: 'destroyed' }, 'destroy', all)).toBe(false);
    expect(selectable({ status: 'completed' }, all)).toBe(false);
    expect(rowOffers({ status: 'running' }, 'destroy', { control: true, destroy: false })).toBe(false);
    expect(rowsFor([{ status: 'running' }, { status: 'stopped' }, { status: 'waiting' }], 'pause', all).length).toBe(2);
  });
});

describe('ExecutionsListComponent actions', () => {
  let fixture: ComponentFixture<ExecutionsListComponent>;
  let component: ExecutionsListComponent;
  let executions: any;
  let dialog: { open: jasmine.Spy };
  let dialogAnswer: (component: any) => any;
  let perms$: Subject<any>;

  const ROWS = [row('e-run-000001', 'running'), row('e-stp-000002', 'stopped'), row('e-done-00003', 'completed'), row('e-wait-00004', 'waiting')];

  function setup(role = 'owner', perms: string[] = []) {
    executions = {
      isConfigured: () => true,
      list: jasmine.createSpy('list').and.returnValue(of({ items: ROWS, next_cursor: null })),
      stop: jasmine.createSpy('stop').and.returnValue(of({ status: 'stopping' })),
      resume: jasmine.createSpy('resume').and.returnValue(of({ status: 'running' })),
      destroy: jasmine.createSpy('destroy').and.returnValue(of({ status: 'destroyed', close: 'closed' })),
    };
    dialogAnswer = () => null;
    dialog = { open: jasmine.createSpy('open').and.callFake((c: any) => ({ afterClosed: () => of(dialogAnswer(c)) })) };
    perms$ = new Subject();
    TestBed.configureTestingModule({
      declarations: [ExecutionsListComponent, ExecutionStatusChipComponent, GraphStubComponent],
      imports: [TranslateModule.forRoot(), MatIconModule, MatTooltipModule, FormsModule, NgSelectModule, ExecutionStatCardsModule],
      providers: [
        { provide: ExecutionsService, useValue: executions },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        { provide: ActivatedRoute, useValue: { paramMap: new BehaviorSubject(convertToParamMap({ projectid: 'p1' })), queryParamMap: new BehaviorSubject(convertToParamMap({})) } },
        { provide: FaqKbService, useValue: { getFaqKbByProjectId: () => of([]) } },
        { provide: RolesService, useValue: { listenToProjectUserPermissions() {}, getUpdateRequestPermission: () => perms$ } },
        { provide: LoggerService, useValue: { log() {}, debug() {}, warn() {}, error() {} } },
        { provide: AuthService, useValue: { project_bs: new BehaviorSubject({ _id: 'p1', name: 'Acme' }) } },
        { provide: MatDialog, useValue: dialog },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(ExecutionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    perms$.next({ role, matchedPermissions: perms });
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const rowEl = (i: number) => el().querySelectorAll('tbody tr')[i] as HTMLElement;

  it('shows the checkbox and actions columns for owner and admin, with the actions each status offers', () => {
    setup('admin');
    expect(el().querySelector('.exec-select-all')).not.toBeNull();
    expect(rowEl(0).querySelector('.exec-row-pause')).not.toBeNull();
    expect(rowEl(0).querySelector('.exec-row-destroy')).not.toBeNull();
    expect(rowEl(0).querySelector('.exec-row-resume')).toBeNull();
    expect(rowEl(1).querySelector('.exec-row-resume')).not.toBeNull();
    expect(rowEl(2).querySelector('.exec-actions-cell button')).toBeNull();
    expect((rowEl(2).querySelector('.exec-select-row') as HTMLInputElement).disabled).toBe(true);
  });

  it('hides both columns for a supervisor (read only)', () => {
    setup('supervisor');
    expect(el().querySelector('.exec-select-all')).toBeNull();
    expect(el().querySelector('.exec-actions-head')).toBeNull();
  });

  it('a click on a row action does not open the execution', () => {
    setup('owner');
    const router = TestBed.inject(Router) as any;
    (rowEl(0).querySelector('.exec-row-pause') as HTMLElement).click();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(dialog.open).toHaveBeenCalledWith(StopDialogComponent, jasmine.anything());
  });

  it('row pause: asks the mode, then stops that execution and refreshes', () => {
    setup('owner');
    dialogAnswer = () => 'hard';
    executions.list.calls.reset();
    component.rowAction(ROWS[0] as any, 'pause');
    expect(executions.stop).toHaveBeenCalledWith('p1', 'e-run-000001', 'hard');
    expect(component.actionMessage.key).toBe('Executions.Bulk.Result.pause');
    expect(component.actionMessage.params).toEqual({ done: 1, failed: 0, confirm: 0 });
    expect(executions.list).toHaveBeenCalled();
  });

  it('row destroy: sends the code the dialog confirmed', () => {
    setup('owner');
    dialogAnswer = (c) => (c === DestroyDialogComponent ? 'abc123' : null);
    component.rowAction(ROWS[1] as any, 'destroy');
    expect(executions.destroy).toHaveBeenCalledWith('p1', 'e-stp-000002', 'abc123');
  });

  it('select all selects only the rows an action applies to; the bar counts each action', () => {
    setup('owner');
    component.toggleAll(true);
    fixture.detectChanges();
    expect(component.selected.size).toBe(3);
    expect(component.selectedFor('pause')).toBe(2);
    expect(component.selectedFor('resume')).toBe(1);
    expect(component.selectedFor('destroy')).toBe(3);
    expect(el().querySelector('.exec-bulk-bar')).not.toBeNull();
  });

  it('bulk pause stops the running and waiting rows only, and keeps the failed ones selected', () => {
    setup('owner');
    component.toggleAll(true);
    dialogAnswer = () => 'soft';
    executions.stop.and.callFake((_p: string, id: string) => (id === 'e-wait-00004' ? throwError({ status: 409 }) : of({ status: 'stopping' })));
    component.bulkAction('pause');
    expect(executions.stop.calls.allArgs()).toEqual([['p1', 'e-run-000001', 'soft'], ['p1', 'e-wait-00004', 'soft']]);
    expect(component.actionMessage.params).toEqual({ done: 1, failed: 1, confirm: 0 });
    expect(component.actionMessage.kind).toBe('error');
    expect(component.selected.has('e-run-000001')).toBe(false);
    expect(component.selected.has('e-wait-00004')).toBe(true);
  });

  it('bulk resume counts confirm_required apart', () => {
    setup('owner');
    component.toggleAll(true);
    dialogAnswer = (c) => (c === ResumeDialogComponent ? true : null);
    executions.resume.and.returnValue(throwError({ status: 409, error: { error: 'confirm_required', action: {} } }));
    component.bulkAction('resume');
    expect(executions.resume).toHaveBeenCalledWith('p1', 'e-stp-000002', false);
    expect(component.actionMessage.params).toEqual({ done: 0, failed: 0, confirm: 1 });
  });

  it('bulk destroy asks for the count, then destroys each with its own code', () => {
    setup('owner');
    component.toggleAll(true);
    let data: any;
    dialog.open.and.callFake((c: any, cfg: any) => { data = cfg.data; return { afterClosed: () => of(c === BulkDestroyDialogComponent ? true : null) }; });
    component.bulkAction('destroy');
    expect(data).toEqual({ count: 3 });
    expect(executions.destroy.calls.allArgs().map((a: any[]) => a[1]).sort()).toEqual(['e-run-000001', 'e-stp-000002', 'e-wait-00004']);
    executions.destroy.calls.allArgs().forEach((a: any[]) => expect(a[2]).toBe(destroyConfirmCode(a[1])));
    expect(component.selected.size).toBe(0);
  });

  it('a cancelled dialog sends nothing', () => {
    setup('owner');
    component.toggleAll(true);
    component.bulkAction('destroy');
    component.bulkAction('pause');
    expect(executions.destroy).not.toHaveBeenCalled();
    expect(executions.stop).not.toHaveBeenCalled();
  });

  it('a custom role with control only gets pause/resume but no destroy', () => {
    setup('ops', ['executions_read', 'executions_control']);
    expect(rowEl(0).querySelector('.exec-row-pause')).not.toBeNull();
    expect(rowEl(0).querySelector('.exec-row-destroy')).toBeNull();
    component.toggleAll(true);
    expect(component.selectedFor('destroy')).toBe(0);
  });
});

describe('BulkDestroyDialogComponent', () => {
  it('confirms only when the typed number is the count', () => {
    const ref = { close: jasmine.createSpy('close') };
    const d = new BulkDestroyDialogComponent(ref as any, { count: 3 });
    d.typed = '2';
    d.confirm();
    expect(ref.close).not.toHaveBeenCalled();
    d.typed = ' 3 ';
    d.confirm();
    expect(ref.close).toHaveBeenCalledWith(true);
  });
});
