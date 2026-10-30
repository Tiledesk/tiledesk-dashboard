import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { NotifyService } from 'app/core/notify.service';
import { BrandService } from 'app/services/brand.service';
import { UploadImageNativeService } from 'app/services/upload-image-native.service';
import { AgentPromptAttachment, MAX_PROMPT_LENGTH } from 'app/utils/agent-from-prompt.util';
import { formatBytesWithDecimal } from 'app/utils/util';
import {
  isVibeCoderImageMime,
  isVibeCoderMimeAllowed,
  resolveVibeCoderMimeType,
  vibeCoderFileTypeLabel,
  VIBE_CODER_FILE_ACCEPT,
  VIBE_CODER_MAX_ATTACHMENTS,
  VIBE_CODER_MAX_FILE_BYTES,
  VIBE_CODER_UPLOAD_RETENTION_SEC,
} from 'app/utils/vibe-coder-attachments.util';
import { TranslateService } from '@ngx-translate/core';

export interface VibeCoderExamplePrompt {
  /** Chip label (English). */
  label: string;
  /** Full prompt for the textarea — always English (sent to the AI). */
  prompt: string;
}

export interface VibeCoderAttachmentChip {
  id: string;
  name: string;
  type: string;
  size: number;
  /** Local file; uploaded only when Start is pressed. */
  file?: File;
  url?: string;
  previewUrl?: string;
  uploading: boolean;
  error: boolean;
}

export interface VibeCoderStartPayload {
  prompt: string;
  attachments: AgentPromptAttachment[];
}

@Component({
  selector: 'appdashboard-vibe-coder',
  templateUrl: './vibe-coder.component.html',
  styleUrls: ['./vibe-coder.component.scss']
})
export class VibeCoderComponent implements OnDestroy {
  /** Optional override; default comes from `VibeCoderPlaceholder` i18n. */
  @Input() placeholder: string | null = null;
  @Input() busy = false;
  @Input() error: string | null = null;
  @Input() maxLength = MAX_PROMPT_LENGTH;

  @Output() start = new EventEmitter<VibeCoderStartPayload>();

  @ViewChild('vibeCoderTextarea') vibeCoderTextarea?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('vibeCoderFileInput') vibeCoderFileInput?: ElementRef<HTMLInputElement>;

  buildPrompt = '';
  attachments: VibeCoderAttachmentChip[] = [];

  readonly fileAccept = VIBE_CODER_FILE_ACCEPT;
  readonly maxAttachments = VIBE_CODER_MAX_ATTACHMENTS;
  readonly maxFileMb = VIBE_CODER_MAX_FILE_BYTES / (1024 * 1024);
  /** i18n params for white-label company name in `VibeCoderPlaceholder`. */
  brandParams: { BRAND_NAME: string } = { BRAND_NAME: 'Tiledesk' };

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

  private chipSeq = 0;

  constructor(
    private uploadImageNativeService: UploadImageNativeService,
    private notify: NotifyService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private brandService: BrandService,
  ) {
    const brand = this.brandService.getBrand();
    this.brandParams = { BRAND_NAME: brand?.['BRAND_NAME'] || 'Tiledesk' };
  }

  ngOnDestroy(): void {
    this.attachments.forEach((a) => this.revokePreview(a));
  }

  get hasTypedContent(): boolean {
    return (this.buildPrompt || '').length > 0;
  }

  get hasPrompt(): boolean {
    return !!(this.buildPrompt || '').trim();
  }

  get isUploadingAttachments(): boolean {
    return this.attachments.some((a) => a.uploading);
  }

  get canAttachMore(): boolean {
    return !this.busy && !this.isUploadingAttachments && this.attachments.length < this.maxAttachments;
  }

  /** Create needs a non-empty prompt (Home opens conversational agent only). */
  get canStart(): boolean {
    return !this.busy && this.hasPrompt && !this.isUploadingAttachments;
  }

  onTextareaInput(textarea: HTMLTextAreaElement): void {
    this.resizeTextarea(textarea);
  }

