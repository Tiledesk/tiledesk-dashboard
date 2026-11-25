import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { parseRunPayload } from './agent-run';

export interface RunAgentDialogData {
  agentName: string;
}

/** Run a Webhook agent once: asks for the JSON payload. Closes with the payload, or null on cancel. */
@Component({
  selector: 'run-agent-dialog',
  template: `
    <h2 mat-dialog-title>{{ "AgentRun.RunTitle" | translate: { name: data.agentName } }}</h2>
    <mat-dialog-content class="ra">
      <p class="ra-p">{{ "AgentRun.RunText" | translate }}</p>
      <label class="ra-label" for="run-agent-payload">{{ "AgentRun.Payload" | translate }}</label>
      <textarea id="run-agent-payload" class="ra-input" rows="8" spellcheck="false" [(ngModel)]="text" (ngModelChange)="error = null"></textarea>
      <p *ngIf="error" class="ra-error" role="alert">{{ (error === 'not_object' ? "AgentRun.NotObject" : "AgentRun.InvalidJson") | translate }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" class="mat-dialog-close-btn ra-cancel" (click)="cancel()">{{ "AgentRun.Cancel" | translate }}</button>
      <button mat-button type="button" class="mat-dialog-ok-btn ra-confirm" (click)="confirm()">{{ "AgentRun.Run" | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .ra { max-width: 520px; min-width: 320px; }
    .ra-p { margin: 0 0 10px; }
    .ra-label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 4px; }
    .ra-input { width: 100%; box-sizing: border-box; font-family: monospace; font-size: 13px; padding: 8px; border: 1px solid #c4cad6; border-radius: 4px; resize: vertical; }
    .ra-error { margin: 6px 0 0; font-size: 13px; color: #d93025; }
  `]
})
export class RunAgentDialogComponent {
  text = '{}';
  error: 'invalid_json' | 'not_object' | null = null;

  constructor(
    public dialogRef: MatDialogRef<RunAgentDialogComponent, { [k: string]: any } | null>,
    @Inject(MAT_DIALOG_DATA) public data: RunAgentDialogData
  ) { }

  confirm() {
    const parsed = parseRunPayload(this.text);
    if (parsed.ok === false) {
      this.error = parsed.error;
      return;
    }
    this.dialogRef.close(parsed.payload);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
