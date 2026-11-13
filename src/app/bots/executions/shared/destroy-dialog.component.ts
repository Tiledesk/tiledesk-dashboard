import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DestroyDialogData {
  executionId: string;
}

/** The confirm the API checks: the last 6 characters of the execution id without dashes (uuid v7 starts with a timestamp). */
export function destroyConfirmCode(executionId: string): string {
  return (executionId || '').replace(/-/g, '').slice(-6);
}

/** Destroy execution (spec §11.5). Closes with the confirm code, or null on cancel. */
@Component({
  selector: 'execution-destroy-dialog',
  template: `
    <h2 mat-dialog-title>{{ "Executions.Dialogs.DestroyTitle" | translate }}</h2>
    <mat-dialog-content class="dd">
      <p class="dd-p">{{ "Executions.Dialogs.DestroyText" | translate }}</p>
      <label class="dd-label" for="dd-confirm-input">{{ "Executions.Dialogs.DestroyType" | translate: { code: code } }}</label>
      <input id="dd-confirm-input" class="dd-input" type="text" autocomplete="off" spellcheck="false"
        [(ngModel)]="typed" (keyup.enter)="confirm()">
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" class="mat-dialog-close-btn dd-cancel" (click)="cancel()">{{ "Executions.Dialogs.Cancel" | translate }}</button>
      <button mat-button type="button" class="mat-dialog-ok-btn dd-confirm" [disabled]="!matches" (click)="confirm()">{{ "Executions.Dialogs.Destroy" | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dd { max-width: 460px; display: grid; gap: 8px; }
    .dd-p { margin: 0; }
    .dd-label { font-weight: 500; font-size: 13px; margin: 0; }
    .dd-input { height: 34px; border: 1px solid #c9d0de; border-radius: 8px; padding: 0 10px; font-family: ui-monospace, Menlo, monospace; }
  `]
})
export class DestroyDialogComponent {
  readonly code: string;
  typed = '';

  constructor(
    public dialogRef: MatDialogRef<DestroyDialogComponent, string | null>,
    @Inject(MAT_DIALOG_DATA) public data: DestroyDialogData
  ) {
    this.code = destroyConfirmCode(data.executionId);
  }

  /** Exact match only (no trim, no case folding): the API compares the same way. */
  get matches(): boolean {
    return !!this.code && this.typed === this.code;
  }

  confirm() {
    if (this.matches) this.dialogRef.close(this.code);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
