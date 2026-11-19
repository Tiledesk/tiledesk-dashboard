import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ResumeDialogData {
  /** Title (or type) of the action the resume continues from; null when not known. */
  action: string | null;
  /** The action calls an external system and may already have reached it (409 confirm_required). */
  calling: boolean;
  /** Automation run: the resumed run cannot answer the original sync caller (spec §6.3). */
  automation: boolean;
}

/** Resume execution (spec §11.5). Closes with true when confirmed, or null on cancel. */
@Component({
  selector: 'execution-resume-dialog',
  template: `
    <h2 mat-dialog-title>{{ "Executions.Dialogs.ResumeTitle" | translate }}</h2>
    <mat-dialog-content class="rd">
      <p class="rd-p rd-from">{{ data.action
        ? ("Executions.Dialogs.ResumeFrom" | translate: { action: data.action })
        : ("Executions.Dialogs.ResumeFromUnknown" | translate) }}</p>
      <p *ngIf="data.calling" class="rd-warning" role="alert">
        <span aria-hidden="true">⚠</span> {{ "Executions.Dialogs.ResumeWarning" | translate }}</p>
      <p *ngIf="data.automation" class="rd-automation">{{ "Executions.Dialogs.ResumeAutomation" | translate }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" class="mat-dialog-close-btn rd-cancel" (click)="cancel()">{{ "Executions.Dialogs.Cancel" | translate }}</button>
      <button mat-button type="button" class="mat-dialog-ok-btn rd-confirm" (click)="confirm()">{{ "Executions.Dialogs.Resume" | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .rd { max-width: 460px; display: grid; gap: 8px; }
    .rd-p { margin: 0; }
    .rd-warning { margin: 0; padding: 8px 10px; border-radius: 8px; color: #a15c00; background: #fff3e0; }
    .rd-automation { margin: 0; font-size: 13px; color: #5d6b82; }
  `]
})
export class ResumeDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ResumeDialogComponent, true | null>,
    @Inject(MAT_DIALOG_DATA) public data: ResumeDialogData
  ) { }

  confirm() {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
