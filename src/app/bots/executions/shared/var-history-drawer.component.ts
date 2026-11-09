import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { VarHistoryEntry } from '../executions.models';
import { byLabel, ByLabel } from './flow-state-panel.component';

/** Every change of one variable in this execution, in order, with who changed it and at which block. */
@Component({
  selector: 'var-history-drawer',
  template: `
    <aside class="vh" role="dialog" aria-modal="false" aria-labelledby="vh-title">
      <div class="vh-head">
        <h2 id="vh-title" class="vh-title">{{ "Executions.History.Title" | translate }} <span class="vh-key">{{ varKey }}</span></h2>
        <button type="button" class="vh-close" [attr.aria-label]="'Executions.History.Close' | translate" (click)="closed.emit()">
          <mat-icon aria-hidden="true">close</mat-icon>
        </button>
      </div>
      <div *ngIf="loading" class="vh-note">{{ "Executions.Loading" | translate }}</div>
      <div *ngIf="error" class="vh-note">
        {{ "Executions.History.LoadError" | translate }}
        <button type="button" class="vh-link" (click)="retry.emit()">{{ "Executions.Retry" | translate }}</button>
      </div>
      <div *ngIf="entries && !entries.length && !loading && !error" class="vh-note">{{ "Executions.History.Empty" | translate }}</div>
      <ol *ngIf="entries?.length" class="vh-list">
        <li *ngFor="let e of ordered" class="vh-entry">
          <span class="vh-block">{{ e.block_name || ("Executions.History.Step" | translate: { n: e.step_seq }) }}</span>
          <span class="vh-by"><ng-container *ngIf="label(e.by) as l">{{ $any(l).key ? ($any(l).key | translate) : $any(l).text }}</ng-container></span>
          <span class="vh-op">{{ opKey(e.op) ? (opKey(e.op) | translate) : e.op }}</span>
          <exec-masked-value *ngIf="e.op !== 'del'" [side]="{ type: e.type, size: e.size, hash: null }"></exec-masked-value>
          <span *ngIf="e.op === 'del'" class="vh-none" aria-hidden="true">—</span>
        </li>
      </ol>
    </aside>`,
  styles: [`
    .vh { position: fixed; top: 0; right: 0; bottom: 0; width: min(420px, 100vw); background: #fff; z-index: 1050;
      border-left: 1px solid #dfe3ed; box-shadow: -8px 0 24px rgba(31,42,61,.12); padding: 16px; overflow-y: auto; font-size: 12.5px; }
    .vh-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 12px; }
    .vh-title { font-size: 15px; font-weight: 500; margin: 0; }
    .vh-key { font-family: ui-monospace, Menlo, monospace; }
    .vh-close { border: 0; background: none; cursor: pointer; color: #5d6b82; border-radius: 50%; width: 32px; height: 32px; display: grid; place-items: center; }
    .vh-close:focus-visible { outline: 2px solid #1b6ef3; }
    .vh-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
    .vh-entry { display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 2px 10px; padding: 8px 10px; border: 1px solid #dfe3ed; border-radius: 8px; }
    .vh-block { font-weight: 500; }
    .vh-by, .vh-op, .vh-note { color: #5d6b82; }
    .vh-none { color: #8a94a8; }
    .vh-link { border: 0; background: none; color: #1b6ef3; cursor: pointer; }
  `]
})
export class VarHistoryDrawerComponent {
  @Input() varKey: string;
  @Input() entries: VarHistoryEntry[] | null = null;
  @Input() loading = false;
  @Input() error = false;
  @Input() actionTitles: { [actionId: string]: string } = {};
  @Output() closed = new EventEmitter<void>();
  @Output() retry = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closed.emit();
  }

  get ordered(): VarHistoryEntry[] {
    return (this.entries || []).slice().sort((a, b) => a.seq - b.seq);
  }

  /** Translation key of a change op (add | set | del, as the API sends them); null for anything else. */
  opKey(op: string | null): string | null {
    return op === 'add' || op === 'set' || op === 'del' ? 'Executions.Ops.' + op : null;
  }

  label(by: string | null): ByLabel {
    return byLabel(by, this.actionTitles);
  }
}
