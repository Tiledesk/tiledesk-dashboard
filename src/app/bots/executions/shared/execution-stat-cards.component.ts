import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { StatusCounts } from '../executions.models';
import { EXEC_GRAPH_COLORS as C } from '../graph/execution-graph.colors';

export type StatCard = 'running' | 'waiting' | 'stopped' | 'failed' | 'with_errors' | 'completed' | 'destroyed';
/**
 * One card per status; Stopped sums stopped and stopping (the list's stopped filter is stopped,stopping).
 * With errors is not a status: the runs (of any status) that took a failure condition. With Failed it
 * explains every red agent of the graph.
 */
export const STAT_CARDS: StatCard[] = ['running', 'waiting', 'stopped', 'failed', 'with_errors', 'completed', 'destroyed'];

/** Each card's accent: the colour of its execution chip in the graph. */
const ACCENT: { [S in StatCard]: string } = {
  running: C.run, waiting: C.waitIcon, stopped: C.stopIcon, failed: C.bad, with_errors: C.bad, completed: C.ok, destroyed: C.dead,
};

/**
 * The big numbers of the executions (Monitor › Graph and Monitor › Executions). Read-only by default;
 * `selectable` makes each card a toggle button that emits its status.
 */
@Component({
  selector: 'execution-stat-cards',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="exec-stat-cards" role="group">
      <ng-container *ngFor="let s of cards">
        <button *ngIf="selectable; else plain" type="button" class="exec-stat-card selectable" [attr.data-status]="s"
          [class.active]="active === s" [attr.aria-pressed]="active === s" [style.--accent]="accent[s]" (click)="pick.emit(s)">
          <ng-container *ngTemplateOutlet="body; context: { $implicit: s }"></ng-container>
        </button>
        <ng-template #plain>
          <div class="exec-stat-card" [attr.data-status]="s" [style.--accent]="accent[s]">
            <ng-container *ngTemplateOutlet="body; context: { $implicit: s }"></ng-container>
          </div>
        </ng-template>
      </ng-container>
    </div>
    <ng-template #body let-s>
      <span class="exec-stat-value">{{ value(s) }}</span>
      <span class="exec-stat-label">{{ 'Executions.Cards.' + s | translate }}</span>
    </ng-template>
  `,
  styles: [`
    :host { display: block; }
    .exec-stat-cards { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 12px; }
    @media (max-width: 1199px) { .exec-stat-cards { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
    @media (max-width: 767px) { .exec-stat-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    .exec-stat-card {
      display: flex; flex-direction: column; align-items: flex-start; gap: 2px; min-width: 0;
      padding: 12px 16px 10px; border-radius: 12px; background: #fff; text-align: left; font: inherit; color: #1f2a3d;
      border: 1px solid #e3e6eb; border-top: 3px solid var(--accent); box-shadow: 0 1px 4px rgba(0, 0, 0, .06);
    }
    .exec-stat-card.selectable { cursor: pointer; }
    .exec-stat-card.selectable:hover { box-shadow: 0 2px 8px rgba(0, 0, 0, .1); }
    .exec-stat-card.selectable:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
    .exec-stat-card.active { background: #f4f7fd; border-color: var(--accent); }
    .exec-stat-card[data-status="with_errors"] { border-top-style: dashed; }
    .exec-stat-value { font-size: 28px; line-height: 1.15; font-weight: 500; color: var(--accent); font-variant-numeric: tabular-nums; }
    .exec-stat-label { font-size: 13px; color: #5d6b82; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
  `]
})
export class ExecutionStatCardsComponent {
  /** null: not known yet (a dash, not zero). */
  @Input() counts: StatusCounts | null = null;
  /** The with_errors of the stats (runs that took a failure condition); null: not known yet. */
  @Input() withErrors: number | null = null;
  @Input() selectable = false;
  /** The status filter in use (selectable cards only). */
  @Input() active: string | null = null;
  @Output() pick = new EventEmitter<StatCard>();

  readonly cards = STAT_CARDS;
  readonly accent = ACCENT;

  value(s: StatCard): string {
    if (s === 'with_errors') return this.withErrors === null || this.withErrors === undefined ? '–' : String(this.withErrors);
    const c = this.counts;
    if (!c) return '–';
    const n = s === 'stopped' ? (c.stopped || 0) + (c.stopping || 0) : (c[s as keyof StatusCounts] || 0);
    return String(n);
  }
}
