import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FaqKbService } from 'app/services/faq-kb.service';
import { KbChatbotWelcomeMessageService } from '../../services/kb-chatbot-welcome-message.service';
import { take } from 'rxjs/operators';
import type { KbNamespace } from '../../models/kb-types';

export interface ModalChatbotWelcomeMessageData {
  namespace: KbNamespace;
  chatbot?: any;
  welcomeMessage?: string;
}

@Component({
  selector: 'appdashboard-modal-chatbot-welcome-message',
  templateUrl: './modal-chatbot-welcome-message.component.html',
  styleUrls: ['./modal-chatbot-welcome-message.component.scss'],
})
export class ModalChatbotWelcomeMessageComponent {
  welcomeMessage = '';
  chatbotJson = '';
  isLoadingChatbotJson = false;
  isSaving = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ModalChatbotWelcomeMessageData,
    public dialogRef: MatDialogRef<ModalChatbotWelcomeMessageComponent>,
    private faqKbService: FaqKbService,
    private welcomeMessageService: KbChatbotWelcomeMessageService,
  ) {
    this.welcomeMessage = data?.welcomeMessage ?? '';
    this.chatbotJson = JSON.stringify(data?.chatbot ?? {}, null, 2);
    this.loadFullChatbotJson();
  }

  private loadFullChatbotJson(): void {
    const botId = this.data?.chatbot?._id ?? this.data?.chatbot?.id;
    if (!botId) return;

    this.isLoadingChatbotJson = true;
    this.faqKbService
      // This endpoint returns the fully-hydrated chatbot payload (including actions).
      .exportChatbotToJSON(botId)
      .pipe(take(1))
      .subscribe({
        next: (fullBot: any) => {
          // Force the JSON view to reflect the fully hydrated chatbot payload (including actions).
          this.chatbotJson = JSON.stringify(fullBot ?? {}, null, 2);

          const extracted = this.extractWelcomeStaticMessageText(fullBot);
          if (typeof extracted === 'string') {
            this.welcomeMessage = extracted;
          }
        },
        error: () => {
          // Keep the partial JSON already available; no side-effects required.
        },
        complete: () => {
          this.isLoadingChatbotJson = false;
        },
      });
  }

  private extractWelcomeStaticMessageText(fullBot: any): string | undefined {
    const intents: any[] = fullBot?.intents ?? fullBot?.faq ?? fullBot?.faqs ?? [];
    if (!Array.isArray(intents)) return undefined;

    const welcomeIntent = intents.find((i) => i?.intent_display_name === 'welcome_static');
    const text = welcomeIntent?.actions?.[0]?.attributes?.commands?.[1]?.message?.text;
    return typeof text === 'string' ? text : undefined;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    const botId = this.data?.chatbot?._id ?? this.data?.chatbot?.id;
    if (!botId) {
      return;
    }

    if (this.isSaving) return;
    this.isSaving = true;

    this.welcomeMessageService
      .updateWelcomeStaticMessage({ botId, messageText: this.welcomeMessage })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.dialogRef.close({ welcomeMessage: this.welcomeMessage });
        },
        error: () => {
          // Keep modal open; allow user to retry.
          this.isSaving = false;
        },
        complete: () => {
          this.isSaving = false;
        },
      });
  }

  onEnter(event: KeyboardEvent): void {
    if (event.shiftKey) return;
    event.preventDefault();
    this.onSave();
  }
}

