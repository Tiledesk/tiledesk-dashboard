import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  isFilled, missingMasked, parseMaskedPath, StartNewDialogComponent, StartNewDialogData, valueAtPath
} from './start-new-dialog.component';
import * as enJson from '../../../../assets/i18n/en.json';

const EN = (enJson as any).default || enJson;

describe('start new masked paths', () => {
  it('parses keys, array indexes and JSON-string keys', () => {
    expect(parseMaskedPath('customer.api_key')).toEqual(['customer', 'api_key']);
    expect(parseMaskedPath('items[0].token')).toEqual(['items', 0, 'token']);
    expect(parseMaskedPath('headers["a.b"]')).toEqual(['headers', 'a.b']);
    expect(parseMaskedPath('["x\\"y]"].z')).toEqual(['x"y]', 'z']);
    expect(parseMaskedPath('[""]')).toEqual(['']);
    expect(parseMaskedPath('a[1][2]')).toEqual(['a', 1, 2]);
    expect(parseMaskedPath('token')).toEqual(['token']);
  });

  it('rejects malformed paths', () => {
    expect(parseMaskedPath('')).toBeNull();
    expect(parseMaskedPath('a..b')).toBeNull();
    expect(parseMaskedPath('a[x]')).toBeNull();
    expect(parseMaskedPath('a["b"')).toBeNull();
    expect(parseMaskedPath('a.')).toBeNull();
    expect(parseMaskedPath(null)).toBeNull();
  });

  it('reads values by path; arrays only by index, objects only by own key', () => {
    const o = { customer: { api_key: 'k' }, items: [{ token: 't' }], headers: { 'a.b': 'h' } };
    expect(valueAtPath(o, ['customer', 'api_key'])).toBe('k');
    expect(valueAtPath(o, ['items', 0, 'token'])).toBe('t');
    expect(valueAtPath(o, ['headers', 'a.b'])).toBe('h');
    expect(valueAtPath(o, ['items', '0', 'token'])).toBeUndefined();
    expect(valueAtPath(o, ['customer', 'toString'])).toBeUndefined();
    expect(valueAtPath(o, ['missing', 'x'])).toBeUndefined();
  });

  it('filled means not null, not blank and not the [secret] marker', () => {
    [null, undefined, '', '   ', '[secret]'].forEach(v => expect(isFilled(v)).toBe(false));
    ['x', 0, false, {}, []].forEach(v => expect(isFilled(v)).toBe(true));
  });

  it('lists the masked paths not filled in', () => {
    const masked = ['customer.api_key', 'items[0].token', 'headers["a.b"]'];
    expect(missingMasked({ customer: { api_key: null }, items: [{ token: null }], headers: { 'a.b': null } }, masked)).toEqual(masked);
    expect(missingMasked({ customer: { api_key: 'k' }, items: [{ token: ' ' }], headers: { 'a.b': 'v' } }, masked)).toEqual(['items[0].token']);
    expect(missingMasked({}, ['bad..path'])).toEqual(['bad..path']);
  });
});

describe('StartNewDialogComponent', () => {
  let fixture: ComponentFixture<StartNewDialogComponent>;
  let ref: { close: jasmine.Spy };

  const INPUT = { customer: { name: 'ACME', api_key: null }, items: [{ sku: 'a1', token: null }] };
  const MASKED = ['customer.api_key', 'items[0].token'];

  function setup(data: StartNewDialogData) {
    ref = { close: jasmine.createSpy('close') };
    TestBed.configureTestingModule({
      declarations: [StartNewDialogComponent],
      imports: [TranslateModule.forRoot(), FormsModule, MatDialogModule],
      providers: [
        { provide: MatDialogRef, useValue: ref },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    });
    const t = TestBed.inject(TranslateService);
    t.setTranslation('en', EN);
    t.use('en');
    fixture = TestBed.createComponent(StartNewDialogComponent);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const text = () => el().textContent.replace(/\s+/g, ' ');
  const area = () => el().querySelector('.sn-input') as HTMLTextAreaElement;
  const startBtn = () => el().querySelector('.sn-confirm') as HTMLButtonElement;
  function type(value: string) {
    area().value = value;
    area().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  }

  afterEach(() => { if (fixture) fixture.destroy(); });

  it('start new prefilled, disabled until masked fields are filled', fakeAsync(() => {
    setup({ agentName: 'Nightly checks', input: INPUT, masked: MASKED });
    expect(text()).toContain('Start new execution');
    expect(text()).toContain('Nightly checks');
    expect(text()).toContain('current published version');
    expect(JSON.parse(area().value)).toEqual(INPUT);
    const fields = Array.from(el().querySelectorAll('.sn-field')).map(f => f.querySelector('.sn-path').textContent.trim());
    expect(fields).toEqual(MASKED);
    expect(el().querySelectorAll('.sn-field.sn-missing').length).toBe(2);
    expect(startBtn().disabled).toBe(true);

    const edited = { customer: { name: 'ACME 2', api_key: 'k-1' }, items: [{ sku: 'a1', token: '   ' }], extra: true };
    type(JSON.stringify(edited));
    expect(el().querySelectorAll('.sn-field.sn-missing').length).toBe(1);
    expect(el().querySelector('.sn-field.sn-missing .sn-path').textContent.trim()).toBe('items[0].token');
    expect(startBtn().disabled).toBe(true);

    edited.items[0].token = 't-1';
    type(JSON.stringify(edited));
    expect(el().querySelectorAll('.sn-field.sn-missing').length).toBe(0);
    expect(startBtn().disabled).toBe(false);
    startBtn().click();
    // exactly what the user confirmed, the extra key and the renamed customer included
    expect(ref.close).toHaveBeenCalledWith(edited);
  }));

  it('invalid JSON keeps start disabled', fakeAsync(() => {
    setup({ agentName: 'Nightly checks', input: { a: 1 }, masked: [] });
    expect(startBtn().disabled).toBe(false);
    type('{"a": 1,');
    expect(startBtn().disabled).toBe(true);
    expect(el().querySelector('.sn-error').textContent).toContain('not valid JSON');
    expect(area().getAttribute('aria-invalid')).toBe('true');
    startBtn().click();
    expect(ref.close).not.toHaveBeenCalled();

    type('[1, 2]');
    expect(startBtn().disabled).toBe(true);
    expect(el().querySelector('.sn-error').textContent).toContain('must be a JSON object');

    type('{"a": 2}');
    expect(el().querySelector('.sn-error')).toBeNull();
    expect(startBtn().disabled).toBe(false);
    el().querySelector<HTMLElement>('.sn-cancel').click();
    expect(ref.close).toHaveBeenCalledWith(null);
  }));

  it('fields the server reported missing are highlighted; a reopened dialog keeps the edited text', fakeAsync(() => {
    setup({ agentName: 'A', input: { token: 'x' }, masked: ['token'], missing: ['token'], text: '{"token": "x"}' });
    expect(area().value).toBe('{"token": "x"}');
    const f = el().querySelector('.sn-field');
    expect(f.classList.contains('sn-server-missing')).toBe(true);
    expect(text()).toContain('Fill in the highlighted fields');
  }));

  it('renders agent name and paths as text, never as HTML', fakeAsync(() => {
    setup({ agentName: '<b id="x">A</b>', input: { '<i>': null }, masked: ['["<i>"]'] });
    expect(el().querySelector('#x')).toBeNull();
    expect(el().querySelector('.sn-path i')).toBeNull();
    expect(text()).toContain('<b id="x">A</b>');
  }));
});
