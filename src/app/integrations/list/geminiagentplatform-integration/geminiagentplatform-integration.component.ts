import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { NotifyService } from 'app/core/notify.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { AgentPlatformEndpoint } from './agentplatform-endpoint-table/agentplatform-endpoint-table.component';

const Swal = require('sweetalert2');

/** Gemini Agent Platform generateContent URL: .../projects/{project}/locations/{location}/... */
const PROJECT_LOCATION_RE = /\/projects\/([^/]+)\/locations\/([^/]+)\//i;
/** .../models/{modelId}:generateContent */
const MODEL_RE = /\/models\/([^/:]+)(?::|$|\/|\?)/i;
/** .../endpoints/{endpointId}:generateContent (tuned model) */
const ENDPOINT_RE = /\/endpoints\/([^/:]+)(?::|$|\/|\?)/i;

@Component({
  selector: 'geminiagentplatform-integration',
  templateUrl: './geminiagentplatform-integration.component.html',
  styleUrls: ['./geminiagentplatform-integration.component.scss']
})
export class GeminiAgentPlatformIntegrationComponent implements OnInit, OnChanges {

  @Input() integration: any;
  @Output() onUpdateIntegration = new EventEmitter();
  @Output() onDeleteIntegration = new EventEmitter();

  translateparams: any;
  currentEndpoint: AgentPlatformEndpoint = this.createEmptyEndpoint();
  isEditing = false;
  editingIndex = -1;
  newModelName = '';
  showEnterButton = false;
  isMasked = true;
  /** Tracks model auto-seeded from the URL so URL edits can replace it. */
  private urlSeededModel: string | null = null;

