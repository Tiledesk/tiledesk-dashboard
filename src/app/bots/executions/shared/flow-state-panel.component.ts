import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { VarSide, VarView } from '../executions.models';
import { formatSize } from './execution-format';

/** Who changed a variable, besides an action id. */
const BY_KEYS: { [by: string]: string } = {
  message_in: 'Executions.FlowState.By.message_in',
  jump_params: 'Executions.FlowState.By.jump_params',
  external: 'Executions.FlowState.By.external',
};

export type ByLabel = { key: string } | { text: string } | null;

/** "Changed by" label: a translation key for the special origins, else the action title (fallback: the id). */
export function byLabel(by: string | null, actionTitles: { [actionId: string]: string }): ByLabel {
  if (!by) return null;
  if (BY_KEYS[by]) return { key: BY_KEYS[by] };
  return { text: (actionTitles && actionTitles[by]) || by };
}

/** Values are never shown in Phase 1: "••• (size)" with the type, "secret" for secrets, "—" when absent. */
@Component({
  selector: 'exec-masked-value',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span *ngIf="!side" class="mv-none">—</span>
    <span *ngIf="side && side.type === 'secret'" class="mv-secret">{{ "Executions.FlowState.Secret" | translate }}</span>
    <ng-container *ngIf="side && side.type !== 'secret'">
      <span class="mv-mask">{{ masked }}</span>
      <span *ngIf="showType && side.type" class="mv-type">{{ side.type }}</span>
    </ng-container>`,
  styles: [`
    .mv-mask { color: #8a94a8; font-family: ui-monospace, Menlo, monospace; font-size: 12px; }
    .mv-type { color: #5d6b82; font-size: 11px; margin-left: 6px; }
    .mv-secret { color: #a15c00; font-size: 12px; }
    .mv-none { color: #8a94a8; }
  `]
})
export class MaskedValueComponent {
  @Input() side: VarSide | null;
  @Input() showType = true;

  get masked(): string {
    const size = formatSize(this.side && this.side.size);
    return size ? '••• (' + size + ')' : '•••';
  }
}

/** The Flow state of one block: before → after, changed first, the rest behind "show unchanged (n)". */
@Component({
  selector: 'flow-state-panel',
  templateUrl: './flow-state-panel.component.html',
  styleUrls: ['./flow-state-panel.component.scss']
})
export class FlowStatePanelComponent implements OnChanges {
  @Input() vars: VarView[] = [];
  @Input() actionTitles: { [actionId: string]: string } = {};
  @Input() showSystem = false;
  /** the state before this block was rebuilt without a keyframe */
  @Input() partial = false;

  showUnchanged = false;
  changed: VarView[] = [];
  unchanged: VarView[] = [];

  ngOnChanges() {
    this.split();
  }

  toggleSystem() {
    this.showSystem = !this.showSystem;
    this.split();
  }

  label(by: string | null): ByLabel {
    return byLabel(by, this.actionTitles);
  }

  private split() {
    const visible = (this.vars || [])
      .filter(v => this.showSystem || !v.reserved)
      .sort((a, b) => a.key.localeCompare(b.key));
    // "changed" comes only from the hashes (changed), never from by: a key set back to its value has a by but is unchanged
    this.changed = visible.filter(v => v.changed);
    this.unchanged = visible.filter(v => !v.changed);
  }

  trackByKey(_: number, v: VarView) {
    return v.key;
  }
}
