import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RetentionSettings } from 'app/bots/executions/executions.models';
import { ExecutionsService } from 'app/services/executions.service';
import { LoggerService } from 'app/services/logger/logger.service';

export const TRACE_RANGE = { min: 7, max: 365 };
export const DATA_RANGE = { min: 0, max: 90 };

export interface RetentionConfirmData {
  /** Trace lowered to this many days (absent when not lowered). */
  traceDays?: number;
  /** Sealed data lowered to this many days (absent when not lowered). */
  dataDays?: number;
  /** Sealed data lowered to 0: everything stored goes and capture stops. */
  dataZero: boolean;
}

/** "<key>" or "<key>_one" for 1 day. */
function daysKey(key: string, days: number): string {
  return days === 1 ? key + '_one' : key;
}

/** Confirm shown only when a value is lowered: one line per lowered setting. Closes with true to go on. */
@Component({
  selector: 'executions-retention-confirm-dialog',
  template: `
    <h2 mat-dialog-title>{{ "Executions.Retention.ConfirmTitle" | translate }}</h2>
    <mat-dialog-content class="rcd">
      <p *ngIf="hasTrace" class="rcd-trace">{{ traceKey | translate: { days: data.traceDays } }}</p>
      <p *ngIf="hasData && !data.dataZero" class="rcd-data">{{ dataKey | translate: { days: data.dataDays } }}</p>
      <ng-container *ngIf="data.dataZero">
        <p class="rcd-data rcd-data-zero">{{ "Executions.Retention.ConfirmDataZero" | translate }}</p>
        <p class="rcd-capture">{{ "Executions.Retention.ConfirmCapture" | translate }}</p>
      </ng-container>
      <p class="rcd-undo">{{ "Executions.Retention.ConfirmIrreversible" | translate }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" class="mat-dialog-close-btn rcd-cancel" (click)="dialogRef.close(false)">{{ "Executions.Dialogs.Cancel" | translate }}</button>
      <button mat-button type="button" class="mat-dialog-ok-btn rcd-confirm" (click)="dialogRef.close(true)">{{ "Executions.Retention.ConfirmAction" | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`.rcd { max-width: 460px; } .rcd p { margin: 0 0 8px; }`]
})
export class RetentionConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<RetentionConfirmDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: RetentionConfirmData
  ) { }

  get hasTrace(): boolean { return Number.isInteger(this.data.traceDays); }
  get hasData(): boolean { return Number.isInteger(this.data.dataDays); }
  get traceKey(): string { return daysKey('Executions.Retention.ConfirmTrace', this.data.traceDays); }
  get dataKey(): string { return daysKey('Executions.Retention.ConfirmData', this.data.dataDays); }
}

/** "Executions" card of the project settings retention page (spec phase 4 §5, §6.4). */
@Component({
  selector: 'executions-retention',
  templateUrl: './executions-retention.component.html',
  styleUrls: ['./executions-retention.component.scss']
})
export class ExecutionsRetentionComponent implements OnInit {
  @Input() projectId: string;

  readonly traceRange = TRACE_RANGE;
  readonly dataRange = DATA_RANGE;

  configured = false;
  settings: RetentionSettings = null;
  traceDays: number = null;
  dataDays: number = null;
  saving = false;
  saved = false;
  /** Field the last save was refused for (out of range). */
  fieldError: 'trace_days' | 'data_days' | null = null;
  /** Sealed data set longer than the trace (checked here, before any confirm). */
  dataOverTrace = false;
  saveFailed = false;

  constructor(
    private executions: ExecutionsService,
    private dialog: MatDialog,
    private logger: LoggerService
  ) { }

  ngOnInit() {
    this.configured = this.executions.isConfigured();
    if (!this.configured || !this.projectId) { return; }
    this.executions.getRetention(this.projectId).subscribe({
      next: (s) => this.apply(s),
      // no permission to read (or the service is down): no card
      error: (err) => { this.logger.warn('[EXECUTIONS-RETENTION] read failed', err && err.status); this.settings = null; }
    });
  }

  private apply(s: RetentionSettings) {
    this.settings = s;
    this.traceDays = s.trace_days;
    this.dataDays = s.data_days;
  }

  /** Whether a value differs from the saved one (saving the same values would only add an audit entry). */
  get changed(): boolean {
    return !!this.settings && (this.traceDays !== this.settings.trace_days || this.dataDays !== this.settings.data_days);
  }

  get canSave(): boolean {
    return !!this.settings && this.settings.can_edit && !this.saving && this.changed
      && Number.isInteger(this.traceDays) && Number.isInteger(this.dataDays);
  }

  edited() {
    this.saved = false;
    this.saveFailed = false;
    this.fieldError = null;
    this.dataOverTrace = false;
  }

  save() {
    if (!this.canSave) { return; }
    this.saved = false;
    this.saveFailed = false;
    this.fieldError = null;
    this.dataOverTrace = false;
    const body = { trace_days: this.traceDays, data_days: this.dataDays };
    if (body.data_days > body.trace_days) {
      this.dataOverTrace = true;
      return;
    }
    const traceLowered = body.trace_days < this.settings.trace_days;
    const dataLowered = body.data_days < this.settings.data_days;
    if (!traceLowered && !dataLowered) {
      this.put(body);
      return;
    }
    const data: RetentionConfirmData = { dataZero: dataLowered && body.data_days === 0 };
    if (traceLowered) { data.traceDays = body.trace_days; }
    if (dataLowered) { data.dataDays = body.data_days; }
    this.dialog.open(RetentionConfirmDialogComponent, { data, width: '480px' }).afterClosed().subscribe((ok) => {
      if (ok) { this.put(body); }
    });
  }

  private put(body: { trace_days: number; data_days: number }) {
    this.saving = true;
    this.executions.putRetention(this.projectId, body).subscribe({
      next: (s) => { this.saving = false; this.apply(s); this.saved = true; },
      error: (err) => {
        this.saving = false;
        const e = err && err.error;
        if (err && err.status === 400 && e && e.error === 'out_of_range' && (e.field === 'trace_days' || e.field === 'data_days')) {
          this.fieldError = e.field;
        } else {
          this.saveFailed = true;
        }
      }
    });
  }
}