  constructor(
    private logger: LoggerService,
    private notify: NotifyService,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.logger.log('[INT-AgentPlatform] integration ', this.integration);
    this.translateparams = { intname: 'Gemini Agent Platform' };
    this.ensureServersArray();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['integration']) {
      this.ensureServersArray();
    }
  }

  onUrlChange(url: string): void {
    this.currentEndpoint.url = url;
    this.syncModelFromUrl(url);
  }

  get showInvalidUrlError(): boolean {
    return !!this.invalidUrlErrorKey;
  }

  get invalidUrlErrorKey(): string | null {
    const url = String(this.currentEndpoint?.url || '').trim();
    if (!url) {
      return null;
    }
    const validation = this.validateAgentPlatformUrl(url);
    if (validation.ok === false) {
      return validation.reason === 'malformed'
        ? 'Integration.AgentPlatformInvalidUrlFormat'
        : 'Integration.AgentPlatformInvalidUrl';
    }
    return null;
  }

  addOrUpdateEndpoint(): void {
    this.flushPendingModel();
    this.logger.log('[INT-AgentPlatform] addOrUpdateEndpoint', this.currentEndpoint, 'isEditing:', this.isEditing);

    const name = String(this.currentEndpoint.name || '').trim();
    const url = String(this.currentEndpoint.url || '').trim();
    const apikey = String(this.currentEndpoint.apikey || '').trim();
    const models = this.normalizeModels(this.currentEndpoint.models);
    const parsed = this.parseProjectLocationFromUrl(url);

    if (!name || !url) {
      this.notify.showWidgetStyleUpdateNotification(
        this.translate.instant('Integration.VllmNameAndUrlRequired'),
        3,
        'error',
      );
      return;
    }

    if (!parsed) {
      this.notify.showWidgetStyleUpdateNotification(
        this.translate.instant(this.invalidUrlErrorKey || 'Integration.AgentPlatformInvalidUrl'),
        3,
        'error',
      );
      return;
    }

    if (!models.length) {
      this.notify.showWidgetStyleUpdateNotification(
        this.translate.instant('Integration.VllmModelsRequired'),
        3,
        'error',
      );
      return;
    }

    if (this.hasDuplicateName(name)) {
      this.notify.showWidgetStyleUpdateNotification(
        this.translate.instant('Integration.VllmDuplicateName'),
        3,
        'error',
      );
      return;
    }

    if (this.hasDuplicateUrl(url)) {
      this.notify.showWidgetStyleUpdateNotification(
        this.translate.instant('Integration.VllmDuplicateUrl'),
        3,
        'error',
      );
      return;
    }

    const endpointToSave: AgentPlatformEndpoint = {
      name,
      url,
      models,
      project: parsed.project,
      location: parsed.location,
      ...(apikey ? { apikey } : {}),
    };

    if (this.isEditing && this.editingIndex >= 0) {
      this.integration.value.servers = this.integration.value.servers.map(
        (endpoint: AgentPlatformEndpoint, index: number) =>
          index === this.editingIndex ? endpointToSave : endpoint,
      );
      this.logger.log('[INT-AgentPlatform] Updated endpoint at index', this.editingIndex);
    } else {
      this.integration.value.servers = [...this.integration.value.servers, endpointToSave];
      this.logger.log('[INT-AgentPlatform] Added new endpoint');
    }

    this.resetForm();
    this.saveIntegration();
  }

  onSelectEndpoint(endpoint: AgentPlatformEndpoint): void {
    this.logger.log('[INT-AgentPlatform] Endpoint selected:', endpoint);
    const index = this.findEndpointIndex(endpoint);

    if (index >= 0) {
      this.currentEndpoint = {
        name: endpoint.name,
        url: endpoint.url,
        apikey: endpoint.apikey || '',
        models: [...(endpoint.models || [])],
        project: endpoint.project || '',
        location: endpoint.location || '',
      };
      this.isEditing = true;
      this.editingIndex = index;
      this.isMasked = true;
      this.newModelName = '';
      this.showEnterButton = false;
      this.urlSeededModel = null;
    }
  }

  onDeleteEndpoint(endpoint: AgentPlatformEndpoint): void {
    this.logger.log('[INT-AgentPlatform] Delete endpoint requested:', endpoint);

    Swal.fire({
      title: this.translate.instant('AreYouSure'),
      html: this.translate.instant('Integration.VllmEndpointWillBeDeleted', { endpointName: endpoint.name }),
      icon: 'warning',
      showCloseButton: false,
      showCancelButton: true,
      showConfirmButton: false,
      showDenyButton: true,
      denyButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
      focusConfirm: false,
      reverseButtons: true,
    }).then((result) => {
      if (!result.isDenied) {
        this.logger.log('[INT-AgentPlatform] Delete cancelled');
        return;
      }

      const indexToDelete = this.findEndpointIndex(endpoint);
      if (indexToDelete < 0) {
        return;
      }

      this.integration.value.servers = this.integration.value.servers.filter(
        (_endpoint: AgentPlatformEndpoint, i: number) => i !== indexToDelete,
      );

      if (this.isEditing && this.editingIndex === indexToDelete) {
        this.resetForm();
      } else if (this.isEditing && this.editingIndex > indexToDelete) {
        this.editingIndex -= 1;
      }

      this.saveIntegration();

      Swal.fire({
        title: this.translate.instant('Done') + '!',
        text: this.translate.instant('Integration.VllmEndpointHasBeenDeleted'),
        icon: 'success',
        showCloseButton: false,
        showCancelButton: false,
        confirmButtonText: this.translate.instant('Ok'),
      });
    });
  }

  addModel(modelName: string): void {
    const trimmed = String(modelName || '').trim();
    if (!trimmed) {
      return;
    }

    if (!Array.isArray(this.currentEndpoint.models)) {
      this.currentEndpoint.models = [];
    }

    if (!this.currentEndpoint.models.includes(trimmed)) {
      this.currentEndpoint.models.push(trimmed);
    }

    this.newModelName = '';
    this.showEnterButton = false;
  }

  removeModel(modelName: string): void {
    this.currentEndpoint.models = (this.currentEndpoint.models || []).filter((model) => model !== modelName);
    if (this.urlSeededModel === modelName) {
      this.urlSeededModel = null;
    }
  }

  onEnterModel(value: string): void {
    this.showEnterButton = String(value || '').trim().length > 0;
  }

  resetForm(): void {
    this.currentEndpoint = this.createEmptyEndpoint();
    this.isEditing = false;
    this.editingIndex = -1;
    this.newModelName = '';
    this.showEnterButton = false;
    this.isMasked = true;
    this.urlSeededModel = null;
  }

  saveIntegration(): void {
    this.sanitizeIntegrationValue();
    const data = {
      integration: this.integration,
    };
    this.logger.log('[INT-AgentPlatform] saveIntegration ', this.integration);
    this.onUpdateIntegration.emit(data);
  }

  handleInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const displayedValue = inputElement.value;
    const currentValue = this.currentEndpoint.apikey || '';

    if (this.isMasked && currentValue) {
      const newChar = displayedValue.slice(currentValue.length);
      this.currentEndpoint.apikey = currentValue + newChar;
    } else {
      this.currentEndpoint.apikey = displayedValue;
    }

    inputElement.value = this.getDisplayValue();
  }

  handleBackspace(): void {
    if (this.currentEndpoint.apikey) {
      this.currentEndpoint.apikey = this.currentEndpoint.apikey.slice(0, -1);
    }
  }

  toggleMask(inputElement: HTMLInputElement): void {
    this.isMasked = !this.isMasked;
    inputElement.value = this.getDisplayValue();
  }

  getDisplayValue(): string {
    if (!this.currentEndpoint.apikey) {
      return '';
    }
    return this.isMasked ? '●'.repeat(this.currentEndpoint.apikey.length) : this.currentEndpoint.apikey;
  }

  canSubmit(): boolean {
    const pendingModel = String(this.newModelName || '').trim();
    const modelsCount = this.normalizeModels(this.currentEndpoint.models).length;
    const url = String(this.currentEndpoint.url || '').trim();
    return !!String(this.currentEndpoint.name || '').trim()
      && !!url
      && !!this.parseProjectLocationFromUrl(url)
      && (modelsCount > 0 || !!pendingModel);
  }

  private syncModelFromUrl(url: string): void {
    const modelFromUrl = this.parseProjectLocationFromUrl(url)
      ? this.extractModelIdFromUrl(url)
      : null;
    if (!Array.isArray(this.currentEndpoint.models)) {
      this.currentEndpoint.models = [];
    }

    if (this.urlSeededModel) {
      this.currentEndpoint.models = this.currentEndpoint.models.filter(
        (model) => model !== this.urlSeededModel,
      );
      this.urlSeededModel = null;
    }

    if (!modelFromUrl) {
      return;
    }

    if (!this.currentEndpoint.models.includes(modelFromUrl)) {
      this.currentEndpoint.models = [modelFromUrl, ...this.currentEndpoint.models];
    }
    this.urlSeededModel = modelFromUrl;
  }

  private extractModelIdFromUrl(url: string): string | null {
    // Publisher models only — do not seed endpoint id from tuned URLs
    const modelMatch = String(url || '').match(MODEL_RE);
    return modelMatch?.[1] || null;
  }

  /**
   * Validate a Gemini Agent Platform generateContent URL and extract project/location.
   * - malformed: not a proper http(s) URL (e.g. "ttps://...", "3. https://...")
   * - missing_path_parts: valid URL but missing project/location and/or model|endpoint
   *   (publisher: .../models/{id}:generateContent, tuned: .../endpoints/{id}:generateContent)
   */
  private validateAgentPlatformUrl(url: string):
    | { ok: true; project: string; location: string }
    | { ok: false; reason: 'malformed' | 'missing_path_parts' } {
    const trimmed = String(url || '').trim();
    if (!trimmed || !/^https?:\/\//i.test(trimmed)) {
      return { ok: false, reason: 'malformed' };
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(trimmed);
    } catch {
      return { ok: false, reason: 'malformed' };
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return { ok: false, reason: 'malformed' };
    }

    const pathAndSearch = `${parsedUrl.pathname}${parsedUrl.search}`;
    const match = pathAndSearch.match(PROJECT_LOCATION_RE);
    if (!match) {
      return { ok: false, reason: 'missing_path_parts' };
    }
    const project = String(match[1] || '').trim();
    const location = String(match[2] || '').trim();
    if (!project || !location || project.toLowerCase() === 'locations') {
      return { ok: false, reason: 'missing_path_parts' };
    }

    const hasModelOrEndpoint = !!pathAndSearch.match(MODEL_RE) || !!pathAndSearch.match(ENDPOINT_RE);
    if (!hasModelOrEndpoint) {
      return { ok: false, reason: 'missing_path_parts' };
    }

    return { ok: true, project, location };
  }

  private parseProjectLocationFromUrl(url: string): { project: string; location: string } | null {
    const validation = this.validateAgentPlatformUrl(url);
    return validation.ok ? { project: validation.project, location: validation.location } : null;
  }

  private ensureServersArray(): void {
    if (!this.integration) {
      return;
    }
    if (!this.integration.value || typeof this.integration.value !== 'object') {
      this.integration.value = { servers: [] };
      return;
    }
    if (!Array.isArray(this.integration.value.servers)) {
      this.integration.value.servers = [];
    }
    this.sanitizeIntegrationValue();
  }

  private sanitizeIntegrationValue(): void {
    if (!this.integration) {
      return;
    }

    const servers = (this.integration.value?.servers || [])
      .map((endpoint: AgentPlatformEndpoint) => this.normalizeStoredEndpoint(endpoint))
      .filter((endpoint: AgentPlatformEndpoint) => !!endpoint.name && !!endpoint.url && !!endpoint.project && !!endpoint.location);

    this.integration.value = { servers };
  }

  private normalizeStoredEndpoint(endpoint: AgentPlatformEndpoint): AgentPlatformEndpoint {
    const name = String(endpoint?.name || '').trim();
    const url = String(endpoint?.url || '').trim();
    const models = this.normalizeModels(endpoint?.models);
    const apikey = String(endpoint?.apikey || '').trim();
    const parsed = this.parseProjectLocationFromUrl(url);
    const project = parsed?.project || String(endpoint?.project || '').trim();
    const location = parsed?.location || String(endpoint?.location || '').trim();

    return {
      name,
      url,
      models,
      project,
      location,
      ...(apikey ? { apikey } : {}),
    };
  }

  private flushPendingModel(): void {
    const trimmed = String(this.newModelName || '').trim();
    if (!trimmed) {
      return;
    }

    if (!Array.isArray(this.currentEndpoint.models)) {
      this.currentEndpoint.models = [];
    }

    if (!this.currentEndpoint.models.includes(trimmed)) {
      this.currentEndpoint.models.push(trimmed);
    }

    this.newModelName = '';
    this.showEnterButton = false;
  }

  private createEmptyEndpoint(): AgentPlatformEndpoint {
    return {
      name: '',
      url: '',
      apikey: '',
      models: [],
      project: '',
      location: '',
    };
  }

  private normalizeModels(models: string[] | undefined): string[] {
    if (!Array.isArray(models)) {
      return [];
    }

    return models
      .map((model) => String(model || '').trim())
      .filter((model) => !!model);
  }

  private normalizeValue(value: string): string {
    return String(value || '').trim().toLowerCase();
  }

  private hasDuplicateName(name: string): boolean {
    const normalizedName = this.normalizeValue(name);
    return this.integration.value.servers.some((endpoint: AgentPlatformEndpoint, index: number) =>
      index !== this.editingIndex && this.normalizeValue(endpoint.name) === normalizedName
    );
  }

  private hasDuplicateUrl(url: string): boolean {
    const normalizedUrl = this.normalizeValue(url);
    return this.integration.value.servers.some((endpoint: AgentPlatformEndpoint, index: number) =>
      index !== this.editingIndex && this.normalizeValue(endpoint.url) === normalizedUrl
    );
  }

  private findEndpointIndex(endpoint: AgentPlatformEndpoint): number {
    const normalizedName = this.normalizeValue(endpoint.name);
    const normalizedUrl = this.normalizeValue(endpoint.url);

    return this.integration.value.servers.findIndex((item: AgentPlatformEndpoint) =>
      this.normalizeValue(item.name) === normalizedName &&
      this.normalizeValue(item.url) === normalizedUrl
    );
  }
}
