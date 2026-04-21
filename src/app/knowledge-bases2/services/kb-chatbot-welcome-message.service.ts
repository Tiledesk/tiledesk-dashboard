import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { FaqService } from 'app/services/faq.service';

@Injectable({ providedIn: 'root' })
export class KbChatbotWelcomeMessageService {
  constructor(private faqService: FaqService) {}

  updateWelcomeStaticMessage(input: { botId: string; messageText: string }): Observable<any> {
    const botId = input?.botId;
    if (!botId) {
      throw new Error('botId is required');
    }

    // Best practice here: update the chatbot by importing intents-only JSON (overwrite=true),
    // because this preserves the "export JSON" structure with actions/commands.
    return this.faqService.exportIntentsToJSON(botId).pipe(
      map((intentsJson: any) => this.patchWelcomeStaticOnExportJson(intentsJson, input.messageText ?? '')),
      map((patched: any) => {
        const blob = new Blob([JSON.stringify(patched)], { type: 'application/json' });
        const file = new File([blob], 'intents.json', { type: 'application/json' });
        const formData = new FormData();
        formData.set('id_faq_kb', botId);
        formData.append('uploadFile', file, file.name);
        return formData;
      }),
      switchMap((formData: FormData) => this.faqService.importIntentsFromJSON(botId, formData, 'overwrite')),
    );
  }

  private patchWelcomeStaticOnExportJson(intentsJson: any, messageText: string): any {
    const root = { ...(intentsJson ?? {}) };
    const intents: any[] = Array.isArray(root?.intents) ? [...root.intents] : Array.isArray(root) ? [...root] : [];

    const idx = intents.findIndex((i: any) => i?.intent_display_name === 'welcome_static');
    if (idx === -1) {
      // Keep untouched; avoid regressions.
      return root;
    }

    const intent = { ...(intents[idx] ?? {}) };
    const actions = Array.isArray(intent.actions) ? [...intent.actions] : [];
    const firstAction = { ...(actions[0] ?? {}) };
    const attributes = { ...(firstAction.attributes ?? {}) };
    const commands = Array.isArray(attributes.commands) ? [...attributes.commands] : [];
    const cmd1 = { ...(commands[1] ?? {}) };
    const message = { ...(cmd1.message ?? {}) };

    message.text = messageText;
    cmd1.message = message;
    commands[1] = cmd1;
    attributes.commands = commands;
    firstAction.attributes = attributes;
    actions[0] = firstAction;
    intent.actions = actions;
    intents[idx] = intent;

    if (Array.isArray(root?.intents)) {
      root.intents = intents;
      return root;
    }

    // If exportIntentsToJSON returns an array (unlikely but safe), return array root.
    return intents;
  }
}

