import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MAX_PROMPT_LENGTH } from 'app/utils/agent-from-prompt.util';

@Component({
  selector: 'appdashboard-vibe-coder',
  templateUrl: './vibe-coder.component.html',
  styleUrls: ['./vibe-coder.component.scss']
})
export class VibeCoderComponent {
  @Input() placeholder = 'Create a flow that ...';
  @Input() busy = false;
  @Input() error: string | null = null;
  @Input() maxLength = MAX_PROMPT_LENGTH;

  @Output() start = new EventEmitter<string>();

  buildPrompt = '';

  get hasTypedContent(): boolean {
    return (this.buildPrompt || '').length > 0;
  }

  get hasPrompt(): boolean {
    return !!(this.buildPrompt || '').trim();
  }

  get canStart(): boolean {
    return this.hasPrompt && !this.busy;
  }

  onTextareaInput(textarea: HTMLTextAreaElement): void {
    const minHeight = 18;
    const maxHeight = 108; // 6 lines @ 18px line-height

    textarea.style.height = minHeight + 'px';
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = newHeight + 'px';
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }

  onStart(): void {
    if (!this.canStart) {
      return;
    }
    const prompt = (this.buildPrompt || '').trim().slice(0, this.maxLength);
    if (!prompt) {
      return;
    }
    this.start.emit(prompt);
  }
}
