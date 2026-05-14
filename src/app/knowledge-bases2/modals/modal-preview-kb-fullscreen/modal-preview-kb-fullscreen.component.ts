import { Component, Inject, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, HostListener } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
registerLocaleData(localeIt);
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from 'app/services/logger/logger.service';
import { OpenaiService } from 'app/services/openai.service';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { AppConfigService } from 'app/services/app-config.service';
import { LocalDbService } from 'app/services/users-local-db.service';
import {
  loadTokenMultiplier,
  URL_AI_model_doc,
  URL_max_tokens_doc,
  URL_temperature_doc,
  URL_chunk_Limit_doc,
  URL_system_context_doc,
  URL_advanced_context_doc,
  URL_contents_sources_doc,
} from 'app/utils/util';

type Tab = 'ai' | 'sys' | 'srcs';

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  chunks?: string[];
  source?: string;
  source_url?: string;
  ai_model?: string;
  error?: boolean;
  busy?: boolean;
  startedAt?: number;
  durationSec?: number;
  promptTokens?: number;
}

@Component({
  selector: 'modal-preview-kb-fullscreen',
  templateUrl: './modal-preview-kb-fullscreen.component.html',
  styleUrls: ['./modal-preview-kb-fullscreen.component.scss'],
})
export class ModalPreviewKbFullscreenComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('streamEl') streamEl: ElementRef<HTMLDivElement>;
  @ViewChild('inputEl') inputEl: ElementRef<HTMLTextAreaElement>;

  private destroy$ = new Subject<void>();

  tab: Tab = 'ai';
  selectedNamespace: any;
  namespaceId: string;

  // settings (mirror preview_settings)
  selectedModel: string;
  maxTokens: number;
  temperature: number;
  topK: number;
  alpha: number;
  context: string;
  advancedPrompt = false;
  citations = true;
  chunkOnly = false;
  reRanking = false;
  reRankingMultipler: number;
  llm: string;

  // UI state
  messages: ChatMessage[] = [];
  composerText = '';
  busy = false;
  hasStreamScroll = false;

  // Tag filter (sopra il composer) e streaming (tab Sistema)
  tags: string[] = [];
  tagInput = '';
  streaming = true;

  // Save settings UX state
  saveStatus: 'idle' | 'saving' | 'success' | 'error' = 'idle';
  private saveStatusResetTimer: any;

  // models list (built from app config)
  modelsList: { name: string; value: string }[] = [];

  // KB picker / sources
  namespaces: any[] = [];
  showKbPicker = false;
  sourcesByType: { type: string; labelKey: string; icon: string; count: number; items: { name: string; url?: string }[]; expanded: boolean }[] = [];
  sourcesTotal = 0;
  sourcesLoading = false;

  get numberLocale(): string {
    const lang = (this.translate.currentLang || this.translate.defaultLang || 'en').toLowerCase();
    return lang.startsWith('it') ? 'it' : 'en';
  }

  // info popover content — `text` is an i18n key resolved via the translate pipe in the template
  infos = {
    model:      { text: 'KbPage.Preview2.InfoModel',       url: URL_AI_model_doc },
    tokens:     { text: 'KbPage.Preview2.InfoTokens',      url: URL_max_tokens_doc },
    temperature:{ text: 'KbPage.Preview2.InfoTemperature', url: URL_temperature_doc },
    chunks:     { text: 'KbPage.Preview2.InfoChunks',      url: URL_chunk_Limit_doc },
    system:     { text: 'KbPage.Preview2.InfoSystem',      url: URL_system_context_doc },
    advCtx:     { text: 'KbPage.Preview2.InfoAdvCtx',      url: URL_advanced_context_doc },
    sources:    { text: 'KbPage.Preview2.InfoSources',     url: URL_contents_sources_doc },
    chunksOnly: { text: 'KbPage.Preview2.InfoChunksOnly',  url: URL_chunk_Limit_doc },
    streaming:  { text: 'KbPage.Preview2.InfoStreaming',   url: URL_system_context_doc },
    chatTags:   { text: 'KbPage.Preview2.InfoChatTags',    url: URL_contents_sources_doc },
  };

  // Translation keys; resolved via the translate pipe in the template.
  suggestions = [
    'KbPage.Preview2.Suggest1',
    'KbPage.Preview2.Suggest2',
    'KbPage.Preview2.Suggest3',
    'KbPage.Preview2.Suggest4',
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalPreviewKbFullscreenComponent>,
    private logger: LoggerService,
    private translate: TranslateService,
    private openaiService: OpenaiService,
    private kbService: KnowledgeBaseService,
    private appConfigService: AppConfigService,
    private localDbService: LocalDbService,
    private router: Router,
  ) {
    this.namespaces = Array.isArray(data?.namespaces) ? data.namespaces : [];
    if (data && data.selectedNamespace) {
      this.selectedNamespace = data.selectedNamespace;
      this.namespaceId = this.selectedNamespace.id;
      const s = this.selectedNamespace.preview_settings || {};
      this.selectedModel = s.model;
      this.maxTokens = s.max_tokens ?? 4096;
      this.temperature = s.temperature ?? 0.7;
      this.topK = s.top_k ?? 4;
      this.alpha = s.alpha ?? 0.5;
      this.context = s.context ?? 'You are an awesome assistant';
      this.advancedPrompt = !!s.advancedPrompt;
      this.citations = s.citations !== false;
      this.chunkOnly = !!s.chunks_only;
      this.reRanking = !!s.reranking;
      this.reRankingMultipler = s.reranking_multiplier;
      this.llm = s.llm;
    }
    this.buildModelsList();
  }

  ngOnInit(): void {
    // restore last question if present
    const stored = this.localDbService.getFromStorage(`last_question-${this.namespaceId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (typeof parsed === 'string') this.composerText = parsed;
      } catch { /* ignore */ }
    }

    // Close the modal as soon as the user navigates to another page
    this.router.events
      .pipe(filter(e => e instanceof NavigationStart), takeUntil(this.destroy$))
      .subscribe(() => this.dialogRef.close());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewChecked(): void {
    if (this.hasStreamScroll && this.streamEl) {
      this.streamEl.nativeElement.scrollTop = this.streamEl.nativeElement.scrollHeight;
      this.hasStreamScroll = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEsc() { this.close(); }

  private buildModelsList() {
    try {
      const cfg = this.appConfigService.getConfig();
      const raw = cfg?.aiModels as string;
      if (raw) {
        const parsed = loadTokenMultiplier(raw) as Record<string, number>;
        this.modelsList = Object.keys(parsed || {}).map((key) => ({ name: key, value: key }));
      }
    } catch (e) {
      this.logger.log('[PREVIEW-KB-FS] buildModelsList error', e);
    }
    if (!this.modelsList.length) {
      this.modelsList = [{ name: this.selectedModel || 'gpt-4o-mini', value: this.selectedModel || 'gpt-4o-mini' }];
    }
    this.ensureCurrentModelInList();
  }

  /**
   * If the namespace's stored model is not in the global app-config list,
   * surface it as a list option so the <select> can render its label.
   * Also picks a sensible default when no model is configured.
   */
  private ensureCurrentModelInList() {
    if (!this.selectedModel) {
      this.selectedModel = this.modelsList[0]?.value;
      return;
    }
    if (!this.modelsList.some((m) => m.value === this.selectedModel)) {
      this.modelsList = [{ name: this.selectedModel, value: this.selectedModel }, ...this.modelsList];
    }
  }

  setTab(t: Tab) {
    this.tab = t;
    if (t === 'srcs' && this.sourcesByType.length === 0 && !this.sourcesLoading) {
      this.loadSources();
    }
  }
  pickModel(v: string) { this.selectedModel = v; }

  // ---- KB picker ----
  toggleKbPicker(force?: boolean) {
    this.showKbPicker = force ?? !this.showKbPicker;
  }

  selectNamespace(ns: any) {
    this.showKbPicker = false;
    if (!ns || ns.id === this.namespaceId) return;
    this.selectedNamespace = ns;
    this.namespaceId = ns.id;
    const s = ns.preview_settings || {};
    // Take the new namespace settings (fall back to sane defaults instead of keeping the previous KB's values).
    this.selectedModel = s.model || this.modelsList[0]?.value || 'gpt-4o-mini';
    this.maxTokens = s.max_tokens ?? 4096;
    this.temperature = s.temperature ?? 0.7;
    this.topK = s.top_k ?? 4;
    this.alpha = s.alpha ?? 0.5;
    this.context = s.context ?? 'You are an awesome assistant';
    this.advancedPrompt = !!s.advancedPrompt;
    this.citations = s.citations !== false;
    this.chunkOnly = !!s.chunks_only;
    this.reRanking = !!s.reranking;
    this.reRankingMultipler = s.reranking_multiplier;
    this.llm = s.llm;
    // Make sure the engine <select> can render the namespace's model even if it's not in the global app-config list.
    this.ensureCurrentModelInList();
    // Reset session and reload sources for the new namespace
    this.messages = [];
    this.sourcesByType = [];
    this.sourcesTotal = 0;
    if (this.tab === 'srcs') this.loadSources();
  }

  initialOf(name: string): string {
    return (name || 'K').trim().charAt(0).toUpperCase();
  }

  // ---- Sources summary ----
  private loadSources() {
    if (!this.namespaceId) return;
    this.sourcesLoading = true;
    const params = `?namespace=${this.namespaceId}&limit=1000&page=0`;
    this.kbService.getListOfKb(params).subscribe(
      (res: any) => {
        const items: any[] = Array.isArray(res?.kbs) ? res.kbs : (Array.isArray(res) ? res : []);
        this.sourcesTotal = typeof res?.count === 'number' ? res.count : items.length;
        this.sourcesByType = this.aggregateByType(items);
        this.sourcesLoading = false;
      },
      (err) => {
        this.logger.log('[PREVIEW-KB-FS] loadSources error', err);
        this.sourcesLoading = false;
      },
    );
  }

  private aggregateByType(items: any[]) {
    const meta: Record<string, { labelKey: string; icon: string; order: number }> = {
      url:    { labelKey: 'KbPage.Preview2.SrcUrl',     icon: 'link', order: 1 },
      urls:   { labelKey: 'KbPage.Preview2.SrcUrl',     icon: 'link', order: 1 },
      sitemap:{ labelKey: 'KbPage.Preview2.SrcSitemap', icon: 'link', order: 2 },
      pdf:    { labelKey: 'KbPage.Preview2.SrcPdf',     icon: 'pdf',  order: 3 },
      docx:   { labelKey: 'KbPage.Preview2.SrcDocx',    icon: 'pdf',  order: 4 },
      doc:    { labelKey: 'KbPage.Preview2.SrcDoc',     icon: 'pdf',  order: 4 },
      txt:    { labelKey: 'KbPage.Preview2.SrcTxt',     icon: 'book', order: 5 },
      text:   { labelKey: 'KbPage.Preview2.SrcTxt',     icon: 'book', order: 5 },
      faq:    { labelKey: 'KbPage.Preview2.SrcFaq',     icon: 'faq',  order: 6 },
      faqs:   { labelKey: 'KbPage.Preview2.SrcFaq',     icon: 'faq',  order: 6 },
      other:  { labelKey: 'KbPage.Preview2.SrcOther',   icon: 'doc',  order: 99 },
    };
    const groups = new Map<string, { type: string; labelKey: string; icon: string; count: number; order: number; items: { name: string; url?: string }[]; expanded: boolean }>();
    for (const it of items) {
      const key = (it?.type || 'other').toLowerCase();
      const m = meta[key] || meta['other'];
      let g = groups.get(m.labelKey);
      if (!g) {
        g = { type: key, labelKey: m.labelKey, icon: m.icon, count: 0, order: m.order, items: [], expanded: false };
        groups.set(m.labelKey, g);
      }
      g.count += 1;
      const displayName = this.deriveItemName(it);
      g.items.push({ name: displayName, url: it?.source || it?.url });
    }
    return Array.from(groups.values()).sort((a, b) => a.order - b.order);
  }

  private deriveItemName(it: any): string {
    if (it?.name && String(it.name).trim()) return String(it.name).trim();
    const src = it?.source || it?.url || it?.content;
    if (src) {
      // For URLs: strip protocol and trailing slash, keep host + path
      const str = String(src);
      if (/^https?:\/\//i.test(str)) {
        try {
          const u = new URL(str);
          const path = u.pathname.replace(/\/$/, '');
          return u.host + (path && path !== '/' ? path : '');
        } catch { /* ignore */ }
      }
      return str.length > 80 ? str.slice(0, 80) + '…' : str;
    }
    return it?._id || this.translate.instant('KbPage.Preview2.UnnamedItem');
  }

  toggleSourceGroup(g: any) {
    g.expanded = !g.expanded;
  }

  onInputKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.send();
    }
  }

  /**
   * Resize the composer textarea to fit its content, up to a maximum of 10 lines.
   * When the content exceeds 10 lines, a vertical scrollbar appears.
   */
  autosizeComposer(el: HTMLTextAreaElement) {
    if (!el) return;
    const style = window.getComputedStyle(el);
    const lineHeight = parseFloat(style.lineHeight) || (parseFloat(style.fontSize) * 1.5);
    const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const borderY = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    const maxHeight = Math.round(lineHeight * 10 + paddingY + borderY);

    el.style.height = 'auto';
    const target = Math.min(el.scrollHeight, maxHeight);
    el.style.height = target + 'px';
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }

  pickSuggestion(s: string) {
    // suggestions are i18n keys; resolve to the localized question before sending
    this.composerText = this.translate.instant(s);
    this.send();
  }

  // ---- Tag filter ----
  addTagFromInput() {
    const t = (this.tagInput || '').trim();
    if (!t) return;
    if (!this.tags.includes(t)) this.tags.push(t);
    this.tagInput = '';
  }
  removeTag(idx: number) {
    this.tags.splice(idx, 1);
  }
  onTagKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      this.addTagFromInput();
    } else if (e.key === 'Backspace' && !this.tagInput && this.tags.length > 0) {
      this.tags.pop();
    }
  }

  resetSession() {
    this.messages = [];
  }

  resetSettings() {
    const s = this.selectedNamespace?.preview_settings || {};
    this.selectedModel = s.model;
    this.maxTokens = s.max_tokens ?? 4096;
    this.temperature = s.temperature ?? 0.7;
    this.topK = s.top_k ?? 4;
    this.context = s.context ?? 'You are an awesome assistant';
    this.advancedPrompt = !!s.advancedPrompt;
    this.citations = s.citations !== false;
    this.chunkOnly = !!s.chunks_only;
  }

  saveSettings() {
    if (this.saveStatus === 'saving') return;
    if (!this.namespaceId) { this.flagSave('error'); return; }

    const previewSettings = {
      ...(this.selectedNamespace.preview_settings || {}),
      model: this.selectedModel,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      top_k: this.topK,
      context: this.context,
      advancedPrompt: this.advancedPrompt,
      citations: this.citations,
      chunks_only: this.chunkOnly,
      reranking: this.reRanking,
      reranking_multiplier: this.reRankingMultipler,
    };
    const body = { preview_settings: previewSettings } as any;

    this.flagSave('saving');
    this.kbService.updateNamespace(body, this.namespaceId).subscribe(
      (res: any) => {
        // Keep the local namespace in sync with the persisted state
        this.selectedNamespace = { ...this.selectedNamespace, preview_settings: previewSettings };
        this.flagSave('success');
      },
      (err: any) => {
        this.logger.log('[PREVIEW-KB-FS] saveSettings error', err);
        this.flagSave('error');
      },
    );
  }

  private flagSave(s: 'idle' | 'saving' | 'success' | 'error') {
    this.saveStatus = s;
    if (this.saveStatusResetTimer) { clearTimeout(this.saveStatusResetTimer); this.saveStatusResetTimer = null; }
    if (s === 'success' || s === 'error') {
      this.saveStatusResetTimer = setTimeout(() => { this.saveStatus = 'idle'; }, 2500);
    }
  }

  send() {
    const text = (this.composerText || '').trim();
    if (!text || this.busy) return;

    this.messages.push({ role: 'user', text });
    this.composerText = '';
    if (this.inputEl?.nativeElement) {
      // reset textarea height after send
      requestAnimationFrame(() => this.autosizeComposer(this.inputEl.nativeElement));
    }
    this.busy = true;
    this.hasStreamScroll = true;

    if (text) {
      this.localDbService.setInStorage(`last_question-${this.namespaceId}`, JSON.stringify(text));
    }

    // include any tag still in the input as a finalized tag
    this.addTagFromInput();

    const body = {
      question: text,
      namespace: this.namespaceId,
      model: this.selectedModel,
      temperature: this.temperature,
      alpha: this.alpha,
      max_tokens: this.maxTokens,
      top_k: this.topK,
      chunks_only: this.chunkOnly,
      reranking: this.reRanking,
      reranking_multiplier: this.reRankingMultipler,
      system_context: this.context,
      advancedPrompt: this.advancedPrompt,
      citations: this.citations,
      llm: this.llm,
      tags: [...this.tags],
    };

    const placeholder: ChatMessage = { role: 'bot', text: '', busy: true, startedAt: performance.now() };
    this.messages.push(placeholder);

    const onError = (err: any) => {
      placeholder.busy = false;
      placeholder.error = true;
      placeholder.text = this.extractError(err);
      this.busy = false;
      this.hasStreamScroll = true;
    };
    const finalizeFromResponse = (response: any) => {
      placeholder.busy = false;
      placeholder.text = response?.answer || placeholder.text || this.translate.instant('KbPage.NoAnswerFound');
      placeholder.chunks = response?.content_chunks || placeholder.chunks || [];
      placeholder.source = response?.source;
      placeholder.ai_model = this.selectedModel;
      if (response?.source && /^(https?|ftp):\/\//.test(response.source)) {
        placeholder.source_url = response.source;
      }
      // Response time: prefer backend value if present, else compute locally
      const backendDuration = typeof response?.duration === 'number' ? response.duration : undefined;
      if (backendDuration !== undefined) {
        // backend may return ms or s — heuristic: if > 100, assume ms
        placeholder.durationSec = backendDuration > 100 ? backendDuration / 1000 : backendDuration;
      } else if (placeholder.startedAt) {
        placeholder.durationSec = (performance.now() - placeholder.startedAt) / 1000;
      }
      // Prompt size in tokens
      const tokens = response?.prompt_token_size ?? response?.usage?.prompt_tokens;
      if (typeof tokens === 'number') placeholder.promptTokens = tokens;

      this.busy = false;
      this.hasStreamScroll = true;
    };

    if (this.streaming) {
      this.openaiService.askGptStream(body).subscribe(
        (evt: any) => {
          if (evt?.done) { finalizeFromResponse(evt.response || {}); return; }
          if (evt?.fullAnswer !== undefined) {
            placeholder.busy = false;
            placeholder.text = evt.fullAnswer;
          } else if (evt?.text) {
            placeholder.busy = false;
            placeholder.text = (placeholder.text || '') + evt.text;
          }
          this.hasStreamScroll = true;
        },
        onError,
      );
    } else {
      this.openaiService.askGpt(body).subscribe(finalizeFromResponse, onError);
    }
  }

  private extractError(err: any): string {
    // Try to drill into the most informative field of the response body.
    // Backend payloads we've seen:
    //   { error: { message, name }, success: false }
    //   { error: { answer, error_message }, success: false }
    //   { message: "..." }
    //   { error_message: "BadRequestError(...'message': '...')" }
    const e = err?.error;
    let raw: string | undefined;

    if (typeof e === 'string') raw = e;
    else if (e?.error?.message) raw = e.error.message;
    else if (e?.error?.answer) raw = e.error.answer;
    else if (e?.error_message) {
      const m = String(e.error_message).match(/'message':\s*'([^']+)'/);
      raw = m ? m[1] : e.error_message;
    }
    else if (e?.message) raw = e.message;
    else if (err?.message && !/^Http failure/i.test(err.message)) raw = err.message;

    // Friendly translation for common network failures
    if (raw && /ECONNREFUSED|ETIMEDOUT|ENOTFOUND|EAI_AGAIN/i.test(raw)) {
      return this.translate.instant('KbPage.Preview2.ErrAINotReachable');
    }

    if (raw) return raw;

    // Fallback with status context
    const status = err?.status;
    if (status === 0)   return this.translate.instant('KbPage.Preview2.ErrNetwork');
    if (status === 401) return this.translate.instant('KbPage.Preview2.ErrSessionExpired');
    if (status === 403) return this.translate.instant('KbPage.Preview2.ErrForbidden');
    if (status === 404) return this.translate.instant('KbPage.Preview2.ErrNotFound');
    if (status >= 500)  return this.translate.instant('KbPage.Preview2.ErrServer', { status });

    return this.translate.instant('KbPage.Preview2.ErrGeneric');
  }

  // ---- Info popover hover handling: keep open while moving across the gap to the popover ----
  private closeTimers = new Map<any, any>();
  openInfo(ref: any) {
    const t = this.closeTimers.get(ref);
    if (t) { clearTimeout(t); this.closeTimers.delete(ref); }
    ref?.open?.();
  }
  scheduleCloseInfo(ref: any) {
    const t = setTimeout(() => { ref?.close?.(); this.closeTimers.delete(ref); }, 200);
    this.closeTimers.set(ref, t);
  }
  cancelCloseInfo(ref: any) {
    const t = this.closeTimers.get(ref);
    if (t) { clearTimeout(t); this.closeTimers.delete(ref); }
  }

  copyToClipboard(text: string) {
    try { navigator.clipboard?.writeText(text); } catch { /* noop */ }
  }

  close() {
    this.dialogRef.close();
  }
}
