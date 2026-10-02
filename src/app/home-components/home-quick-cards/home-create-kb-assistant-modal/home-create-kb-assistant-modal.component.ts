import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

export type HomeCreateKbAssistantModalResult = 'create' | 'contents';

@Component({
  selector: 'appdashboard-home-create-kb-assistant-modal',
  templateUrl: './home-create-kb-assistant-modal.component.html',
  styleUrls: ['./home-create-kb-assistant-modal.component.scss'],
})
export class HomeCreateKbAssistantModalComponent implements OnInit {
  title = '';
  bodyText = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { useDefaultKbCopy?: boolean; kbName?: string },
    public dialogRef: MatDialogRef<HomeCreateKbAssistantModalComponent, HomeCreateKbAssistantModalResult | undefined>,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.title = (this.translate.instant('HomeQuickCards.CreateKbAssistantTitle') || '').trim();
    const textKey = this.data?.useDefaultKbCopy
      ? 'HomeQuickCards.CreateKbAssistantTextDefault'
      : 'HomeQuickCards.CreateKbAssistantText';
    this.bodyText = (this.translate.instant(textKey) || '').trim();
  }

  onCreate(): void {
    this.dialogRef.close('create');
  }

  onContentsOnly(): void {
    this.dialogRef.close('contents');
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
