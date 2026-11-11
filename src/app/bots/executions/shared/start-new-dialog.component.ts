import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/** tybot's marker for a value hidden when stored (tiledesk-executions MASK). */
export const SECRET_MARKER = '[secret]';

export type PathSegment = string | number;

const PLAIN_KEY = /^[^.[\]"\\]+/;
const INDEX = /^\[(\d+)\]/;

/**
 * Parses a masked path as the service writes it (tiledesk-executions formatPath): object keys joined with ".",
 * array elements as "[i]", other keys as `["<key as JSON string>"]`. Null when the path is malformed.
 * Examples: `customer.api_key`, `items[0].token`, `headers["a.b"]`.
 */
export function parseMaskedPath(path: string): PathSegment[] | null {
  if (typeof path !== 'string' || !path) return null;
  const segs: PathSegment[] = [];
  let i = 0;
  while (i < path.length) {
    if (path[i] === '[') {
      if (path[i + 1] === '"') {
        let j = i + 2;
        while (j < path.length && path[j] !== '"') j += path[j] === '\\' ? 2 : 1;
        if (j >= path.length || path[j + 1] !== ']') return null;
        let key: any;
        try { key = JSON.parse(path.slice(i + 1, j + 1)); } catch { return null; }
        if (typeof key !== 'string') return null;
        segs.push(key);
        i = j + 2;
      } else {
        const m = INDEX.exec(path.slice(i));
        if (!m) return null;
        segs.push(Number(m[1]));
        i += m[0].length;
      }
    } else {
      if (segs.length) {
        if (path[i] !== '.') return null;
        i++;
      }
      const m = PLAIN_KEY.exec(path.slice(i));
      if (!m) return null;
      segs.push(m[0]);
      i += m[0].length;
    }
  }
  return segs.length ? segs : null;
}

const isPlainObject = (v: any): boolean => !!v && typeof v === 'object' && !Array.isArray(v);

/** The value at the path: array elements only by index, object members only by own key; undefined otherwise. */
export function valueAtPath(root: any, segs: PathSegment[]): any {
  let cur = root;
  for (const s of segs) {
    if (typeof s === 'number') {
      if (!Array.isArray(cur) || s >= cur.length) return undefined;
      cur = cur[s];
    } else {
      if (!isPlainObject(cur) || !Object.prototype.hasOwnProperty.call(cur, s)) return undefined;
      cur = cur[s];
    }
  }
  return cur;
}

/**
 * A masked field counts as filled unless it is null, missing, blank, still the secret marker, or an empty
 * object or array. 0 and false are values the user may mean.
 */
export function isFilled(v: any): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v.trim() !== '' && v !== SECRET_MARKER;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object') return Object.keys(v).length > 0;
  return true;
}

/** The masked paths the input does not fill in (a malformed path is never filled). */
export function missingMasked(input: any, masked: string[]): string[] {
  return (masked || []).filter(p => {
    const segs = parseMaskedPath(p);
    return !segs || !isFilled(valueAtPath(input, segs));
  });
}

export interface StartNewDialogData {
  agentName: string;
  /** Stored input, masked values set to null. */
  input: { [k: string]: any };
  /** Paths of the masked values: required fields. */
  masked: string[];
  /** Fields the service reported missing (400 missing_input): highlighted. */
  missing?: string[];
  /** Text of a previous attempt: the editor reopens with it. */
  text?: string;
  /** How much of the stored input the service returned (note above the editor unless 'ok'). */
  stored?: 'ok' | 'none' | 'unreadable' | 'structure_only';
}

interface FieldView {
  path: string;
  missing: boolean;
  server: boolean;
}

/**
 * Start new execution (spec §11.5, decision U2). The user edits the stored input as JSON and fills in the masked
 * fields; closes with exactly the parsed object, or null on cancel.
 */
