import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { formatMaskedApikeyForDisplay, isMaskedApikey } from 'app/integrations/utils';

@Component({
  selector: 'integration-api-key-field',
  templateUrl: './integration-api-key-field.component.html',
  styleUrls: ['./integration-api-key-field.component.scss']
})
export class IntegrationApiKeyFieldComponent implements OnInit, OnChanges {

  /** Masked (or empty) API key as returned by the server. */
  @Input() storedApikey: string | null | undefined;

  /** When true, an empty key does not block Save. */
  @Input() optional = false;

  /** Show “(optional)” next to the label. */
  @Input() showOptionalHint = false;

  @Input() inputId = 'api-key-input';

  /**
   * Bump this when the parent switches context (e.g. selected endpoint)
   * so Change mode is reset even if storedApikey looks unchanged.
   */
  @Input() resetKey: string | number | null | undefined;

  /** Value the parent should keep on the integration model for save. */
  @Output() apikeyChange = new EventEmitter<string | null>();

  /** Whether the API key constraint allows Save. */
  @Output() canSaveChange = new EventEmitter<boolean>();

  /** True while the user is replacing a stored key (Change mode). */
  @Output() isReplacingChange = new EventEmitter<boolean>();

  isReplacing = false;
  draftApikey = '';

  /** Snapshot of the server value; kept across Change until Cancel or external reset. */
  private initialStored = '';

  ngOnInit(): void {
    this.syncFromStored(true);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resetKey'] && !changes['resetKey'].firstChange) {
      this.syncFromStored(true);
      return;
    }

    if (!changes['storedApikey'] || changes['storedApikey'].firstChange) {
      return;
    }

    const next = this.normalize(this.storedApikey);
    const draft = this.normalize(this.draftApikey);

    // Editing (first insert or Change): parent echoes our draft via two-way binding.
    // Ignore that echo; only adopt a server-masked key after Save.
    if (!this.isReadonly) {
      if (!next || next === draft) {
        return;
      }
      if (isMaskedApikey(next)) {
        this.syncFromStored(true);
      }
      return;
    }

    // Readonly: follow external updates (reload / select).
    this.syncFromStored(false);
  }

  private syncFromStored(forceExitReplace: boolean): void {
    if (forceExitReplace) {
      this.isReplacing = false;
    }
    this.initialStored = this.normalize(this.storedApikey);
    this.draftApikey = '';
    this.emitState();
  }

  get hasStoredKey(): boolean {
    return !!this.initialStored;
  }

  get isReadonly(): boolean {
    return this.hasStoredKey && !this.isReplacing;
  }

  get displayValue(): string {
    if (!this.isReadonly) {
      return this.draftApikey;
    }
    return isMaskedApikey(this.initialStored)
      ? formatMaskedApikeyForDisplay(this.initialStored)
      : this.initialStored;
  }

  get placeholderKey(): string {
    return this.isReadonly ? 'Integration.YourApikey' : 'Integration.PasteNewApikey';
  }

  get canSave(): boolean {
    if (this.optional) {
      return true;
    }
    if (this.hasStoredKey && !this.isReplacing) {
      return false;
    }
    return this.normalize(this.draftApikey).length > 0;
  }

  onAction(): void {
    if (this.isReplacing) {
      this.cancelChange();
    } else {
      this.startChange();
    }
  }

  onInput(event: Event): void {
    if (this.isReadonly) {
      return;
    }
    this.draftApikey = (event.target as HTMLInputElement).value;
    this.emitState();
  }

  private startChange(): void {
    this.isReplacing = true;
    this.draftApikey = '';
    this.emitState();
  }

  private cancelChange(): void {
    this.isReplacing = false;
    this.draftApikey = '';
    this.emitState();
  }

  private emitState(): void {
    if (this.isReadonly) {
      this.apikeyChange.emit(this.initialStored || null);
    } else {
      this.apikeyChange.emit(this.draftApikey ? this.draftApikey : null);
    }
    this.canSaveChange.emit(this.canSave);
    this.isReplacingChange.emit(this.isReplacing);
  }

  private normalize(value: string | null | undefined): string {
    return String(value || '').trim();
  }
}