  applyExamplePrompt(example: VibeCoderExamplePrompt): void {
    if (this.busy || this.isUploadingAttachments) {
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

  openFilePicker(): void {
    if (!this.canAttachMore) {
      if (this.attachments.length >= this.maxAttachments) {
        this.notify.showWidgetStyleUpdateNotification(
          this.translate.instant('VibeCoderMaxFilesReached', { max: this.maxAttachments }),
          3,
          'report_problem',
        );
      }
      return;
    }
    this.vibeCoderFileInput?.nativeElement?.click();
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input?.files ? Array.from(input.files) : [];
    input.value = '';
    if (!files.length || this.busy || this.isUploadingAttachments) {
      return;
    }

    let remaining = this.maxAttachments - this.attachments.length;
    if (remaining <= 0) {
      this.notify.showWidgetStyleUpdateNotification(
        this.translate.instant('VibeCoderMaxFilesReached', { max: this.maxAttachments }),
        3,
        'report_problem',
      );
      return;
    }

    for (const file of files) {
      if (remaining <= 0) {
        this.notify.showWidgetStyleUpdateNotification(
          this.translate.instant('VibeCoderMaxFilesReached', { max: this.maxAttachments }),
          3,
          'report_problem',
        );
        break;
      }
      if (!this.tryQueueFile(file)) {
        continue;
      }
      remaining -= 1;
    }
  }

  removeAttachment(id: string): void {
    if (this.busy || this.isUploadingAttachments) {
      return;
    }
    const idx = this.attachments.findIndex((a) => a.id === id);
    if (idx < 0) {
      return;
    }
    this.revokePreview(this.attachments[idx]);
    this.attachments = this.attachments.filter((a) => a.id !== id);
    this.cdr.detectChanges();
  }

  typeLabel(chip: VibeCoderAttachmentChip): string {
    return vibeCoderFileTypeLabel(chip.type, chip.name);
  }

  sizeLabel(chip: VibeCoderAttachmentChip): string {
    return formatBytesWithDecimal(chip.size, 1);
  }

  isImageChip(chip: VibeCoderAttachmentChip): boolean {
    return isVibeCoderImageMime(chip.type);
  }

  trackAttachment(_index: number, chip: VibeCoderAttachmentChip): string {
    return chip.id;
  }

  typeMaterialIcon(chip: VibeCoderAttachmentChip): string {
    const type = (chip?.type || '').toLowerCase();
    if (type === 'application/pdf') return 'picture_as_pdf';
    if (type === 'text/csv') return 'table_chart';
    if (type === 'text/markdown' || type === 'text/plain') return 'description';
    if (isVibeCoderImageMime(type)) return 'image';
    return 'insert_drive_file';
  }

  truncatedName(name: string): string {
    const n = name || '';
    if (n.length <= 22) {
      return n;
    }
    const dot = n.lastIndexOf('.');
    if (dot > 0 && n.length - dot <= 8) {
      const ext = n.slice(dot);
      return n.slice(0, 18 - ext.length) + '…' + ext;
    }
    return n.slice(0, 19) + '…';
  }

  onStart(): void {
    if (!this.canStart) {
      return;
    }
    const prompt = (this.buildPrompt || '').trim().slice(0, this.maxLength);
    const pending = this.attachments.filter((a) => a.file && !a.url);
    if (!pending.length) {
      this.emitStart(prompt);
      return;
    }

    pending.forEach((chip) => this.patchChip(chip.id, { uploading: true, error: false }));

    Promise.all(pending.map((chip) => this.uploadChip(chip)))
      .then(() => {
        const failed = this.attachments.some((a) => a.error || (a.file && !a.url));
        if (failed) {
          this.notify.showWidgetStyleUpdateNotification(
            this.translate.instant('VibeCoderUploadFailed'),
            4,
            'report_problem',
          );
          return;
        }
        this.emitStart(prompt);
      })
      .catch(() => {
        this.notify.showWidgetStyleUpdateNotification(
          this.translate.instant('VibeCoderUploadFailed'),
          4,
          'report_problem',
        );
      });
  }

  /** Queue locally only — upload happens on Start. */
  private tryQueueFile(file: File): boolean {
    const mime = resolveVibeCoderMimeType(file);
    if (!isVibeCoderMimeAllowed(mime)) {
      this.notify.presenModalAttachmentFileTypeNotSupported();
      return false;
    }
    if (file.size > VIBE_CODER_MAX_FILE_BYTES) {
      this.notify.presentModalAttachmentFileSizeTooLarge(this.maxFileMb + ' MB');
      return false;
    }

    const chip: VibeCoderAttachmentChip = {
      id: 'vc-att-' + (++this.chipSeq) + '-' + Date.now(),
      name: file.name,
      type: mime,
      size: file.size,
      file,
      uploading: false,
      error: false,
      previewUrl: isVibeCoderImageMime(mime) ? URL.createObjectURL(file) : undefined,
    };
    this.attachments = [...this.attachments, chip];
    this.cdr.detectChanges();
    return true;
  }

  private uploadChip(chip: VibeCoderAttachmentChip): Promise<void> {
    if (!chip.file) {
      this.patchChip(chip.id, { uploading: false, error: true });
      return Promise.resolve();
    }
    return this.uploadImageNativeService.uploadAssetFile(chip.file, VIBE_CODER_UPLOAD_RETENTION_SEC)
      .then((downloadURL: string) => {
        this.patchChip(chip.id, {
          url: downloadURL,
          uploading: false,
          error: false,
          file: undefined,
        });
      })
      .catch(() => {
        this.patchChip(chip.id, { uploading: false, error: true });
      });
  }

  private emitStart(prompt: string): void {
    const attachments: AgentPromptAttachment[] = this.attachments
      .filter((a) => a.url && !a.error)
      .map((a) => ({
        name: a.name,
        type: a.type,
        size: a.size,
        url: a.url,
      }));
    this.start.emit({ prompt, attachments });
  }

  private patchChip(id: string, patch: Partial<VibeCoderAttachmentChip>): void {
    this.attachments = this.attachments.map((a) =>
      a.id === id ? { ...a, ...patch } : a
    );
    this.cdr.detectChanges();
  }

  private revokePreview(chip: VibeCoderAttachmentChip): void {
    if (chip?.previewUrl) {
      try {
        URL.revokeObjectURL(chip.previewUrl);
      } catch (_) { /* ignore */ }
    }
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