@Component({
  selector: 'execution-start-new-dialog',
  template: `
    <h2 mat-dialog-title>{{ "Executions.Dialogs.StartNewTitle" | translate }}</h2>
    <mat-dialog-content class="sn">
      <p class="sn-p">{{ "Executions.Dialogs.StartNewText" | translate: { agent: data.agentName } }}</p>

      <p *ngIf="storedNoteKey" class="sn-p sn-stored" role="note">{{ storedNoteKey | translate }}</p>

      <div *ngIf="fields.length" class="sn-masked">
        <p class="sn-p sn-masked-title">{{ "Executions.Dialogs.StartNewMasked" | translate }}</p>
        <p *ngIf="data.missing?.length" class="sn-p sn-server-note" role="alert">{{ "Executions.Dialogs.StartNewServerMissing" | translate }}</p>
        <ul class="sn-fields">
          <li *ngFor="let f of fields; trackBy: trackByPath" class="sn-field" [class.sn-missing]="f.missing" [class.sn-server-missing]="f.server">
            <code class="sn-path">{{ f.path }}</code>
            <span class="sn-state">{{ (f.missing ? "Executions.Dialogs.StartNewFieldRequired" : "Executions.Dialogs.StartNewFieldFilled") | translate }}</span>
          </li>
        </ul>
      </div>

      <label class="sn-label" for="sn-input">{{ "Executions.Dialogs.StartNewInput" | translate }}</label>
      <textarea id="sn-input" class="sn-input" rows="12" spellcheck="false" autocomplete="off"
        [attr.aria-invalid]="error ? 'true' : null" [attr.aria-describedby]="error ? 'sn-error' : null"
        [ngModel]="text" (ngModelChange)="onText($event)"></textarea>
      <div *ngIf="error" id="sn-error" class="sn-error" role="alert">{{ error | translate }}</div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" class="mat-dialog-close-btn sn-cancel" (click)="cancel()">{{ "Executions.Dialogs.Cancel" | translate }}</button>
      <button mat-button type="button" class="mat-dialog-ok-btn sn-confirm" [disabled]="!canStart" (click)="confirm()">{{ "Executions.Dialogs.StartNew" | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .sn { max-width: 560px; min-width: 320px; display: grid; gap: 8px; }
    .sn-p { margin: 0; }
    .sn-stored { font-size: 13px; color: #a15c00; }
    .sn-masked-title { font-weight: 500; font-size: 13px; }
    .sn-server-note { font-size: 13px; color: #c62f2f; }
    .sn-fields { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
    .sn-field { display: flex; gap: 8px; align-items: baseline; font-size: 13px; }
    .sn-path { font-family: ui-monospace, Menlo, monospace; word-break: break-all; }
    .sn-state { color: #1f7a45; }
    .sn-missing .sn-state { color: #a15c00; }
    .sn-server-missing .sn-path { background: #fdecec; color: #c62f2f; border-radius: 4px; padding: 0 4px; }
    .sn-label { font-weight: 500; font-size: 13px; margin: 0; }
    .sn-input { width: 100%; border: 1px solid #c9d0de; border-radius: 8px; padding: 8px 10px; font-family: ui-monospace, Menlo, monospace; font-size: 12px; resize: vertical; }
    .sn-input[aria-invalid="true"] { border-color: #c62f2f; }
    .sn-error { font-size: 13px; color: #c62f2f; }
  `]
})
export class StartNewDialogComponent {
  text: string;
  parsed: { [k: string]: any } | null = null;
  /** i18n key of the parse problem, or null when the text is a JSON object. */
  error: string | null = null;
  fields: FieldView[] = [];

  constructor(
    public dialogRef: MatDialogRef<StartNewDialogComponent, { [k: string]: any } | null>,
    @Inject(MAT_DIALOG_DATA) public data: StartNewDialogData
  ) {
    this.text = typeof data.text === 'string' ? data.text : JSON.stringify(data.input || {}, null, 2);
    this.evaluate();
  }

  /** none and unreadable read the same: there is nothing to prefill. */
  get storedNoteKey(): string | null {
    switch (this.data.stored) {
      case 'none':
      case 'unreadable': return 'Executions.Dialogs.StartNewStoredNone';
      case 'structure_only': return 'Executions.Dialogs.StartNewStoredHidden';
      default: return null;
    }
  }

  get canStart(): boolean {
    return !!this.parsed && !this.error && this.fields.every(f => !f.missing);
  }

  onText(value: string) {
    this.text = value;
    this.evaluate();
  }

  private evaluate() {
    let value: any;
    this.parsed = null;
    try {
      value = JSON.parse(this.text);
    } catch {
      this.error = 'Executions.Dialogs.StartNewInvalidJson';
    }
    if (value !== undefined) {
      if (isPlainObject(value)) {
        this.parsed = value;
        this.error = null;
      } else {
        this.error = 'Executions.Dialogs.StartNewNotObject';
      }
    }
    // the service checks the stored masked paths; a field it reported that the list lacks is required too
    const reported = this.data.missing || [];
    const masked = this.data.masked || [];
    const paths = masked.concat(reported.filter(p => !masked.includes(p)));
    const missing = new Set(this.parsed ? missingMasked(this.parsed, paths) : paths);
    const server = new Set(reported);
    this.fields = paths.map(path => ({ path, missing: missing.has(path), server: server.has(path) }));
  }

  confirm() {
    if (this.canStart) this.dialogRef.close(this.parsed);
  }

  cancel() {
    this.dialogRef.close(null);
  }

  trackByPath(_: number, f: FieldView) {
    return f.path;
  }
}
