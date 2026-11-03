import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MAX_PROMPT_LENGTH } from 'app/utils/agent-from-prompt.util';

export interface VibeCoderExamplePrompt {
  /** Chip label (English). */
  label: string;
  /** Full prompt for the textarea — always English (sent to the AI). */
  prompt: string;
}

@Component({
  selector: 'appdashboard-vibe-coder',
  templateUrl: './vibe-coder.component.html',
  styleUrls: ['./vibe-coder.component.scss']
})
export class VibeCoderComponent {
  /** Optional override; default comes from `VibeCoderPlaceholder` i18n. */
  @Input() placeholder: string | null = null;
  @Input() busy = false;
  @Input() error: string | null = null;
  @Input() maxLength = MAX_PROMPT_LENGTH;

  @Output() start = new EventEmitter<string>();

  @ViewChild('vibeCoderTextarea') vibeCoderTextarea?: ElementRef<HTMLTextAreaElement>;

  buildPrompt = '';

  /** Example chips — labels and prompts stay in English. */
  readonly examplePrompts: VibeCoderExamplePrompt[] = [
    {
      label: 'Customer care AI Assistant with human backup',
      prompt: 'Create an agent that answers common customer questions using my website. If it can\'t find an answer, transfer the conversation to a human operator.',
    },
    {
      label: 'AI Agent for Document Validation',
      prompt: 'Create an agent that reviews uploaded PDF documents and checks whether their information is correct and consistent. Give me a report with the document type, key information, and any missing details or errors.',
    },
  ];

  get hasTypedContent(): boolean {
    return (this.buildPrompt || '').length > 0;
  }

  get hasPrompt(): boolean {
    return !!(this.buildPrompt || '').trim();
  }

  /** Create needs a non-empty prompt (Home opens conversational agent only). */
  get canStart(): boolean {
    return !this.busy && this.hasPrompt;
  }

  onTextareaInput(textarea: HTMLTextAreaElement): void {
    this.resizeTextarea(textarea);
  }

  applyExamplePrompt(example: VibeCoderExamplePrompt): void {
    if (this.busy) {
      return;
    }
    this.setPrompt(example.prompt, false);
  }

  /** Prefill textarea (e.g. from onboarding / website prompt). */
  setPrompt(prompt: string, focus = false): void {
    this.buildPrompt = String(prompt || '').slice(0, this.maxLength);
    setTimeout(() => {
      const el = this.vibeCoderTextarea?.nativeElement;
      if (!el) {
        return;
      }
      this.resizeTextarea(el);
      if (focus) {
        el.focus();
      }
    }, 0);
  }

  /** Focus the prompt textarea (e.g. after onboarding Get started → Home). */
  focusInput(): void {
    setTimeout(() => {
      this.vibeCoderTextarea?.nativeElement?.focus();
    }, 0);
  }

  // Reserved for when there are more than 3 examples (cycle chip pages).
  // refreshExamplePrompts(): void {}

  onStart(): void {
    if (!this.canStart) {
      return;
    }
    const prompt = (this.buildPrompt || '').trim().slice(0, this.maxLength);
    this.start.emit(prompt);
  }

  private resizeTextarea(textarea: HTMLTextAreaElement): void {
    const minHeight = 54; // 3 lines @ 18px line-height
    const maxHeight = 108; // 6 lines @ 18px line-height

    textarea.style.height = minHeight + 'px';
    const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
    textarea.style.height = newHeight + 'px';
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }
}
