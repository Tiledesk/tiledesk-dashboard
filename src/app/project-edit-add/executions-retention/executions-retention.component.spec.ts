import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ExecutionsRetentionComponent, RetentionConfirmDialogComponent } from './executions-retention.component';
import { ExecutionsService } from '../../services/executions.service';
import { LoggerService } from '../../services/logger/logger.service';
import * as enJson from '../../../assets/i18n/en.json';
import * as itJson from '../../../assets/i18n/it.json';

const EN = (enJson as any).default || enJson;
const IT = (itJson as any).default || itJson;

function settings(over: any = {}): any {
  return {
    trace_days: 90, data_days: 30, defaults: { trace_days: 90, data_days: 30 },
    test_days: 7, audit_days: 365, can_edit: true, ...over,
  };
}

describe('ExecutionsRetentionComponent', () => {
  let fixture: ComponentFixture<ExecutionsRetentionComponent>;
  let executions: any;
  let dialog: { open: jasmine.Spy };
  let dialogResult: boolean;

  function setup(s: any = settings(), configured = true) {
    executions = {
      isConfigured: jasmine.createSpy('isConfigured').and.returnValue(configured),
      getRetention: jasmine.createSpy('getRetention').and.returnValue(of(s)),
      putRetention: jasmine.createSpy('putRetention').and.callFake((_p: string, b: any) => of({ ...s, ...b })),
    };
    dialogResult = true;
    dialog = { open: jasmine.createSpy('open').and.callFake(() => ({ afterClosed: () => of(dialogResult) })) };
    TestBed.configureTestingModule({
      declarations: [ExecutionsRetentionComponent],
      imports: [TranslateModule.forRoot(), FormsModule],
      providers: [
        { provide: ExecutionsService, useValue: executions },
        { provide: MatDialog, useValue: dialog },
        { provide: LoggerService, useValue: { log() {}, debug() {}, warn() {}, error() {} } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    const t = TestBed.inject(TranslateService);
    t.setTranslation('en', EN);
    t.use('en');
    fixture = TestBed.createComponent(ExecutionsRetentionComponent);
    fixture.componentInstance.projectId = 'p1';
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const input = (f: 'trace' | 'data') => el().querySelector('.er-' + f + ' input') as HTMLInputElement;
  const save = () => el().querySelector('.er-save') as HTMLButtonElement;
  function type(f: 'trace' | 'data', v: number) {
    const i = input(f);
    i.value = String(v);
    i.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  }
  function clickSave() {
    save().click();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  }

  afterEach(() => { if (fixture) fixture.destroy(); });

  it('shows nothing and does not call the API when executions is not configured', fakeAsync(() => {
    setup(settings(), false);
    expect(el().querySelector('.er')).toBeNull();
    expect(executions.getRetention).not.toHaveBeenCalled();
  }));

  it('shows the values and the fixed lines', fakeAsync(() => {
    setup();
    expect(executions.getRetention).toHaveBeenCalledWith('p1');
    expect(input('trace').value).toBe('90');
    expect(input('data').value).toBe('30');
    expect(el().querySelector('.er-fixed').textContent).toContain('Audit log: 1 year (fixed)');
    expect(el().querySelector('.er-fixed').textContent).toContain('Test runs: 7 days (fixed)');
    expect(save().disabled).toBe(false);
  }));

  it('read-only without can_edit', fakeAsync(() => {
    setup(settings({ can_edit: false }));
    expect(input('trace').disabled).toBe(true);
    expect(input('data').disabled).toBe(true);
    expect(el().querySelector('.er-save')).toBeNull();
    expect(el().querySelector('.er-readonly').textContent).toContain('Only the project owner can change these settings.');
  }));

  it('shortening asks to confirm', fakeAsync(() => {
    setup();
    type('trace', 60);
    clickSave();
    expect(dialog.open).toHaveBeenCalledTimes(1);
    const data = dialog.open.calls.mostRecent().args[1].data;
    expect(data).toEqual({ days: 60, dataZero: false });
    expect(executions.putRetention).toHaveBeenCalledWith('p1', { trace_days: 60, data_days: 30 });
  }));

  it('cancelling the confirm saves nothing', fakeAsync(() => {
    setup();
    type('trace', 60);
    dialogResult = false;
    clickSave();
    expect(dialog.open).toHaveBeenCalled();
    expect(executions.putRetention).not.toHaveBeenCalled();
  }));

  it('data 0 adds the capture warning', fakeAsync(() => {
    setup();
    type('data', 0);
    clickSave();
    expect(dialog.open.calls.mostRecent().args[1].data).toEqual({ days: 0, dataZero: true });
    expect(executions.putRetention).toHaveBeenCalledWith('p1', { trace_days: 90, data_days: 0 });
  }));

  it('lengthening saves without confirm and says Saved', fakeAsync(() => {
    setup();
    type('trace', 120);
    clickSave();
    expect(dialog.open).not.toHaveBeenCalled();
    expect(executions.putRetention).toHaveBeenCalledWith('p1', { trace_days: 120, data_days: 30 });
    expect(el().querySelector('.er-saved').textContent).toContain('Saved');
    // the saved values are now the baseline: lowering back asks again
    type('trace', 100);
    clickSave();
    expect(dialog.open).toHaveBeenCalledTimes(1);
  }));

  it('out of range shows the field error', fakeAsync(() => {
    setup();
    executions.putRetention.and.returnValue(throwError(new HttpErrorResponse({ status: 400, error: { error: 'out_of_range', field: 'data_days' } })));
    type('data', 80);
    clickSave();
    expect(el().querySelector('.er-data .er-error').textContent).toContain('Enter a number from 0 to 90');
    expect(el().querySelector('.er-trace .er-error')).toBeNull();
    expect(el().querySelector('.er-saved')).toBeNull();
  }));

  it('hides the card when the settings cannot be read', fakeAsync(() => {
    setup();
    executions.getRetention.and.returnValue(throwError(new HttpErrorResponse({ status: 403 })));
    fixture = TestBed.createComponent(ExecutionsRetentionComponent);
    fixture.componentInstance.projectId = 'p1';
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(el().querySelector('.er')).toBeNull();
  }));
});

describe('RetentionConfirmDialogComponent', () => {
  function render(data: any, lang = 'en') {
    TestBed.configureTestingModule({
      declarations: [RetentionConfirmDialogComponent],
      imports: [TranslateModule.forRoot(), MatDialogModule],
      providers: [
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    });
    const t = TestBed.inject(TranslateService);
    t.setTranslation('en', EN);
    t.setTranslation('it', IT);
    t.use(lang);
    const f = TestBed.createComponent(RetentionConfirmDialogComponent);
    f.detectChanges();
    return f.nativeElement as HTMLElement;
  }

  it('says what is deleted, and the capture warning only at data 0', () => {
    const a = render({ days: 60, dataZero: false });
    expect(a.textContent).toContain('Data older than 60 days will be deleted within a few minutes. This cannot be undone.');
    expect(a.textContent).not.toContain('no longer be captured');
    TestBed.resetTestingModule();
    const b = render({ days: 0, dataZero: true });
    expect(b.textContent).toContain('Attribute values and inputs will no longer be captured; stopped runs can no longer be resumed from stored data.');
  });

  it('is translated to Italian', () => {
    const a = render({ days: 60, dataZero: true }, 'it');
    expect(a.textContent).toContain('60 giorni');
    expect(a.textContent).not.toContain('Executions.Retention');
  });
});
