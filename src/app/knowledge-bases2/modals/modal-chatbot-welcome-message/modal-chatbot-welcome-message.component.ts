import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FaqKbService } from 'app/services/faq-kb.service';
import { NotifyService } from 'app/core/notify.service';
import { TranslateService } from '@ngx-translate/core';
import { KbChatbotPatcherService } from '../../services/kb-chatbot-patcher.service';
import { take } from 'rxjs/operators';
import type { KbNamespace } from '../../models/kb-types';
import { KB_CHATBOT_TEMPLATES } from '../../constants/kb-chatbot-templates.constants';
import { KB_CHATBOT_INTENTS } from '../../constants/kb-chatbot-intents.constants';

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
  mode: 'static' | 'dynamic' = 'static';
  welcomeMessage = '';
  dynamicPrompt = '';
  chatbotJson = '';
  isLoadingChatbotJson = false;
  genWelcomeQuestion: string | null = null;
  welcomeStaticText: string | null = null;
  isSaving = false;
  private loadedChatbot: any = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ModalChatbotWelcomeMessageData,
    public dialogRef: MatDialogRef<ModalChatbotWelcomeMessageComponent>,
    private faqKbService: FaqKbService,
    private chatbotPatcher: KbChatbotPatcherService,
    private notify: NotifyService,
    private translate: TranslateService,
  ) {
    this.welcomeMessage = data?.welcomeMessage ?? '';
    this.chatbotJson = JSON.stringify(data?.chatbot ?? {}, null, 2);
    this.genWelcomeQuestion = null;
    this.welcomeStaticText = null;
    this.loadFullChatbotJson();
  }

  /**
   * Loads the fully-hydrated chatbot payload (including actions) and initializes the modal state:
   * - populates the JSON preview
   * - extracts the static welcome message (welcome_static)
   * - if the chatbot parent is "AI my agent", also derives static + dynamic values (gen_welcome preferred)
   */
  private loadFullChatbotJson(): void {
    const botId = this.data?.chatbot?._id ?? this.data?.chatbot?.id;
    if (!botId) return;
    this.isLoadingChatbotJson = true;
    this.faqKbService
      .exportChatbotToJSON(botId)
      .pipe(take(1))
      .subscribe({
        next: (fullBot: any) => {
          this.chatbotJson = JSON.stringify(fullBot ?? {}, null, 2);
          this.loadedChatbot = fullBot ?? null;
          const extracted = this.extractWelcomeStaticMessageText(fullBot);
          if (typeof extracted === 'string' && extracted.trim()) {
            this.welcomeMessage = extracted;
          }
          this.computeAiMyAgentWelcomeValues(fullBot);
        },
        error: () => {
        },
        complete: () => {
          this.isLoadingChatbotJson = false;
        },
      });
  }

  /**
   * If the chatbot was cloned from the "AI my agent" template, derives the welcome values for the UI:
   * - dynamic prompt from `gen_welcome` (preferred)
   * - otherwise static welcome message from `welcome_static`
   */
  private computeAiMyAgentWelcomeValues(fullBot: any): void {
    this.genWelcomeQuestion = null;
    this.welcomeStaticText = null;

    const parent = fullBot?.attributes?.parentTemplate ?? fullBot?.parentTemplate;
    const parentSlug = String(parent?.slug ?? '').toLowerCase();
    const parentName = String(parent?.name ?? '').toLowerCase();

    const isAiMyAgentParent =
      parentSlug === KB_CHATBOT_TEMPLATES.AI_MY_AGENT.slug || parentName.trim() === KB_CHATBOT_TEMPLATES.AI_MY_AGENT.name;
    if (!isAiMyAgentParent) return;

    const intents: any[] = fullBot?.intents ?? [];
    if (!Array.isArray(intents)) return;

    const promptText = this.extractGenWelcomePromptText(fullBot);
    if (typeof promptText === 'string' && promptText.trim()) {
      this.genWelcomeQuestion = promptText;
      this.dynamicPrompt = promptText;
    }

    const staticText = this.extractWelcomeStaticMessageText(fullBot);
    if (typeof staticText === 'string' && staticText.trim()) {
      this.welcomeStaticText = staticText;
      // Keep the editable field consistent with the actual welcome_static value on load.
      this.welcomeMessage = staticText;
    }
  }



  /**
   * Extracts the dynamic welcome prompt (`gen_welcome`) from the chatbot payload.
   * Returns undefined when the intent/action path is not present.
   */
  private extractGenWelcomePromptText(fullBot: any): string | undefined {
    const intents: any[] = fullBot?.intents ?? fullBot?.faq ?? fullBot?.faqs ?? [];
    if (!Array.isArray(intents)) return undefined;
    const genWelcome = intents.find((i) => i?.intent_display_name === KB_CHATBOT_INTENTS.GEN_WELCOME);
    const a0 = Array.isArray(genWelcome?.actions) ? genWelcome.actions[0] : undefined;
    const q = a0?.question?.text ?? a0?.question;
    return typeof q === 'string' ? q : undefined;
  }

  /**
   * Extracts the static welcome message from the chatbot payload using the "exportChatbotToJSON" structure.
   * Returns undefined when the intent/action path is not present.
   */
  private extractWelcomeStaticMessageText(fullBot: any): string | undefined {
    const intents: any[] = fullBot?.intents ?? fullBot?.faq ?? fullBot?.faqs ?? [];
    if (!Array.isArray(intents)) return undefined;
    const welcomeIntent = intents.find((i) => i?.intent_display_name === KB_CHATBOT_INTENTS.WELCOME_STATIC);
    const a0 = Array.isArray(welcomeIntent?.actions) ? welcomeIntent.actions[0] : undefined;
    const text =
      a0?.message?.text ??
      a0?.attributes?.message?.text ??
      welcomeIntent?.actions?.[0]?.attributes?.commands?.[1]?.message?.text;
    return typeof text === 'string' ? text : undefined;
  }

  /** Closes the modal without persisting changes. */
  onCancel(): void {
    this.dialogRef.close();
  }

  /**
   * Applies in-memory patches (static + dynamic welcome values) to the loaded chatbot and then calls
   * the shared update endpoint by passing the entire modified chatbot object.
   */
  onSave(): void {
    const chatbot = this.loadedChatbot ?? this.data?.chatbot ?? null;
    if (!chatbot) return;
    const botId = chatbot?._id ?? chatbot?.id ?? this.data?.chatbot?._id ?? this.data?.chatbot?.id;
    if (!botId) {
      this.notify.showWidgetStyleUpdateNotification(this.translate.instant('AnErrorOccurredWhileUpdating'), 4, 'report_problem');
      return;
    }
    if (this.isSaving) return;

    this.isSaving = true;
    const patched = this.chatbotPatcher.patchWelcomeMessages({
      chatbot: { ...chatbot, _id: chatbot?._id ?? botId, id: chatbot?.id ?? botId },
      staticText: this.welcomeMessage ?? '',
      dynamicPrompt: this.dynamicPrompt ?? '',
    });

    // Keep the modal state consistent with the payload that will be persisted.
    this.loadedChatbot = patched;
    this.chatbotJson = JSON.stringify(patched ?? {}, null, 2);

    this.chatbotPatcher
      .updateChatbot(patched)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.notify.showWidgetStyleUpdateNotification('Saved successfully', 2, 'done');
          this.dialogRef.close({ ok: true });
        },
        error: () => {
          this.notify.showWidgetStyleUpdateNotification(this.translate.instant('AnErrorOccurredWhileUpdating'), 4, 'report_problem');
          this.isSaving = false;
        },
        complete: () => {
          this.isSaving = false;
        },
      });
  }

  /** Saves on Enter; Shift+Enter keeps a newline in the textarea. */
  onEnter(event: KeyboardEvent): void {
    if (event.shiftKey) return;
    event.preventDefault();
    this.onSave();
  }

  /** Switches between the "static" and "dynamic" editor cards. */
  setMode(mode: 'static' | 'dynamic'): void {
    this.mode = mode;
  }
}

