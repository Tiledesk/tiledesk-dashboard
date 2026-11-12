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
  /**
   * Home: Start needs a non-empty prompt.
   * Create-agent modal: Start stays clickable (blank conversational still allowed).
   */
  @Input() requirePromptToStart = true;

  @Output() start = new EventEmitter<string>();

  @ViewChild('vibeCoderTextarea') vibeCoderTextarea?: ElementRef<HTMLTextAreaElement>;

  buildPrompt = '';

  /** How many example chips to show per page. */
  private readonly examplesPageSize = 3;
  examplesPageIndex = 0;

  /** Example chips — labels and prompts stay in English. */
  readonly examplePrompts: VibeCoderExamplePrompt[] = [
    {
      label: 'Customer care with human backup',
      prompt: 'Create an agent that answers common customer questions using my website. If it can\'t find an answer, transfer the conversation to a human operator.',
    },
    {
      label: 'Document Validation',
      prompt: 'Create an agent that reviews uploaded PDF documents and checks whether their information is correct and consistent. Give me a report with the document type, key information, and any missing details or errors.',
    },
    {
      label: 'Invoice Processing',
      prompt: 'Create an agent that reads uploaded invoices and extracts the supplier name, invoice number, dates, amounts, taxes, and payment details. Create a table called "Invoices" and automatically save the extracted information in it. If any information is missing or inconsistent, let me know.',
    },
    {
      label: 'Contract Analysis',
      prompt: 'Create an agent that reviews uploaded contracts and gives me a clear summary of the key terms and deadlines. Highlight potential risks, missing information, incorrect calculations, and contradictions between different sections of the contract.',
    },
    {
      label: 'Lead Collection',
      prompt: 'Create a friendly AI sales assistant that welcomes website visitors and naturally collects their name, email, and business needs. It should handle unexpected replies, remember information already shared, and ask follow-up questions without repeating itself. Once the visitor confirms their details, create a table called "Leads" and save the collected information in it.',
    },
  ];

  get visibleExamplePrompts(): VibeCoderExamplePrompt[] {
    const start = this.examplesPageIndex * this.examplesPageSize;
    return this.examplePrompts.slice(start, start + this.examplesPageSize);
  }

  get hasMoreExamplePages(): boolean {
    return this.examplePrompts.length > this.examplesPageSize;
  }

  get hasTypedContent(): boolean {
    return (this.buildPrompt || '').length > 0;
  }

  get hasPrompt(): boolean {
    return !!(this.buildPrompt || '').trim();
  }

  /** Home: non-empty prompt. Modal: Start stays enabled even with an empty prompt. */
  get canStart(): boolean {
    return !this.busy && (!this.requirePromptToStart || this.hasPrompt);
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

  /** Cycle example chip pages (3, then remaining 2, then back). */
  refreshExamplePrompts(): void {
    const pageCount = Math.max(1, Math.ceil(this.examplePrompts.length / this.examplesPageSize));
    this.examplesPageIndex = (this.examplesPageIndex + 1) % pageCount;
  }

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
