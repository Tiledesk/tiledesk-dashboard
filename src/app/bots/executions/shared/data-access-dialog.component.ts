import { Component, Inject, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ExecutionsService } from 'app/services/executions.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { GrantInfo, GrantScope } from '../executions.models';

export const REASON_MIN = 3;
export const REASON_MAX = 500;

export interface DataAccessDialogData {
  projectId: string;
  executionId: string;
  /** The block it was opened from ("View values"): offers and preselects "this block". Null from the header. */
  stepSeq: number | null;
  blockName: string | null;
  /** Days the sealed data is kept, for the 410 text; null when unknown. */
  retentionDays: number | null;
}

interface DialogError {
  key: string;
  params?: { [k: string]: any };
}

/**
 * View data (spec §5): asks a reason and a scope, requests the grant and closes with it, or with null on cancel.
 * Refusals stay in the dialog: 410 no longer kept, 403 permission, 404 nothing stored.
 */
@Component({
  selector: 'execution-data-access-dialog',
  template: `
    <h2 mat-dialog-title>{{ "Executions.DataAccess.Title" | translate }}</h2>
    <mat-dialog-content class="da">
      <label class="da-label" for="da-reason">{{ "Executions.DataAccess.Reason" | translate }}</label>
      <textarea id="da-reason" class="da-reason" rows="3" [attr.maxlength]="max" autocomplete="off"
        [attr.aria-describedby]="'da-reason-hint'" [(ngModel)]="reason" [disabled]="busy"></textarea>
      <div id="da-reason-hint" class="da-hint">{{ "Executions.DataAccess.ReasonHint" | translate: { min: min, max: max } }}</div>

      <div class="da-label">{{ "Executions.DataAccess.Scope" | translate }}</div>
      <mat-radio-group class="da-scopes" [(ngModel)]="scopeType" [disabled]="busy" [attr.aria-label]="'Executions.DataAccess.Scope' | translate">
        <mat-radio-button *ngIf="hasBlock" class="da-scope-step" value="step">
          {{ "Executions.DataAccess.ScopeStep" | translate: { block: blockLabel } }}</mat-radio-button>
        <mat-radio-button class="da-scope-execution" value="execution">{{ "Executions.DataAccess.ScopeExecution" | translate }}</mat-radio-button>
      </mat-radio-group>

      <p class="da-audit" role="note">{{ "Executions.DataAccess.Audited" | translate }}</p>
      <div *ngIf="error" class="da-error" role="alert">{{ error.key | translate: error.params }}</div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" class="mat-dialog-close-btn da-cancel" (click)="cancel()">{{ "Executions.Dialogs.Cancel" | translate }}</button>
      <button mat-button type="button" class="mat-dialog-ok-btn da-confirm" [disabled]="!canConfirm" (click)="confirm()">{{ "Executions.DataAccess.Open" | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .da { max-width: 480px; min-width: 320px; display: grid; gap: 8px; }
    .da-label { font-weight: 500; font-size: 13px; margin: 0; }
    .da-reason { width: 100%; border: 1px solid #c9d0de; border-radius: 8px; padding: 8px 10px; font-size: 13px; resize: vertical; }
    .da-hint { font-size: 12px; color: #5d6b82; }
    .da-scopes { display: grid; gap: 8px; }
    .da-audit { margin: 4px 0 0; font-size: 13px; color: #5d6b82; }
    .da-error { font-size: 13px; color: #c62f2f; }
  `]
})
export class DataAccessDialogComponent implements OnDestroy {
  readonly min = REASON_MIN;
  readonly max = REASON_MAX;
  reason = '';
  scopeType: 'step' | 'execution';
  busy = false;
  error: DialogError | null = null;
  private sub: Subscription | null = null;

  constructor(
    public dialogRef: MatDialogRef<DataAccessDialogComponent, GrantInfo | null>,
    @Inject(MAT_DIALOG_DATA) public data: DataAccessDialogData,
    private executionsService: ExecutionsService,
    private logger: LoggerService
  ) {
    this.scopeType = this.hasBlock ? 'step' : 'execution';
  }

  get hasBlock(): boolean {
    return Number.isInteger(this.data.stepSeq);
  }

  get blockLabel(): string {
    return this.data.blockName || String(this.data.stepSeq);
  }

  /** The reason the service will accept: trimmed, 3 to 500 characters. */
  get trimmedReason(): string {
    return (this.reason || '').trim();
  }

  get reasonValid(): boolean {
    const n = this.trimmedReason.length;
    return n >= REASON_MIN && n <= REASON_MAX;
  }

  get canConfirm(): boolean {
    return this.reasonValid && !this.busy;
  }

  private get scope(): GrantScope {
    return this.scopeType === 'step' && this.hasBlock ? { type: 'step', step_seq: this.data.stepSeq } : { type: 'execution' };
  }

  confirm() {
    if (!this.canConfirm) return;
    this.busy = true;
    this.error = null;
    const body = { reason: this.trimmedReason, scope: this.scope };
    this.sub = this.executionsService.requestDataAccess(this.data.projectId, this.data.executionId, body).subscribe({
      next: info => {
        this.busy = false;
        if (info && typeof info.grant_id === 'string' && typeof info.expires_at === 'string') this.dialogRef.close(info);
        else this.error = { key: 'Executions.DataAccess.Failed' };
      },
      error: err => {
        this.busy = false;
        this.logger.error('[EXECUTION-DATA-ACCESS] request error ', err && err.status);
        this.error = this.errorFor(err);
      }
    });
  }

  cancel() {
    this.dropRequest();
    this.dialogRef.close(null);
  }

  ngOnDestroy() {
    this.dropRequest();
  }

  private dropRequest() {
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = null;
    }
  }

  private errorFor(err: any): DialogError {
    const status = err instanceof HttpErrorResponse ? err.status : err && err.status;
    if (status === 410) {
      const n = this.data.retentionDays;
      return Number.isInteger(n) && n > 0
        ? { key: 'Executions.DataAccess.Expired', params: { n } }
        : { key: 'Executions.DataAccess.ExpiredNoDays' };
    }
    if (status === 403) return { key: 'Executions.DataAccess.Forbidden' };
    if (status === 404) return { key: 'Executions.DataAccess.NoData' };
    if (status === 400) return { key: 'Executions.DataAccess.InvalidBody', params: { min: REASON_MIN, max: REASON_MAX } };
    return { key: 'Executions.DataAccess.Failed' };
  }
}
