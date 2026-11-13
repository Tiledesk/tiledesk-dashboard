import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ExecutionsStopNoticeComponent } from './executions-stop-notice.component';
import { ExecutionsService } from '../../services/executions.service';
import { LoggerService } from '../../services/logger/logger.service';
import * as enJson from '../../../assets/i18n/en.json';
import * as itJson from '../../../assets/i18n/it.json';

const EN = (enJson as any).default || enJson;
const IT = (itJson as any).default || itJson;
const DEFAULT_TEXT = {
  en: 'The assistant is paused right now. Please write again in a few minutes.',
  it: "L'assistente è momentaneamente in pausa. Riscrivi tra qualche minuto.",
};

function view(over: any = {}): any {
  return { enabled: true, text: null, default_text: DEFAULT_TEXT, can_edit: true, ...over };
}

describe('ExecutionsStopNoticeComponent', () => {
  let fixture: ComponentFixture<ExecutionsStopNoticeComponent>;
  let executions: any;

  function setup(s: any = view(), opts: { configured?: boolean; lang?: string; get?: any } = {}) {
    executions = {
      isConfigured: jasmine.createSpy('isConfigured').and.returnValue(opts.configured !== false),
      getStopNotice: jasmine.createSpy('getStopNotice').and.returnValue(opts.get || of(s)),
      putStopNotice: jasmine.createSpy('putStopNotice').and.callFake((_p: string, b: any) => of({ ...s, ...b })),
    };
    TestBed.configureTestingModule({
      declarations: [ExecutionsStopNoticeComponent],
      imports: [TranslateModule.forRoot(), FormsModule],
      providers: [
        { provide: ExecutionsService, useValue: executions },
        { provide: LoggerService, useValue: { log() {}, debug() {}, warn() {}, error() {} } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    const t = TestBed.inject(TranslateService);
    t.setTranslation('en', EN);
    t.setTranslation('it', IT);
    t.use(opts.lang || 'en');
    fixture = TestBed.createComponent(ExecutionsStopNoticeComponent);
    fixture.componentInstance.projectId = 'p1';
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const toggle = () => el().querySelector('.sn-enabled') as HTMLInputElement;
  const textarea = () => el().querySelector('.sn-textarea') as HTMLTextAreaElement;
  const save = () => el().querySelector('.sn-save') as HTMLButtonElement;
  function settle() {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  }
  function type(v: string) {
    textarea().value = v;
    textarea().dispatchEvent(new Event('input'));
    settle();
  }
  function flip() {
    toggle().click();
    settle();
  }
  function clickSave() {
    save().click();
    settle();
  }

  afterEach(() => { if (fixture) fixture.destroy(); });

  it('shows nothing and does not call the API when executions is not configured', fakeAsync(() => {
    setup(view(), { configured: false });
    expect(el().querySelector('.sn')).toBeNull();
    expect(executions.getStopNotice).not.toHaveBeenCalled();
  }));

  it('shows nothing when the read fails', fakeAsync(() => {
    setup(view(), { get: throwError(new HttpErrorResponse({ status: 403 })) });
    expect(el().querySelector('.sn')).toBeNull();
  }));

  it('shows the toggle, the textarea with the English default as placeholder, the hint and max 500', fakeAsync(() => {
    setup();
    expect(executions.getStopNotice).toHaveBeenCalledWith('p1');
    expect(toggle().checked).toBe(true);
    expect(textarea().value).toBe('');
    expect(textarea().placeholder).toBe(DEFAULT_TEXT.en);
    expect(textarea().getAttribute('maxlength')).toBe('500');
    expect(el().querySelector('.sn-intro').textContent).toContain(
      "Sent in the conversation each time a user writes while the agent's execution is stopped. Empty uses the default text.");
    expect(el().textContent).toContain('Stop notice');
    expect(save().disabled).toBe(true);
  }));

  it('uses the Italian default as placeholder when the UI is in Italian', fakeAsync(() => {
    setup(view(), { lang: 'it' });
    expect(textarea().placeholder).toBe(DEFAULT_TEXT.it);
    expect(el().textContent).toContain('Avviso di stop');
  }));

  it('shows the stored values', fakeAsync(() => {
    setup(view({ enabled: false, text: 'Torniamo subito.' }));
    expect(toggle().checked).toBe(false);
    expect(textarea().value).toBe('Torniamo subito.');
  }));

  it('saves the toggle and the trimmed text; an empty text is sent as null', fakeAsync(() => {
    setup();
    flip();
    expect(save().disabled).toBe(false);
    clickSave();
    expect(executions.putStopNotice).toHaveBeenCalledWith('p1', { enabled: false, text: null });
    expect(el().querySelector('.sn-saved')).not.toBeNull();
    expect(save().disabled).toBe(true);

    type('  Back in a minute.  ');
    clickSave();
    expect(executions.putStopNotice).toHaveBeenCalledWith('p1', { enabled: false, text: 'Back in a minute.' });
  }));

  it('whitespace only is not a change', fakeAsync(() => {
    setup();
    type('   ');
    expect(save().disabled).toBe(true);
  }));

  it('read-only without can_edit: no Save, inputs disabled', fakeAsync(() => {
    setup(view({ can_edit: false }));
    expect(save()).toBeNull();
    expect(toggle().disabled).toBe(true);
    expect(textarea().disabled).toBe(true);
    expect(el().querySelector('.sn-readonly')).not.toBeNull();
  }));

  it('blocks a text over 500 characters', fakeAsync(() => {
    setup();
    fixture.componentInstance.text = 'x'.repeat(501);
    fixture.componentInstance.edited();
    settle();
    expect(save().disabled).toBe(true);
    expect(el().querySelector('.sn-too-long')).not.toBeNull();
  }));

  it('shows the field error on 400 out_of_range text, the generic error otherwise', fakeAsync(() => {
    setup();
    executions.putStopNotice.and.returnValue(throwError(new HttpErrorResponse({ status: 400, error: { error: 'out_of_range', field: 'text' } })));
    type('Hi');
    clickSave();
    expect(el().querySelector('.sn-too-long')).not.toBeNull();
    expect(el().querySelector('.sn-failed')).toBeNull();

    executions.putStopNotice.and.returnValue(throwError(new HttpErrorResponse({ status: 503 })));
    type('Hello');
    clickSave();
    expect(el().querySelector('.sn-failed')).not.toBeNull();
  }));
});
