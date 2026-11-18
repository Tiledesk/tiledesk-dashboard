import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { STOP_NOTICE_MAX, StopNoticeSettings } from 'app/bots/executions/executions.models';
import { ExecutionsService } from 'app/services/executions.service';
import { LoggerService } from 'app/services/logger/logger.service';

/**
 * "Pause notice" card of the project settings retention page (stop notice in the code and the API): the notice the
 * chatbot sends in the conversation when a user writes while the agent's execution is stopped, shown as paused
 * (the message itself stays dropped).
 */
@Component({
  selector: 'executions-stop-notice',
  templateUrl: './executions-stop-notice.component.html',
  styleUrls: ['./executions-stop-notice.component.scss']
})
export class ExecutionsStopNoticeComponent implements OnInit {
  @Input() projectId: string;

  readonly maxLength = STOP_NOTICE_MAX;

  configured = false;
  settings: StopNoticeSettings = null;
  enabled = true;
  text = '';
  saving = false;
  saved = false;
  /** The last save was refused because the text is too long. */
  textError = false;
  saveFailed = false;

  constructor(
    private executions: ExecutionsService,
    private translate: TranslateService,
    private logger: LoggerService
  ) { }

  ngOnInit() {
    this.configured = this.executions.isConfigured();
    if (!this.configured || !this.projectId) { return; }
    this.executions.getStopNotice(this.projectId).subscribe({
      next: (s) => this.apply(s),
      // no permission to read (or the service is down): no card
      error: (err) => { this.logger.warn('[EXECUTIONS-STOP-NOTICE] read failed', err && err.status); this.settings = null; }
    });
  }

  private apply(s: StopNoticeSettings) {
    this.settings = s;
    this.enabled = s.enabled !== false;
    this.text = s.text || '';
  }

  /** The default text in the UI language (it → Italian, anything else → English). */
  get placeholder(): string {
    const d = this.settings && this.settings.default_text;
    if (!d) { return ''; }
    const lang = (this.translate.currentLang || this.translate.defaultLang || 'en').toLowerCase();
    return lang.startsWith('it') ? d.it : d.en;
  }

  private get normalizedText(): string | null {
    const t = (this.text || '').trim();
    return t === '' ? null : t;
  }

  get tooLong(): boolean {
    return (this.text || '').trim().length > this.maxLength;
  }

  get changed(): boolean {
    return !!this.settings && (this.enabled !== this.settings.enabled || this.normalizedText !== (this.settings.text || null));
  }

  get canSave(): boolean {
    return !!this.settings && this.settings.can_edit && !this.saving && this.changed && !this.tooLong;
  }

  edited() {
    this.saved = false;
    this.saveFailed = false;
    this.textError = false;
  }

  save() {
    if (!this.canSave) { return; }
    this.saved = false;
    this.saveFailed = false;
    this.textError = false;
    this.saving = true;
    this.executions.putStopNotice(this.projectId, { enabled: this.enabled, text: this.normalizedText }).subscribe({
      next: (s) => { this.saving = false; this.apply(s); this.saved = true; },
      error: (err) => {
        this.saving = false;
        const e = err && err.error;
        if (err && err.status === 400 && e && e.error === 'out_of_range' && e.field === 'text') {
          this.textError = true;
        } else {
          this.saveFailed = true;
        }
      }
    });
  }
}
