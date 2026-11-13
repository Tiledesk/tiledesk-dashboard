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
    // nothing changed yet: nothing to save
    expect(save().disabled).toBe(true);
  }));

  it('saving without a change sends nothing', fakeAsync(() => {
    setup();
    fixture.componentInstance.save();
    expect(executions.putRetention).not.toHaveBeenCalled();
    type('trace', 60);
    expect(save().disabled).toBe(false);
    type('trace', 90);
    expect(save().disabled).toBe(true);
    clickSave();
    expect(dialog.open).not.toHaveBeenCalled();
    expect(executions.putRetention).not.toHaveBeenCalled();
  }));

  it('both lowered: one confirm line each', fakeAsync(() => {
    setup();
    type('trace', 30);
    type('data', 7);
    clickSave();
    expect(dialog.open.calls.mostRecent().args[1].data).toEqual({ traceDays: 30, dataDays: 7, dataZero: false });
    expect(executions.putRetention).toHaveBeenCalledWith('p1', { trace_days: 30, data_days: 7 });
  }));

  it('sealed data longer than the trace: own message, no confirm, no save', fakeAsync(() => {
    setup();
    type('trace', 20);
    type('data', 25);
    clickSave();
    expect(dialog.open).not.toHaveBeenCalled();
    expect(executions.putRetention).not.toHaveBeenCalled();
    expect(el().querySelector('.er-data .er-error').textContent).toContain('Sealed data cannot be kept longer than the trace (20 days).');
    type('data', 20);
    expect(el().querySelector('.er-data .er-error')).toBeNull();
  }));

  it('read-only without can_edit', fakeAsync(() => {
    setup(settings({ can_edit: false }));
    expect(input('trace').disabled).toBe(true);
    expect(input('data').disabled).toBe(true);
    expect(el().querySelector('.er-save')).toBeNull();
    expect(el().querySelector('.er-readonly').textContent)
      .toContain('Only the project owner, or a role allowed to read the executions audit, can change these settings.');
  }));

  it('shortening asks to confirm', fakeAsync(() => {
    setup();
    type('trace', 60);
    clickSave();
    expect(dialog.open).toHaveBeenCalledTimes(1);
    const data = dialog.open.calls.mostRecent().args[1].data;
    expect(data).toEqual({ traceDays: 60, dataZero: false });
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
    expect(dialog.open.calls.mostRecent().args[1].data).toEqual({ dataDays: 0, dataZero: true });
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

  const p = (h: HTMLElement) => Array.from(h.querySelectorAll('p')).map(x => x.textContent.trim());

  it('one line per lowered setting, "This cannot be undone." once and last', () => {
    const a = render({ traceDays: 60, dataZero: false });
    expect(p(a)).toEqual(['Traces of runs older than 60 days will be deleted within a few minutes.', 'This cannot be undone.']);
    TestBed.resetTestingModule();
    const b = render({ traceDays: 30, dataDays: 7, dataZero: false });
    expect(p(b)).toEqual([
      'Traces of runs older than 30 days will be deleted within a few minutes.',
      'Attribute values, inputs and checkpoints of runs older than 7 days will be deleted within a few minutes.',
      'This cannot be undone.',
    ]);
    expect(b.textContent).not.toContain('no longer be captured');
  });

  it('data 0: everything stored goes, capture stops, no "0 days"', () => {
    const a = render({ dataDays: 0, dataZero: true });
    expect(p(a)).toEqual([
      'All stored attribute values, inputs and checkpoints will be deleted within a few minutes.',
      'Attribute values and inputs will no longer be captured; stopped runs can no longer be resumed from stored data.',
      'This cannot be undone.',
    ]);
    expect(a.textContent).not.toContain('0 days');
  });

  it('1 day is singular', () => {
    const a = render({ dataDays: 1, dataZero: false });
    expect(a.textContent).toContain('Attribute values, inputs and checkpoints of runs older than 1 day will be deleted within a few minutes.');
    TestBed.resetTestingModule();
    const b = render({ dataDays: 1, dataZero: false }, 'it');
    expect(b.textContent).toContain('1 giorno');
    expect(b.textContent).not.toContain('1 giorni');
  });

  it('is translated to Italian', () => {
    const a = render({ traceDays: 60, dataDays: 0, dataZero: true }, 'it');
    expect(a.textContent).toContain('60 giorni');
    expect(a.textContent).toContain("L'operazione non può essere annullata.");
    expect(a.textContent).not.toContain('Executions.Retention');
  });

  it('every Retention string has an Italian translation and none says variable', () => {
    Object.keys(EN.Executions.Retention).forEach(k => expect(typeof IT.Executions.Retention[k]).toBe('string', k));
    expect(IT.Executions.Retention.ReadOnly)
      .toBe("Solo il proprietario del progetto, o un ruolo autorizzato a leggere l'audit delle esecuzioni, può modificare queste impostazioni.");
    const all = (JSON.stringify(EN.Executions.Retention) + JSON.stringify(IT.Executions.Retention)).toLowerCase();
    expect(all).not.toContain('variab');
  });
});
