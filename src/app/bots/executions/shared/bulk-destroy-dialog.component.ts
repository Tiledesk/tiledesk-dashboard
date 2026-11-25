import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface BulkDestroyDialogData {
  count: number;
}

/** Destroy the selected executions: the user types how many. Closes with true, or null on cancel. */
@Component({
  selector: 'execution-bulk-destroy-dialog',
  template: `
    <h2 mat-dialog-title>{{ "Executions.Bulk.DestroyTitle" | translate: { n: data.count } }}</h2>
    <mat-dialog-content class="bd">
      <p class="bd-p">{{ "Executions.Bulk.DestroyText" | translate }}</p>
      <label class="bd-label" for="bd-confirm-input">{{ "Executions.Bulk.DestroyType" | translate: { n: data.count } }}</label>
      <input id="bd-confirm-input" class="bd-input" type="text" inputmode="numeric" autocomplete="off" spellcheck="false"
        [(ngModel)]="typed" (keyup.enter)="confirm()">
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" class="mat-dialog-close-btn bd-cancel" (click)="cancel()">{{ "Executions.Dialogs.Cancel" | translate }}</button>
      <button mat-button type="button" class="mat-dialog-ok-btn bd-confirm" [disabled]="!matches" (click)="confirm()">{{ "Executions.Dialogs.Destroy" | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .bd { max-width: 460px; display: grid; gap: 8px; }
    .bd-p { margin: 0; }
    .bd-label { font-weight: 500; font-size: 13px; margin: 0; }
    .bd-input { height: 34px; border: 1px solid #c9d0de; border-radius: 8px; padding: 0 10px; font-family: ui-monospace, Menlo, monospace; }
  `]
})
export class BulkDestroyDialogComponent {
  typed = '';

  constructor(
    public dialogRef: MatDialogRef<BulkDestroyDialogComponent, true | null>,
    @Inject(MAT_DIALOG_DATA) public data: BulkDestroyDialogData
  ) { }

  get matches(): boolean {
    return this.data.count > 0 && this.typed.trim() === String(this.data.count);
  }

  confirm() {
    if (this.matches) this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
