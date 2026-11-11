import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ValueCellComponent, VALUE_COLLAPSE_LINES } from './value-cell.component';
import { MaskedValueComponent } from './flow-state-panel.component';
import { VALUE_STATES, VarSide } from '../executions.models';
import * as enJson from '../../../../assets/i18n/en.json';
import * as itJson from '../../../../assets/i18n/it.json';

const EN = (enJson as any).default || enJson;
const IT = (itJson as any).default || itJson;

describe('ValueCellComponent', () => {
  let fixture: ComponentFixture<ValueCellComponent>;

  function render(side: VarSide | null, opts: { reveal?: boolean; lang?: 'en' | 'it' } = {}) {
    TestBed.configureTestingModule({
      declarations: [ValueCellComponent, MaskedValueComponent],
      imports: [TranslateModule.forRoot()],
    });
    const t = TestBed.inject(TranslateService);
    t.setTranslation('en', EN);
    t.setTranslation('it', IT);
    t.use(opts.lang || 'en');
    fixture = TestBed.createComponent(ValueCellComponent);
    fixture.componentInstance.side = side;
    if (opts.reveal !== undefined) fixture.componentInstance.reveal = opts.reveal;
    fixture.componentInstance.ngOnChanges();
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const text = () => el().textContent.trim();
  const base = { type: 'object', size: 40, hash: 'h' };

  afterEach(() => { if (fixture) fixture.destroy(); });

  it('renders the value as JSON', () => {
    render({ ...base, value: { order_id: 'A-1001', n: 2 } });
    const pre = el().querySelector('pre.vc-json');
    expect(pre).toBeTruthy();
    expect(JSON.parse(pre.textContent)).toEqual({ order_id: 'A-1001', n: 2 });
    expect(el().querySelector('.mv-mask')).toBeNull();
  });

  it('renders falsy values (string, 0, false, null) as JSON', () => {
    [['"500"', '500'], ['0', 0], ['false', false], ['null', null], ['""', '']].forEach(([shown, value], i) => {
      if (i) { fixture.destroy(); TestBed.resetTestingModule(); }
      render({ type: 'string', size: 3, hash: 'h', value });
      expect(el().querySelector('pre.vc-json').textContent).toBe(shown as string);
    });
  });

  it('collapses over 10 lines with Show all', () => {
    const value = Array.from({ length: 30 }, (_, i) => i);
    render({ ...base, value });
    const pre = () => el().querySelector('pre.vc-json').textContent;
    expect(pre().split('\n').length).toBe(VALUE_COLLAPSE_LINES);
    const toggle = el().querySelector('.vc-toggle') as HTMLButtonElement;
    expect(toggle.textContent.trim()).toBe('Show all');
    toggle.click();
    fixture.detectChanges();
    expect(pre()).toBe(JSON.stringify(value, null, 2));
    expect((el().querySelector('.vc-toggle') as HTMLElement).textContent.trim()).toBe('Show less');
  });

  it('a value of 10 lines or fewer has no Show all', () => {
    render({ ...base, value: { a: 1 } });
    expect(el().querySelector('.vc-toggle')).toBeNull();
  });

  it('each value_state has its label', () => {
    const en = { secret: '[secret]', too_large: 'too large to store', not_stored: 'not stored', expired: 'no longer kept', unreadable: 'unreadable' };
    const it = { secret: '[secret]', too_large: 'troppo grande per essere memorizzato', not_stored: 'non memorizzato', expired: 'non più conservato', unreadable: 'illeggibile' };
    let first = true;
    (['en', 'it'] as const).forEach(lang => VALUE_STATES.forEach(s => {
      if (!first) { fixture.destroy(); TestBed.resetTestingModule(); }
      first = false;
      render({ ...base, value_state: s }, { lang });
      expect(el().querySelector('.vc-state')).toBeTruthy(lang + ' ' + s);
      expect(text()).toBe((lang === 'en' ? en : it)[s], lang + ' ' + s);
      expect(el().querySelector('.mv-mask')).toBeNull();
    }));
  });

  it('without value fields renders the existing mask', () => {
    render({ type: 'string', size: 412, hash: 'x' });
    expect(el().querySelector('pre.vc-json')).toBeNull();
    expect(el().querySelector('.mv-mask').textContent).toContain('•••');
    fixture.destroy(); TestBed.resetTestingModule();
    render({ type: 'secret', size: null, hash: null });
    expect(text()).toBe('secret');
    fixture.destroy(); TestBed.resetTestingModule();
    render(null);
    expect(text()).toBe('—');
  });

  it('an unknown value_state renders the mask', () => {
    render({ ...base, value_state: 'bogus' as any });
    expect(el().querySelector('.vc-state')).toBeNull();
    expect(el().querySelector('.mv-mask')).toBeTruthy();
  });

  it('reveal false renders the mask even with a value', () => {
    render({ ...base, value: { secret_ish: 'VALUE-1' } }, { reveal: false });
    expect(text()).not.toContain('VALUE-1');
    expect(el().querySelector('.mv-mask')).toBeTruthy();
  });

  it('stays readable under the global pre rules of other pages (line-height 0, box-shadow)', () => {
    const style = document.createElement('style');
    style.textContent = 'pre { line-height: 0; box-shadow: 0 0 0 3px red; border-radius: 6px; counter-reset: line; }';
    document.head.appendChild(style);
    try {
      render({ ...base, value: { order_id: 'A-1001', lines: [1, 2, 3] } });
      const pre = el().querySelector('pre.vc-json') as HTMLElement;
      const cs = getComputedStyle(pre);
      expect(cs.lineHeight).not.toBe('0px');
      expect(pre.offsetHeight).toBeGreaterThan(0);
      expect(cs.boxShadow).toBe('none');
      expect(cs.borderRadius).toBe('0px');
      expect(cs.counterReset).toBe('none');
    } finally {
      style.remove();
    }
  });

  it('a new side with the same value keeps Show all open; another value collapses it', () => {
    const value = Array.from({ length: 30 }, (_, i) => i);
    render({ ...base, value });
    (el().querySelector('.vc-toggle') as HTMLButtonElement).click();
    fixture.detectChanges();
    const c = fixture.componentInstance;
    expect(c.expanded).toBe(true);
    // a poll answers with new objects holding the same value
    c.side = { ...base, value: JSON.parse(JSON.stringify(value)) };
    c.ngOnChanges();
    expect(c.expanded).toBe(true);
    c.side = { ...base, value: [...value, 30] };
    c.ngOnChanges();
    expect(c.expanded).toBe(false);
  });

  it('builds no JSON while masked', () => {
    render({ ...base, value: { order_id: 'A-1001' } }, { reveal: false });
    const c = fixture.componentInstance;
    expect(c.json.text).toBe('');
    expect(JSON.stringify(c.json)).not.toContain('A-1001');
    c.reveal = true;
    c.ngOnChanges();
    expect(c.json.text).toContain('A-1001');
    c.reveal = false;
    c.ngOnChanges();
    expect(JSON.stringify(c.json)).not.toContain('A-1001');
  });

  it('the secret label is [secret] in every language (the marker the API puts in values)', () => {
    expect(EN.Executions.Values.Secret).toBe('[secret]');
    expect(IT.Executions.Values.Secret).toBe('[secret]');
  });

  it('new strings exist in en and it and never say variable', () => {
    const keys = ['Secret', 'TooLarge', 'NotStored', 'Expired', 'Unreadable', 'ShowAll', 'ShowLess', 'ViewValues',
      'TriggerInput', 'TriggerError'];
    keys.forEach(k => {
      expect(typeof EN.Executions.Values[k]).toBe('string', 'en ' + k);
      expect(typeof IT.Executions.Values[k]).toBe('string', 'it ' + k);
    });
    expect(JSON.stringify(EN.Executions.Values)).not.toMatch(/variab/i);
    expect(JSON.stringify(IT.Executions.Values)).not.toMatch(/variab/i);
  });
});
