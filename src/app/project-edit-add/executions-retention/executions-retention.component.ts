import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RetentionSettings } from 'app/bots/executions/executions.models';
import { ExecutionsService } from 'app/services/executions.service';
import { LoggerService } from 'app/services/logger/logger.service';

export const TRACE_RANGE = { min: 7, max: 365 };
export const DATA_RANGE = { min: 0, max: 90 };

export interface RetentionConfirmData {
  /** Data older than this many days is deleted. */
  days: number;
  /** Sealed data lowered to 0: capture stops. */
  dataZero: boolean;
}

/** Confirm shown only when a value is lowered. Closes with true to go on. */
@Component({
  selector: 'executions-retention-confirm-dialog',
  template: `
    <h2 mat-dialog-title>{{ "Executions.Retention.ConfirmTitle" | translate }}</h2>
    <mat-dialog-content class="rcd">
      <p class="rcd-delete">{{ "Executions.Retention.ConfirmDelete" | translate: { days: data.days } }}</p>
      <p *ngIf="data.dataZero" class="rcd-capture">{{ "Executions.Retention.ConfirmCapture" | translate }}</p>
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

  get canSave(): boolean {
    return !!this.settings && this.settings.can_edit && !this.saving && Number.isInteger(this.traceDays) && Number.isInteger(this.dataDays);
  }

  edited() {
    this.saved = false;
    this.saveFailed = false;
    this.fieldError = null;
  }

  save() {
    if (!this.canSave) { return; }
    this.saved = false;
    this.saveFailed = false;
    this.fieldError = null;
    const body = { trace_days: this.traceDays, data_days: this.dataDays };
    const lowered: number[] = [];
    if (body.trace_days < this.settings.trace_days) { lowered.push(body.trace_days); }
    if (body.data_days < this.settings.data_days) { lowered.push(body.data_days); }
    if (lowered.length === 0) {
      this.put(body);
      return;
    }
    const data: RetentionConfirmData = {
      days: Math.min(...lowered),
      dataZero: body.data_days === 0 && this.settings.data_days > 0
    };
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
