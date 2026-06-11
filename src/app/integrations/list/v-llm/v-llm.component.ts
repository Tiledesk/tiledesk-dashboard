import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { NotifyService } from 'app/core/notify.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { VllmEndpoint } from './vllm-endpoint-table/vllm-endpoint-table.component';

const Swal = require('sweetalert2');

@Component({
  selector: 'v-llm',
  templateUrl: './v-llm.component.html',
  styleUrls: ['./v-llm.component.scss']
})
export class VLLMComponent implements OnInit, OnChanges {

  @Input() integration: any;
  @Output() onUpdateIntegration = new EventEmitter();
  @Output() onDeleteIntegration = new EventEmitter();

  translateparams: any;
  currentEndpoint: VllmEndpoint = this.createEmptyEndpoint();
  isEditing = false;
  editingIndex = -1;
  newModelName = '';
  showEnterButton = false;
  isMasked = true;

  constructor(
    private logger: LoggerService,
    private notify: NotifyService,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.logger.log('[INT-vLLM] integration ', this.integration);
    this.translateparams = { intname: 'vLLM' };
    this.ensureServersArray();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['integration']) {
      this.ensureServersArray();
    }
  }

  addOrUpdateEndpoint(): void {
    this.flushPendingModel();
    this.logger.log('[INT-vLLM] addOrUpdateEndpoint', this.currentEndpoint, 'isEditing:', this.isEditing);

    const name = String(this.currentEndpoint.name || '').trim();
    const url = String(this.currentEndpoint.url || '').trim();
    const apikey = String(this.currentEndpoint.apikey || '').trim();
    const models = this.normalizeModels(this.currentEndpoint.models);

    if (!name || !url) {
      this.notify.showWidgetStyleUpdateNotification(
        this.translate.instant('Integration.VllmNameAndUrlRequired'),
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

    const endpointToSave: VllmEndpoint = {
      name,
      url,
      models,
      ...(apikey ? { apikey } : {}),
    };

    if (this.isEditing && this.editingIndex >= 0) {
      this.integration.value.servers = this.integration.value.servers.map(
        (endpoint: VllmEndpoint, index: number) =>
          index === this.editingIndex ? endpointToSave : endpoint,
      );
      this.logger.log('[INT-vLLM] Updated endpoint at index', this.editingIndex);
    } else {
      this.integration.value.servers = [...this.integration.value.servers, endpointToSave];
      this.logger.log('[INT-vLLM] Added new endpoint');
    }

    this.resetForm();
    this.saveIntegration();
  }

  onSelectEndpoint(endpoint: VllmEndpoint): void {
    this.logger.log('[INT-vLLM] Endpoint selected:', endpoint);
    const index = this.findEndpointIndex(endpoint);

    if (index >= 0) {
      this.currentEndpoint = {
        name: endpoint.name,
        url: endpoint.url,
        apikey: endpoint.apikey || '',
        models: [...(endpoint.models || [])],
      };
      this.isEditing = true;
      this.editingIndex = index;
      this.isMasked = true;
      this.newModelName = '';
      this.showEnterButton = false;
    }
  }

  onDeleteEndpoint(endpoint: VllmEndpoint): void {
    this.logger.log('[INT-vLLM] Delete endpoint requested:', endpoint);

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
        this.logger.log('[INT-vLLM] Delete cancelled');
        return;
      }

      const indexToDelete = this.findEndpointIndex(endpoint);
      if (indexToDelete < 0) {
        return;
      }

      this.integration.value.servers = this.integration.value.servers.filter(
        (_endpoint: VllmEndpoint, i: number) => i !== indexToDelete,
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
  }

  saveIntegration(): void {
    this.sanitizeIntegrationValue();
    const data = {
      integration: this.integration,
    };
    this.logger.log('[INT-vLLM] saveIntegration ', this.integration);
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
    return !!String(this.currentEndpoint.name || '').trim()
      && !!String(this.currentEndpoint.url || '').trim()
      && (modelsCount > 0 || !!pendingModel);
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

  /** Persist only the new schema: value.servers[] (drop legacy url/token/models). */
  private sanitizeIntegrationValue(): void {
    if (!this.integration) {
      return;
    }

    const servers = (this.integration.value?.servers || [])
      .map((endpoint: VllmEndpoint) => this.normalizeStoredEndpoint(endpoint))
      .filter((endpoint: VllmEndpoint) => !!endpoint.name && !!endpoint.url);

    this.integration.value = { servers };
  }

  private normalizeStoredEndpoint(endpoint: VllmEndpoint): VllmEndpoint {
    const name = String(endpoint?.name || '').trim();
    const url = String(endpoint?.url || '').trim();
    const models = this.normalizeModels(endpoint?.models);
    const apikey = String(endpoint?.apikey || '').trim();

    return {
      name,
      url,
      models,
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

  private createEmptyEndpoint(): VllmEndpoint {
    return {
      name: '',
      url: '',
      apikey: '',
      models: [],
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
    return this.integration.value.servers.some((endpoint: VllmEndpoint, index: number) =>
      index !== this.editingIndex && this.normalizeValue(endpoint.name) === normalizedName
    );
  }

  private hasDuplicateUrl(url: string): boolean {
    const normalizedUrl = this.normalizeValue(url);
    return this.integration.value.servers.some((endpoint: VllmEndpoint, index: number) =>
      index !== this.editingIndex && this.normalizeValue(endpoint.url) === normalizedUrl
    );
  }

  private findEndpointIndex(endpoint: VllmEndpoint): number {
    const normalizedName = this.normalizeValue(endpoint.name);
    const normalizedUrl = this.normalizeValue(endpoint.url);

    return this.integration.value.servers.findIndex((item: VllmEndpoint) =>
      this.normalizeValue(item.name) === normalizedName &&
      this.normalizeValue(item.url) === normalizedUrl
    );
  }
}
