import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { FlowStatePanelComponent, MaskedValueComponent, byLabel } from './flow-state-panel.component';
import { VarHistoryDrawerComponent } from './var-history-drawer.component';
import { formatSize } from './execution-format';
import { VarView } from '../executions.models';
import * as enJson from '../../../../assets/i18n/en.json';

const EN = (enJson as any).default || enJson;

function v(key: string, extra: Partial<VarView> = {}): VarView {
  return {
    key, reserved: false,
    before: { type: 'string', size: 3, hash: 'h1' },
    after: { type: 'string', size: 3, hash: 'h1' },
    changed: false, by: null, ...extra,
  };
}

function useEnglish() {
  const t = TestBed.inject(TranslateService);
  t.setTranslation('en', EN);
  t.use('en');
}

describe('FlowStatePanelComponent', () => {
  let fixture: ComponentFixture<FlowStatePanelComponent>;
  let component: FlowStatePanelComponent;

  function render(vars: VarView[], opts: { titles?: any; partial?: boolean } = {}) {
    TestBed.configureTestingModule({
      declarations: [FlowStatePanelComponent, MaskedValueComponent],
      imports: [TranslateModule.forRoot()],
    });
    useEnglish();
    fixture = TestBed.createComponent(FlowStatePanelComponent);
    component = fixture.componentInstance;
    component.vars = vars;
    component.actionTitles = opts.titles || {};
    component.partial = !!opts.partial;
    component.ngOnChanges();
    fixture.detectChanges();
  }

  const rows = () => Array.from(fixture.nativeElement.querySelectorAll('tr.fs-row')) as HTMLElement[];
  const keys = () => rows().map(r => r.querySelector('.fs-key-name').textContent.trim());
  const text = () => fixture.nativeElement.textContent as string;

  it('panel sorts changed first and masks values', () => {
    render([
      v('alpha'),
      v('status_body', { changed: true, by: 'act1', before: null, after: { type: 'string', size: 412, hash: 'x' } }),
      v('last_status', { changed: true, by: 'act1', after: { type: 'number', size: 3, hash: 'y' } }),
    ], { titles: { act1: 'GET status' } });
    // unchanged rows are collapsed behind "show unchanged (n)"
    expect(keys()).toEqual(['last_status', 'status_body']);
    expect(rows().every(r => r.classList.contains('fs-changed'))).toBe(true);
    const body = rows()[1];
    expect(body.querySelector('.fs-before').textContent).toContain('—');
    expect(body.querySelector('.fs-after').textContent).toContain('••• (412 B)');
    expect(body.querySelector('.fs-after').textContent).toContain('string');
    expect(text()).not.toContain('h1');

    const more = fixture.nativeElement.querySelector('.fs-show-unchanged') as HTMLButtonElement;
    expect(more.textContent).toContain('Show unchanged (1)');
    more.click();
    fixture.detectChanges();
    expect(keys()).toEqual(['last_status', 'status_body', 'alpha']);
    const alpha = rows()[2];
    expect(alpha.classList.contains('fs-changed')).toBe(false);
    expect(alpha.querySelector('.fs-before').textContent).toContain('••• (3 B)');
    expect(alpha.querySelector('.fs-after').textContent).toContain('= unchanged');
  });

  it('changed comes from changed, not by', () => {
    // a key set back to its original value: by is set, changed is false
    render([v('reset_me', { changed: false, by: 'act1' }), v('real', { changed: true, by: 'act1' })], { titles: { act1: 'Set' } });
    expect(keys()).toEqual(['real']);
    component.showUnchanged = true;
    fixture.detectChanges();
    const reset = rows()[1];
    expect(reset.querySelector('.fs-key').textContent).toContain('reset_me');
    expect(reset.classList.contains('fs-changed')).toBe(false);
    expect(reset.querySelector('.fs-after').textContent).toContain('= unchanged');
    expect(reset.querySelector('.fs-by').textContent.trim()).toBe('');
  });

  it('system variables hidden until toggled', () => {
    render([v('user_var', { changed: true, by: 'act1' }), v('lastUserText', { reserved: true, changed: true, by: 'message_in' })]);
    expect(keys()).toEqual(['user_var']);
    const toggle = fixture.nativeElement.querySelector('.fs-system-toggle') as HTMLInputElement;
    expect(toggle.checked).toBe(false);
    toggle.click();
    fixture.detectChanges();
    expect(keys()).toEqual(['lastUserText', 'user_var']);
    expect(rows()[0].querySelector('.fs-tag').textContent).toContain('system');
  });

  it('by labels map action ids to titles', () => {
    render([
      v('a', { changed: true, by: 'act1' }),
      v('b', { changed: true, by: 'message_in' }),
      v('c', { changed: true, by: 'jump_params' }),
      v('d', { changed: true, by: 'external' }),
      v('e', { changed: true, by: 'act_unknown' }),
    ], { titles: { act1: 'Web request "GET status"' } });
    const by = rows().map(r => r.querySelector('.fs-by').textContent.trim());
    expect(by).toEqual(['Web request "GET status"', 'incoming message', 'block parameters', 'outside the flow', 'act_unknown']);
  });

  it('shows secret variables as "secret", never a size', () => {
    render([v('api_key', { changed: true, by: 'act1', before: { type: 'secret', size: 40, hash: null }, after: { type: 'secret', size: 41, hash: null } })]);
    const row = rows()[0];
    expect(row.querySelector('.fs-before').textContent).toContain('secret');
    expect(row.textContent).not.toContain('40');
    expect(row.textContent).not.toContain('41');
    expect(row.textContent).not.toContain('•••');
  });

  it('partial state shows a note', () => {
    render([v('a', { changed: true })], { partial: true });
    expect(text()).toContain('State before this block may be incomplete');
    TestBed.resetTestingModule();
    render([v('a', { changed: true })], { partial: false });
    expect(text()).not.toContain('State before this block may be incomplete');
  });
});

