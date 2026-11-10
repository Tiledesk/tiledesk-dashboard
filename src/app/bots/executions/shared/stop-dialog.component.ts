import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export type StopMode = 'soft' | 'hard';

export interface StopDialogData {
  /** Title (or type) of the action running now: named in the hard stop text. */
  action: string | null;
  /** stop_hard_now: only the hard stop, as a confirm. */
  hardOnly: boolean;
}

/** Stop execution (spec §11.5). Closes with the picked mode, or null on cancel. */
@Component({
  selector: 'execution-stop-dialog',
  template: `
    <h2 mat-dialog-title>{{ (data.hardOnly ? "Executions.Dialogs.StopNowTitle" : "Executions.Dialogs.StopTitle") | translate }}</h2>
    <mat-dialog-content class="sd">
      <mat-radio-group *ngIf="!data.hardOnly" class="sd-modes" [(ngModel)]="mode" [attr.aria-label]="'Executions.Dialogs.StopTitle' | translate">
        <mat-radio-button class="sd-soft" value="soft">{{ "Executions.Dialogs.Soft" | translate }}</mat-radio-button>
        <mat-radio-button class="sd-hard" value="hard">{{ "Executions.Dialogs.Hard" | translate }}</mat-radio-button>
      </mat-radio-group>
      <p *ngIf="data.hardOnly" class="sd-p">{{ "Executions.Dialogs.HardNow" | translate }}</p>
      <p *ngIf="data.action" class="sd-hard-text" [class.sd-indent]="!data.hardOnly">
        {{ "Executions.Dialogs.HardAction" | translate: { action: data.action } }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" class="mat-dialog-close-btn sd-cancel" (click)="cancel()">{{ "Executions.Dialogs.Cancel" | translate }}</button>
      <button mat-button type="button" class="mat-dialog-ok-btn sd-confirm" (click)="confirm()">{{ (data.hardOnly ? "Executions.Dialogs.StopNow" : "Executions.Dialogs.Stop") | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .sd { max-width: 460px; }
    .sd-modes { display: grid; gap: 10px; }
    .sd-p { margin: 0 0 6px; }
    .sd-hard-text { margin: 6px 0 0; font-size: 13px; color: #5d6b82; }
    .sd-indent { padding-left: 34px; }
  `]
})
export class StopDialogComponent {
  mode: StopMode;

  constructor(
    public dialogRef: MatDialogRef<StopDialogComponent, StopMode | null>,
    @Inject(MAT_DIALOG_DATA) public data: StopDialogData
  ) {
    this.mode = data.hardOnly ? 'hard' : 'soft';
  }

  confirm() {
    this.dialogRef.close(this.data.hardOnly ? 'hard' : this.mode);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
