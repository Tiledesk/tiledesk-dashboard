import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { VALUE_STATES, ValueState, VarSide } from '../executions.models';

/** A value longer than this many lines (as indented JSON) is collapsed behind "Show all". */
export const VALUE_COLLAPSE_LINES = 10;

/** Label of a value that has no value to show (spec §5). */
const STATE_KEYS: { [s in ValueState]: string } = {
  secret: 'Executions.Values.Secret',
  too_large: 'Executions.Values.TooLarge',
  not_stored: 'Executions.Values.NotStored',
  expired: 'Executions.Values.Expired',
  unreadable: 'Executions.Values.Unreadable',
};

/**
 * One attribute side read under a grant (Phase 4 spec §5): the value as JSON (collapsed over 10 lines), or the label
 * of its value_state. Without value fields, or with `reveal` false (outside the grant's scope), the Phase 1 mask.
 * The value lives only in the inputs and in this component's memory: nothing is stored or logged.
 */
@Component({
  selector: 'exec-value-cell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container [ngSwitch]="mode">
      <span *ngSwitchCase="'value'" class="vc-value">
        <pre class="vc-json">{{ expanded ? json.text : json.head }}</pre>
        <button *ngIf="json.collapsible" type="button" class="vc-toggle" [attr.aria-expanded]="expanded"
          (click)="expanded = !expanded">{{ (expanded ? "Executions.Values.ShowLess" : "Executions.Values.ShowAll") | translate }}</button>
      </span>
      <span *ngSwitchCase="'state'" class="vc-state" [ngClass]="'vc-' + side.value_state">{{ stateKey | translate }}</span>
      <exec-masked-value *ngSwitchDefault [side]="side" [showType]="showType"></exec-masked-value>
    </ng-container>`,
  styles: [`
    .vc-value { display: inline-block; max-width: 100%; }
    .vc-json { margin: 0; padding: 0; background: none; border: 0; font-family: ui-monospace, Menlo, monospace; font-size: 12px;
      white-space: pre-wrap; word-break: break-word; color: #1f2a3d; }
    .vc-toggle { border: 0; background: none; padding: 0; color: #1b6ef3; cursor: pointer; font-size: 12px; }
    .vc-toggle:focus-visible { outline: 2px solid #1b6ef3; }
    .vc-state { color: #5d6b82; font-size: 12px; font-style: italic; }
    .vc-secret { color: #a15c00; font-style: normal; }
  `]
})
export class ValueCellComponent implements OnChanges {
  @Input() side: VarSide | null;
  @Input() showType = true;
  /** false outside the grant's scope: the mask, whatever the side holds */
  @Input() reveal = true;

  expanded = false;
  private cache: { value: any } | null = null;

  get mode(): 'value' | 'state' | 'mask' {
    const s = this.side;
    if (!this.reveal || !s) return 'mask';
    if (s.value !== undefined) return 'value';
    if (s.value_state && VALUE_STATES.includes(s.value_state)) return 'state';
    return 'mask';
  }

  get stateKey(): string {
    return STATE_KEYS[this.side.value_state];
  }

  /** The JSON text, worked out again only when the value itself changes (a new side object around it does not). */
  json: { text: string; head: string; collapsible: boolean } = { text: '', head: '', collapsible: false };

  ngOnChanges() {
    const value = this.side ? this.side.value : undefined;
    if (this.cache && this.cache.value === value) return;
    let text: string;
    try {
      text = JSON.stringify(value, null, 2);
    } catch {
      text = String(value);
    }
    if (text === undefined) text = String(value);
    const lines = text.split('\n');
    const collapsible = lines.length > VALUE_COLLAPSE_LINES;
    this.cache = { value };
    this.json = { text, head: collapsible ? lines.slice(0, VALUE_COLLAPSE_LINES).join('\n') : text, collapsible };
    this.expanded = false;
  }
}
