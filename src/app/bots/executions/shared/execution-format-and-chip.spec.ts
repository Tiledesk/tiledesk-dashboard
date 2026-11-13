import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { formatDuration } from './execution-format';
import { ExecutionStatusChipComponent } from './execution-status-chip.component';

describe('formatDuration', () => {
  it('humanizes', () => {
    expect(formatDuration(400)).toBe('400 ms');
    expect(formatDuration(2100)).toBe('2.1 s');
    expect(formatDuration(720000)).toBe('12 min');
    expect(formatDuration(5400000)).toBe('1.5 h');
    expect(formatDuration(null)).toBe('—');
  });
});

describe('ExecutionStatusChipComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    declarations: [ExecutionStatusChipComponent], imports: [TranslateModule.forRoot()]
  }));

  ['running', 'waiting', 'stopping', 'stopped', 'failed', 'completed', 'destroyed'].forEach(status => {
    it('renders ' + status, () => {
      const f = TestBed.createComponent(ExecutionStatusChipComponent);
      f.componentInstance.status = status;
      f.detectChanges();
      const el: HTMLElement = f.nativeElement.querySelector('.chip');
      expect(el.classList).toContain('s-' + status);
      expect(el.textContent).toContain(status);
    });
  });

  it('destroyed is struck through, running is not', () => {
    const style = (status: string) => {
      const f = TestBed.createComponent(ExecutionStatusChipComponent);
      f.componentInstance.status = status;
      f.detectChanges();
      document.body.appendChild(f.nativeElement);
      const s = getComputedStyle(f.nativeElement.querySelector('.chip')).textDecorationLine;
      f.nativeElement.remove();
      return s;
    };
    expect(style('destroyed')).toContain('line-through');
    expect(style('running')).not.toContain('line-through');
  });
});
