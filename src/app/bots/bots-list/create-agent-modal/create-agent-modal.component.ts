import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MAX_PROMPT_LENGTH } from 'app/utils/agent-from-prompt.util';

/** What the caller hands to the modal. */
export interface CreateAgentModalData {
  /** Which kind of agent is being created. Carried through to the result untouched. */
  subtype: string;
  /** Whether to ask for a description as well as a name. */
  showPromptField?: boolean;
}

/** What the modal hands back, or `undefined` when it was dismissed. */
export interface CreateAgentModalResult {
  chatbotName: string;
  subType: string;
  /** The description of the agent to build, empty when none was written. */
  prompt: string;
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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CreateAgentModalData,
    public dialogRef: MatDialogRef<CreateAgentModalComponent>
  ) {
    if (data) {
      this.subtype = data.subtype || 'chatbot';
      this.showPromptField = data.showPromptField === true;
    }
  }

  /** The same threshold the previous modal used, so the gesture does not change under the user. */
  get canCreate(): boolean {
    return (this.agentName || '').trim().length >= 2;
  }

  onCreate(): void {
    if (!this.canCreate) { return; }
    this.dialogRef.close({
      chatbotName: this.agentName.trim(),
      subType: this.subtype,
      prompt: (this.agentPrompt || '').trim()
    } as CreateAgentModalResult);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