describe('byLabel', () => {
  it('maps the special origins to translation keys and action ids to titles', () => {
    expect(byLabel('message_in', {})).toEqual({ key: 'Executions.FlowState.By.message_in' });
    expect(byLabel('jump_params', {})).toEqual({ key: 'Executions.FlowState.By.jump_params' });
    expect(byLabel('external', {})).toEqual({ key: 'Executions.FlowState.By.external' });
    expect(byLabel('act1', { act1: 'Reply' })).toEqual({ text: 'Reply' });
    expect(byLabel('act9', { act1: 'Reply' })).toEqual({ text: 'act9' });
    expect(byLabel(null, {})).toBeNull();
  });
});

describe('formatSize', () => {
  it('humanizes bytes', () => {
    expect(formatSize(3)).toBe('3 B');
    expect(formatSize(2048)).toBe('2.0 KB');
    expect(formatSize(3 * 1024 * 1024)).toBe('3.0 MB');
    expect(formatSize(null)).toBe('');
  });
});

describe('VarHistoryDrawerComponent', () => {
  let fixture: ComponentFixture<VarHistoryDrawerComponent>;
  let component: VarHistoryDrawerComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VarHistoryDrawerComponent, MaskedValueComponent],
      imports: [TranslateModule.forRoot(), MatIconModule],
    });
    useEnglish();
    fixture = TestBed.createComponent(VarHistoryDrawerComponent);
    component = fixture.componentInstance;
    component.varKey = 'last_status';
    component.actionTitles = { act1: 'GET status' };
  });

  const entry = (seq: number, step: number, block: string, by: string, size: number) => ({
    seq, step_seq: step, block_name: block, action_id: by.startsWith('act') ? by : null, by, op: 'set',
    type: 'string', size, hash_before: 'hb', hash_after: 'ha',
  });

  it('history drawer lists changes in order', () => {
    component.entries = [entry(9, 3, 'Call status API', 'act1', 3), entry(2, 1, 'start', 'message_in', 5)];
    fixture.detectChanges();
    const items = Array.from(fixture.nativeElement.querySelectorAll('.vh-entry')) as HTMLElement[];
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('start');
    expect(items[0].textContent).toContain('incoming message');
    expect(items[0].textContent).toContain('••• (5 B)');
    expect(items[1].textContent).toContain('Call status API');
    expect(items[1].textContent).toContain('GET status');
    expect(fixture.nativeElement.textContent).not.toContain('hb');
  });

  it('shows the empty text, and closes with Esc and the close button', () => {
    component.entries = [];
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Not changed in this execution.');
    let closed = 0;
    component.closed.subscribe(() => closed++);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    const close = fixture.nativeElement.querySelector('.vh-close') as HTMLButtonElement;
    expect(close.getAttribute('aria-label')).toBe('Close');
    close.click();
    expect(closed).toBe(2);
  });
});
