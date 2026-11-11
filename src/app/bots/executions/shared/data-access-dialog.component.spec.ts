import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, Subject, throwError } from 'rxjs';
import { DataAccessDialogComponent, DataAccessDialogData } from './data-access-dialog.component';
import { ExecutionsService } from '../../../services/executions.service';
import { LoggerService } from '../../../services/logger/logger.service';
import * as enJson from '../../../../assets/i18n/en.json';
import * as itJson from '../../../../assets/i18n/it.json';

const EN = (enJson as any).default || enJson;
const IT = (itJson as any).default || itJson;

const GRANT = { grant_id: 'g1', expires_at: '2026-11-11T10:15:00.000Z', scope: { type: 'execution' } };

describe('DataAccessDialogComponent', () => {
  let fixture: ComponentFixture<DataAccessDialogComponent>;
  let ref: { close: jasmine.Spy };
  let executions: { requestDataAccess: jasmine.Spy };

  function setup(data: DataAccessDialogData, response: any = of(GRANT)) {
    ref = { close: jasmine.createSpy('close') };
    executions = { requestDataAccess: jasmine.createSpy('requestDataAccess').and.returnValue(response) };
    TestBed.configureTestingModule({
      declarations: [DataAccessDialogComponent],
      imports: [TranslateModule.forRoot(), FormsModule, MatDialogModule, MatRadioModule],
      providers: [
        { provide: MatDialogRef, useValue: ref },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: ExecutionsService, useValue: executions },
        { provide: LoggerService, useValue: { log() {}, error() {}, warn() {} } },
      ],
    });
    const t = TestBed.inject(TranslateService);
    t.setTranslation('en', EN);
    t.use('en');
    fixture = TestBed.createComponent(DataAccessDialogComponent);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const text = () => el().textContent.replace(/\s+/g, ' ');
  const confirmBtn = () => el().querySelector('.da-confirm') as HTMLButtonElement;
  function type(value: string) {
    const ta = el().querySelector('.da-reason') as HTMLTextAreaElement;
    ta.value = value;
    ta.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  }

  const BASE: DataAccessDialogData = { projectId: 'p1', executionId: 'e1', stepSeq: null, blockName: null, retentionDays: 30 };

  it('dialog requires a reason', fakeAsync(() => {
    setup(BASE);
    expect(text()).toContain('Your access is recorded in the audit log and shown to the owner');
    expect(confirmBtn().disabled).toBe(true);
    type('  a ');
    expect(confirmBtn().disabled).toBe(true);
    confirmBtn().click();
    expect(executions.requestDataAccess).not.toHaveBeenCalled();
    type('x'.repeat(501));
    expect(confirmBtn().disabled).toBe(true);
    type('500 from status API');
    expect(confirmBtn().disabled).toBe(false);
    confirmBtn().click();
    tick();
    expect(executions.requestDataAccess).toHaveBeenCalledWith('p1', 'e1', { reason: '500 from status API', scope: { type: 'execution' } });
    expect(ref.close).toHaveBeenCalledWith(GRANT);
  }));

  it('header opens on the whole execution with no block option', fakeAsync(() => {
    setup(BASE);
    expect(el().querySelector('.da-scope-step')).toBeNull();
    expect(text()).toContain('Whole execution');
  }));

  it('from a block: "this block" is preselected and sends a step scope', fakeAsync(() => {
    const step = { grant_id: 'g2', expires_at: GRANT.expires_at, scope: { type: 'step', step_seq: 2 } };
    setup({ ...BASE, stepSeq: 2, blockName: 'Call status API' }, of(step));
    expect(text()).toContain('This block (Call status API)');
    expect(text()).toContain('Whole execution');
    type('check the answer');
    confirmBtn().click();
    tick();
    expect(executions.requestDataAccess).toHaveBeenCalledWith('p1', 'e1', { reason: 'check the answer', scope: { type: 'step', step_seq: 2 } });
    expect(ref.close).toHaveBeenCalledWith(step);

    ref.close.calls.reset();
    executions.requestDataAccess.calls.reset();
    (el().querySelector('.da-scope-execution input[type=radio]') as HTMLElement).click();
    fixture.detectChanges();
    tick();
    confirmBtn().click();
    tick();
    expect(executions.requestDataAccess).toHaveBeenCalledWith('p1', 'e1', { reason: 'check the answer', scope: { type: 'execution' } });
  }));

  function fail(status: number, error: string) {
    return throwError(new HttpErrorResponse({ status, error: { error } })); // rxjs 6: the value, not a factory
  }

  it('410 says the data is no longer kept, with the retention days when known', fakeAsync(() => {
    setup(BASE, fail(410, 'data_expired'));
    type('look at it');
    confirmBtn().click();
    tick();
    fixture.detectChanges();
    expect(text()).toContain('The data of this execution is no longer kept (retention 30 days)');
    expect(ref.close).not.toHaveBeenCalled();
    fixture.destroy();

    TestBed.resetTestingModule();
    setup({ ...BASE, retentionDays: null }, fail(410, 'data_expired'));
    type('look at it');
    confirmBtn().click();
    tick();
    fixture.detectChanges();
    expect(text()).toContain('The data of this execution is no longer kept');
    expect(text()).not.toContain('retention');
  }));

  it('403 shows a permission message; 404 no data; other errors a retry', fakeAsync(() => {
    setup(BASE, fail(403, 'forbidden'));
    type('look at it');
    confirmBtn().click();
    tick();
    fixture.detectChanges();
    expect(text()).toContain("You don't have permission to view the data of this execution");
    fixture.destroy();

    TestBed.resetTestingModule();
    setup(BASE, fail(404, 'no_data'));
    type('look at it');
    confirmBtn().click();
    tick();
    fixture.detectChanges();
    expect(text()).toContain('No data was stored for this execution');
    fixture.destroy();

    TestBed.resetTestingModule();
    setup(BASE, fail(500, 'boom'));
    type('look at it');
    confirmBtn().click();
    tick();
    fixture.detectChanges();
    expect(text()).toContain('Could not open the data. Try again.');
    expect(confirmBtn().disabled).toBe(false);
  }));

  it('busy while the request runs; cancel closes with null', fakeAsync(() => {
    const pending = new Subject<any>();
    setup(BASE, pending);
    type('look at it');
    confirmBtn().click();
    fixture.detectChanges();
    expect(confirmBtn().disabled).toBe(true);
    (el().querySelector('.da-cancel') as HTMLElement).click();
    expect(ref.close).toHaveBeenCalledWith(null);
    pending.next(GRANT);
    expect(ref.close).toHaveBeenCalledTimes(1);
  }));

  it('every DataAccess string has an Italian translation', () => {
    const en = EN.Executions.DataAccess;
    const it = IT.Executions.DataAccess;
    expect(en).toBeTruthy();
    Object.keys(en).forEach(k => expect(typeof it[k]).toBe('string', k));
    const all = JSON.stringify(en).toLowerCase() + JSON.stringify(it).toLowerCase();
    expect(all).not.toContain('variab');
  });
});
