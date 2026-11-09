import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/** One chip per execution status (spec §11.3). All statuses are defined here so later phases add no new chips. */
@Component({
  selector: 'execution-status-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="chip" [ngClass]="'s-' + status">{{ ('Executions.Status.' + status) | translate }}</span>`,
  styles: [`
    :host {
      --exec-run: #1b6ef3; --exec-run-bg: #e8f0fe;
      --exec-wait: #5d6b82; --exec-wait-bg: #eef1f6;
      --exec-warn: #a15c00; --exec-warn-bg: #fff3e0;
      --exec-bad: #c62f2f; --exec-bad-bg: #fdecec;
      --exec-ok: #1f7a45; --exec-ok-bg: #e6f4ec;
      --exec-dead: #3b4250; --exec-dead-bg: #e3e6eb;
      display: inline-block;
    }
    .chip { display: inline-flex; align-items: center; gap: 6px; border-radius: 20px; padding: 2px 10px 2px 8px; font-size: 12px; font-weight: 500; }
    .chip::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
    .s-running { color: var(--exec-run); background: var(--exec-run-bg); }
    .s-waiting { color: var(--exec-wait); background: var(--exec-wait-bg); }
    .s-stopping, .s-stopped { color: var(--exec-warn); background: var(--exec-warn-bg); }
    .s-failed { color: var(--exec-bad); background: var(--exec-bad-bg); }
    .s-completed { color: var(--exec-ok); background: var(--exec-ok-bg); }
    .s-destroyed { color: var(--exec-dead); background: var(--exec-dead-bg); text-decoration: line-through; }
    @media (prefers-reduced-motion: no-preference) {
      .s-running::before, .s-stopping::before { animation: exec-pulse 1.2s ease-in-out infinite; }
    }
    @keyframes exec-pulse { 50% { opacity: .25; } }
  `]
})
export class ExecutionStatusChipComponent {
  @Input() status: string;
}
