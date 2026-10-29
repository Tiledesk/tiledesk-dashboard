import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { MAX_PROMPT_LENGTH, provisionalAgentName } from 'app/utils/agent-from-prompt.util';

/** What the caller hands to the modal. */
export interface CreateAgentModalData {
  /** Which kind of agent is being created. Carried through to the result untouched. */
  subtype: string;
  /** Whether to ask for a description as well as a name. */
  showPromptField?: boolean;
  /**
   * Home vibe box prompt (may be empty). When `requirePromptForConversational` is set,
   * Conversational Create stays disabled until this is non-empty.
   */
  homeBuildPrompt?: string;
  /**
   * Home path: Conversational needs a prompt from the vibe box (CDS handoff).
   * Voice / Copilot ignore this — they hand off to CreateChatbotModal.
   */
  requirePromptForConversational?: boolean;
  /**
   * Kept for callers; Voice (`voice_twilio`) is always in the select.
   * Creation gate for Twilio lives on `CreateChatbotModal` via customization.
   */
  displayTwilioVoiceAgent?: boolean;
  /** When true, also show Voice (VXML) (`customization.voice`). */
  displayVXMLVoiceAgent?: boolean;
}

/** What the modal hands back, or `undefined` when it was dismissed. */
export interface CreateAgentModalResult {
  chatbotName?: string;
  subType: string;
  /** The description of the agent to build, empty when none was written. */
  prompt?: string;
  /** True when no name was typed and `chatbotName` was made from the description: the Design
   *  Studio renames the agent after its conversation's title (29/10/2026). */
  provisionalName?: boolean;
  /** Parent should open `CreateChatbotModal` for voice / copilot subtypes. */
  openCreateChatbotModal?: boolean;
}

export interface AgentTypeOption {
  value: string;
  label: string;
}

/**
 * Creates an AI Agent: its name, and optionally a description of what it should do.
 *
 * This is the replacement for `CreateChatbotModalComponent`, which grew around a copilot's
 * knowledge base and a plan's upgrade notice and is now four modals wearing one coat. It is
 * wired in on the «New AI Agent» → «AI Agent» path first; the other places that create
 * something -- templates, voice agents, webhooks -- keep the old one until each is moved over
 * deliberately. Two modals side by side for a while is the price of moving them one at a time
 * instead of changing every creation path at once.
 */
@Component({
  selector: 'appdashboard-create-agent-modal',
  templateUrl: './create-agent-modal.component.html',
  styleUrls: ['./create-agent-modal.component.scss']
})
export class CreateAgentModalComponent {

  public readonly maxPromptLength = MAX_PROMPT_LENGTH;

  public agentName: string = '';
  public agentPrompt: string = '';
  public subtype: string = 'chatbot';
  /** Only the caller knows: creating from a template starts from a flow that is already
   *  written, and a description there would describe something nobody is going to build. */
  public showPromptField: boolean = false;
  /** Home: block Conversational Create until the vibe-box prompt is non-empty. */
  public requirePromptForConversational = false;
  public homeBuildPrompt = '';

  /** Always shown: Conversational + Voice (+ Voice VXML when customization.voice). */
  public showAgentTypeSelect = true;
  public agentTypeOptions: AgentTypeOption[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CreateAgentModalData,
    public dialogRef: MatDialogRef<CreateAgentModalComponent>,
    private translate: TranslateService,
  ) {
    if (data) {
      this.subtype = data.subtype || 'chatbot';
      this.showPromptField = data.showPromptField === true;
      this.requirePromptForConversational = data.requirePromptForConversational === true;
      this.homeBuildPrompt = (data.homeBuildPrompt || '').trim();
      this.buildAgentTypeOptions(!!data.displayVXMLVoiceAgent);
    } else {
      this.buildAgentTypeOptions(false);
    }
  }

  /** Prompt already collected on Home (or typed in this modal when `showPromptField`). */
  get hasBuildPrompt(): boolean {
    if (this.homeBuildPrompt) {
      return true;
    }
    return !!(this.agentPrompt || '').trim();
  }

  /** Inline hint when Conversational Create is blocked for a missing Home prompt. */
  get showConversationalPromptRequired(): boolean {
    return this.requirePromptForConversational
      && this.subtype === 'chatbot'
      && !this.hasBuildPrompt;
  }

  private buildAgentTypeOptions(showVxml: boolean): void {
    this.showAgentTypeSelect = true;
    this.agentTypeOptions = [
      { value: 'chatbot', label: this.translate.instant('AgentTypeConversational') },
      // Always present; Twilio enablement is gated on create-chatbot-modal.
      { value: 'voice_twilio', label: this.translate.instant('AgentTypeVoice') },
    ];
    if (showVxml) {
      this.agentTypeOptions.push({
        value: 'voice',
        label: this.translate.instant('AgentTypeVoiceVxml'),
      });
    }
    // Brand name — keep "Copilot" untranslated in every locale.
    this.agentTypeOptions.push({ value: 'copilot', label: 'Copilot' });

    const values = this.agentTypeOptions.map((o) => o.value);
    if (!values.includes(this.subtype)) {
      this.subtype = 'chatbot';
    }
  }

  private shouldOpenCreateChatbotModal(value: string): boolean {
    return value === 'voice' || value === 'voice_twilio' || value === 'copilot';
  }

  /** Voice / Copilot hand off to `CreateChatbotModal` (desc + optional gate). */
  onAgentTypeChange(value: string): void {
    this.subtype = value;
    if (this.shouldOpenCreateChatbotModal(value)) {
      this.dialogRef.close({
        openCreateChatbotModal: true,
        subType: value,
      } as CreateAgentModalResult);
    }
  }

  /** A Conversational agent with a description needs no name: it gets one from the description
   *  until the Design Studio names it after its conversation's title (29/10/2026). */
  get nameIsOptional(): boolean {
    return this.showPromptField && this.subtype === 'chatbot' && !!(this.agentPrompt || '').trim();
  }

  /** Name threshold as before; Home Conversational also needs a vibe-box prompt. */
  get canCreate(): boolean {
    const nameOk = (this.agentName || '').trim().length >= 2 || this.nameIsOptional;
    if (!nameOk) {
      return false;
    }
    if (this.requirePromptForConversational && this.subtype === 'chatbot') {
      return this.hasBuildPrompt;
    }
    return true;
  }

  onCreate(): void {
    if (!this.canCreate) { return; }
    if (this.shouldOpenCreateChatbotModal(this.subtype)) {
      this.dialogRef.close({
        openCreateChatbotModal: true,
        subType: this.subtype,
      } as CreateAgentModalResult);
      return;
    }
    const prompt = (this.agentPrompt || '').trim() || this.homeBuildPrompt;
    const typed = (this.agentName || '').trim();
    const provisional = typed.length < 2 && this.nameIsOptional;
    this.dialogRef.close({
      chatbotName: provisional ? provisionalAgentName(prompt) : typed,
      subType: this.subtype,
      prompt: prompt,
      ...(provisional ? { provisionalName: true } : {})
    } as CreateAgentModalResult);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
