import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FaqKbService } from 'app/services/faq-kb.service';
import { KB_CHATBOT_INTENTS } from '../constants/kb-chatbot-intents.constants';

@Injectable({ providedIn: 'root' })
export class KbChatbotPatcherService {
  constructor(private faqKbService: FaqKbService) {}

  patchWelcomeMessages(input: { chatbot: any; staticText: string; dynamicPrompt: string }): any {
    const chatbot = input?.chatbot;
    const botId = chatbot?._id ?? chatbot?.id;
    if (!botId) {
      throw new Error('chatbot id is required');
    }
    // Patch the provided chatbot payload.
    // Caller should provide a "full" chatbot shape (export JSON).
    const patched = JSON.parse(JSON.stringify(chatbot ?? {}));
    patched.intents = Array.isArray(patched.intents) ? patched.intents : [];
    this.patchWelcomeStaticOnBot(patched, input.staticText ?? '');
    this.patchGenWelcomeOnBot(patched, input.dynamicPrompt ?? '');
    return patched;
  }

  updateChatbot(chatbot: any): Observable<any> {
    const botId = chatbot?._id ?? chatbot?.id ?? chatbot?.id_faq_kb;
    if (!botId) {
      throw new Error('chatbot id is required');
    }

    const opsPayload = this.buildOpsUpdatePayload(chatbot);
    return this.faqKbService.opsUpdateChatbot(opsPayload);
  }

  private buildOpsUpdatePayload(chatbot: any): { id_faq_kb: string; operations: Array<{ type: 'put'; intent: any }> } {
    const id_faq_kb: string | undefined = chatbot?.id_faq_kb ?? chatbot?._id ?? chatbot?.id;
    if (!id_faq_kb) {
      throw new Error('id_faq_kb is required');
    }

    const intents: any[] = Array.isArray(chatbot?.intents) ? chatbot.intents : [];
    const wanted = new Set<string>([KB_CHATBOT_INTENTS.WELCOME_STATIC, KB_CHATBOT_INTENTS.GEN_WELCOME, 'start']);

    const operations = intents
      .filter((i) => wanted.has(String(i?.intent_display_name ?? '').trim().toLowerCase()))
      .map((intent) => ({
        type: 'put' as const,
        intent: intent?.id_faq_kb ? intent : { ...(intent ?? {}), id_faq_kb },
      }));

    return { id_faq_kb, operations };
  }

  private patchWelcomeStaticOnBot(bot: any, messageText: string): void {
    const intents: any[] = Array.isArray(bot?.intents) ? bot.intents : [];
    const idx = intents.findIndex(
      (i: any) => String(i?.intent_display_name ?? '').trim().toLowerCase() === KB_CHATBOT_INTENTS.WELCOME_STATIC,
    );
    if (idx === -1) return;

    const intent = { ...(intents[idx] ?? {}) };
    const actions = Array.isArray(intent.actions) ? [...intent.actions] : [];
    const firstAction = { ...(actions[0] ?? {}) };

    // Some bots store the welcome text directly on the first action.
    const directMessage = { ...(firstAction.message ?? {}) };
    if (typeof directMessage === 'object') {
      directMessage.text = messageText;
      firstAction.message = directMessage;
    }

    const attributes = { ...(firstAction.attributes ?? {}) };
    const commands = Array.isArray(attributes.commands) ? [...attributes.commands] : [];
    // Primary path used in KB2: actions[0].attributes.commands[1].message.text
    if (commands.length > 1) {
      const cmd1 = { ...(commands[1] ?? {}) };
      const message = { ...(cmd1.message ?? {}) };
      message.text = messageText;
      cmd1.message = message;
      commands[1] = cmd1;
    }
    // Best-effort: also update any command that has a message.text field.
    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      if (cmd?.message && typeof cmd.message === 'object') {
        commands[i] = { ...cmd, message: { ...cmd.message, text: messageText } };
      }
    }
    attributes.commands = commands;
    firstAction.attributes = attributes;
    actions[0] = firstAction;
    intent.actions = actions;
    intents[idx] = intent;
    bot.intents = intents;
  }

  private patchGenWelcomeOnBot(bot: any, promptText: string): void {
    const intents: any[] = Array.isArray(bot?.intents) ? bot.intents : [];
    const idx = intents.findIndex(
      (i: any) => String(i?.intent_display_name ?? '').trim().toLowerCase() === KB_CHATBOT_INTENTS.GEN_WELCOME,
    );
    if (idx === -1) return;

    const intent = { ...(intents[idx] ?? {}) };
    const actions = Array.isArray(intent.actions) ? [...intent.actions] : [];
    const firstAction = { ...(actions[0] ?? {}) };

    // Support multiple shapes observed across templates/exports.
    // 1) question as string or { text }
    if (firstAction?.question && typeof firstAction.question === 'object') {
      firstAction.question = { ...firstAction.question, text: promptText };
    } else {
      firstAction.question = promptText;
    }

    // 2) Some exports keep the prompt inside attributes.commands[1].message.text
    const attributes = { ...(firstAction.attributes ?? {}) };
    if (Array.isArray(attributes.commands)) {
      const commands = [...attributes.commands];
      if (commands.length > 1) {
        const cmd1 = { ...(commands[1] ?? {}) };
        const message = { ...(cmd1.message ?? {}) };
        message.text = promptText;
        cmd1.message = message;
        commands[1] = cmd1;
      }
      // Best-effort: update any command that has a message.text field.
      for (let i = 0; i < commands.length; i++) {
        const cmd = commands[i];
        if (cmd?.message && typeof cmd.message === 'object') {
          commands[i] = { ...cmd, message: { ...cmd.message, text: promptText } };
        }
      }
      attributes.commands = commands;
      firstAction.attributes = attributes;
    }

    actions[0] = firstAction;
    intent.actions = actions;
    intents[idx] = intent;
    bot.intents = intents;
  }
}

