import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ExecutionStatCardsComponent, STAT_CARDS } from './execution-stat-cards.component';
import { ExecutionStatCardsModule } from './execution-stat-cards.module';

const COUNTS = { running: 3, waiting: 2, stopping: 1, stopped: 4, failed: 5, completed: 6, destroyed: 7 };

describe('ExecutionStatCardsComponent', () => {
  let fixture: ComponentFixture<ExecutionStatCardsComponent>;
  let component: ExecutionStatCardsComponent;

  function setup(inputs: Partial<ExecutionStatCardsComponent> = {}) {
    TestBed.configureTestingModule({ imports: [ExecutionStatCardsModule, TranslateModule.forRoot()] });
    fixture = TestBed.createComponent(ExecutionStatCardsComponent);
    component = fixture.componentInstance;
    Object.assign(component, inputs);
    fixture.detectChanges();
  }
  const cards = () => Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.exec-stat-card')) as HTMLElement[];
  const value = (el: HTMLElement) => el.querySelector('.exec-stat-value').textContent.trim();
  const label = (el: HTMLElement) => el.querySelector('.exec-stat-label').textContent.trim();

  it('one card per status, in order; Stopped counts stopped + stopping', () => {
    setup({ counts: COUNTS });
    expect(STAT_CARDS).toEqual(['running', 'waiting', 'stopped', 'failed', 'completed', 'destroyed']);
    expect(cards().map(label)).toEqual(STAT_CARDS.map(s => 'Executions.Cards.' + s));
    expect(cards().map(value)).toEqual(['3', '2', '5', '5', '6', '7']);
    expect(cards().map(c => c.getAttribute('data-status'))).toEqual(STAT_CARDS);
  });

  it('unknown counts show a dash, not zero', () => {
    setup({ counts: null });
    expect(cards().map(value)).toEqual(['–', '–', '–', '–', '–', '–']);
  });

  it('read-only by default: plain cards, nothing emitted on click', () => {
    setup({ counts: COUNTS });
    const picked = jasmine.createSpy('pick');
    component.pick.subscribe(picked);
    expect(cards().every(c => c.tagName === 'DIV')).toBe(true);
    cards()[0].click();
    expect(picked).not.toHaveBeenCalled();
  });

  it('selectable: buttons, a click emits the status, the active one is pressed', () => {
    setup({ counts: COUNTS, selectable: true, active: 'failed' });
    const picked = jasmine.createSpy('pick');
    component.pick.subscribe(picked);
    expect(cards().every(c => c.tagName === 'BUTTON')).toBe(true);
    expect(cards().map(c => c.getAttribute('aria-pressed'))).toEqual(['false', 'false', 'false', 'true', 'false', 'false']);
    expect(cards()[3].classList).toContain('active');
    cards()[2].click();
    expect(picked).toHaveBeenCalledWith('stopped');
  });
});
