import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from 'app/core/notify.service';
import { IntegrationService } from 'app/services/integration.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { isMaskedApikey } from 'app/integrations/utils';
import { OpenRouterModelConfig, OpenRouterSort } from './openrouter-model-table/openrouter-model-table.component';

const Swal = require('sweetalert2');

/** One entry of the OpenRouter model catalogue, reduced to what the picker needs. */
export interface OpenRouterCatalogueModel {
  id: string;
  name: string;
  context_length?: number;
}

/** One provider serving a model, derived from the model's /endpoints response. */
export interface OpenRouterProviderOption {
  /** Routable provider slug (OpenRouter endpoint "tag"). */
  tag: string;
  /** Display name, e.g. "DeepInfra". */
  name: string;
  /** Quantization label, omitted when unknown. */
  quantization?: string;
}

@Component({
  selector: 'openrouter-integration',
  templateUrl: './openrouter-integration.component.html',
  styleUrls: ['./openrouter-integration.component.scss']
})
export class OpenRouterIntegrationComponent implements OnInit, OnChanges {

  @Input() integration: any;
  @Output() onUpdateIntegration = new EventEmitter;
  @Output() onDeleteIntegration = new EventEmitter;

  isVerified: boolean;
  translateparams: any;
  apiKeyCanSave = false;

  /** Full OpenRouter catalogue, fed to the ng-select picker. */
  catalogue: OpenRouterCatalogueModel[] = [];
  catalogueLoading = false;
  catalogueError = false;

  /** Model currently being added or edited. */
  selectedModelId: string = null;
  /** Chosen providers, in preference order (drag to rank). */
  selectedProviders: OpenRouterProviderOption[] = [];
  /** Remaining providers serving the model, alphabetical. */
  availableProviders: OpenRouterProviderOption[] = [];
  providersLoading = false;
  providersError = false;
  allowFallbacks = true;
  sort: OpenRouterSort = null;

  isEditing = false;
  editingIndex = -1;

  readonly SORT_OPTIONS: { value: OpenRouterSort, labelKey: string }[] = [
    { value: null, labelKey: 'Integration.OpenRouterSortDefault' },
    { value: 'price', labelKey: 'Integration.OpenRouterSortPrice' },
    { value: 'throughput', labelKey: 'Integration.OpenRouterSortThroughput' },
    { value: 'latency', labelKey: 'Integration.OpenRouterSortLatency' }
  ];

  constructor(
    private integrationService: IntegrationService,
    private logger: LoggerService,
    private notify: NotifyService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.logger.log('[INT-OPENROUTER] integration ', this.integration);
    this.translateparams = { intname: 'OpenRouter' };
    this.ensureModelsArray();
    if (this.integration.value.apikey && !isMaskedApikey(this.integration.value.apikey)) {
      this.checkKey();
    }
    this.loadCatalogue();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['integration'] && !changes['integration'].firstChange) {
      this.ensureModelsArray();
      this.resetForm();
    }
  }

  // ---------------------------------------------------------------- catalogue

  loadCatalogue(): void {
    this.catalogueLoading = true;
    this.catalogueError = false;

    this.integrationService.getOpenRouterModels().subscribe((resp: any) => {
      const data = Array.isArray(resp?.data) ? resp.data : [];
      this.catalogue = data
        .map((model) => ({
          id: String(model?.id || ''),
          name: String(model?.name || model?.id || ''),
          context_length: model?.context_length
        }))
        .filter((model) => !!model.id)
        .sort((a, b) => a.name.localeCompare(b.name));
      this.catalogueLoading = false;
      this.logger.log('[INT-OPENROUTER] catalogue loaded: ', this.catalogue.length);
    }, (error) => {
      this.logger.error('[INT-OPENROUTER] catalogue load failed: ', error);
      this.catalogue = [];
      this.catalogueLoading = false;
      this.catalogueError = true;
    });
  }

  onSelectCatalogueModel(modelId: string): void {
    this.selectedModelId = modelId || null;
    this.selectedProviders = [];
    this.availableProviders = [];
    this.providersError = false;

    if (!this.selectedModelId) {
      return;
    }

    this.loadProviders(this.selectedModelId, []);
  }

  // ---------------------------------------------------------------- providers

  private loadProviders(modelId: string, preselected: string[]): void {
    this.providersLoading = true;
    this.providersError = false;

    this.integrationService.getOpenRouterModelEndpoints(modelId).subscribe((resp: any) => {
      const endpoints = Array.isArray(resp?.data?.endpoints) ? resp.data.endpoints : [];
      this.splitProviders(this.buildProviderOptions(endpoints, preselected), preselected);
      this.providersLoading = false;
      this.logger.log('[INT-OPENROUTER] providers for ', modelId, this.selectedProviders, this.availableProviders);
    }, (error) => {
      this.logger.error('[INT-OPENROUTER] providers load failed: ', error);
      // Keep any stored selection visible so editing never silently drops it.
      this.selectedProviders = preselected.map((tag) => ({ tag, name: tag }));
      this.availableProviders = [];
      this.providersLoading = false;
      this.providersError = true;
    });
  }

  /** One option per distinct provider tag served by the model. */
  private buildProviderOptions(endpoints: any[], preselected: string[]): OpenRouterProviderOption[] {
    const byTag = new Map<string, OpenRouterProviderOption>();

    endpoints.forEach((endpoint) => {
      const tag = String(endpoint?.tag || '').trim();
      if (!tag || byTag.has(tag)) {
        return;
      }

      const quantization = String(endpoint?.quantization || '').trim();
      byTag.set(tag, {
        tag,
        name: String(endpoint?.provider_name || tag).trim(),
        ...(quantization && quantization !== 'unknown' ? { quantization } : {})
      });
    });

    // A stored provider no longer served by the model still needs a row to be removable.
    preselected.forEach((tag) => {
      if (!byTag.has(tag)) {
        byTag.set(tag, { tag, name: tag });
      }
    });

    return Array.from(byTag.values());
  }

  /** Stored selection keeps its saved order; everything else is listed alphabetically. */
  private splitProviders(options: OpenRouterProviderOption[], preselected: string[]): void {
    const byTag = new Map(options.map((option) => [option.tag, option]));

    this.selectedProviders = preselected
      .map((tag) => byTag.get(tag))
      .filter((option) => !!option);

    this.availableProviders = options
      .filter((option) => !preselected.includes(option.tag))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  selectProvider(option: OpenRouterProviderOption): void {
    this.availableProviders = this.availableProviders.filter((item) => item.tag !== option.tag);
    // Newly selected providers join the end of the preference order.
    this.selectedProviders = [...this.selectedProviders, option];
  }

  unselectProvider(option: OpenRouterProviderOption): void {
    this.selectedProviders = this.selectedProviders.filter((item) => item.tag !== option.tag);
    this.availableProviders = [...this.availableProviders, option]
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  onProviderDrop(event: CdkDragDrop<OpenRouterProviderOption[]>): void {
    moveItemInArray(this.selectedProviders, event.previousIndex, event.currentIndex);
  }

  /** A model can only be stored once the integration carries a key (stored or drafted). */
  get hasApiKey(): boolean {
    return !!String(this.integration?.value?.apikey || '').trim();
  }

  getProviderLabel(option: OpenRouterProviderOption): string {
    return option.quantization ? `${option.name} (${option.quantization})` : option.name;
  }

  // ------------------------------------------------------------------- models

  addOrUpdateModel(): void {
    const modelId = String(this.selectedModelId || '').trim();
    if (!modelId) {
      return;
    }

    if (this.hasDuplicateModel(modelId)) {
      this.notify.showWidgetStyleUpdateNotification(
        this.translate.instant('Integration.OpenRouterDuplicateModel'),
        3,
        'error',
      );
      return;
    }

    const modelToSave: OpenRouterModelConfig = {
      id: modelId,
      name: this.getCatalogueName(modelId),
      providers: this.selectedProviders.map((option) => option.tag),
      allow_fallbacks: this.allowFallbacks,
      sort: this.sort
    };

    if (this.isEditing && this.editingIndex >= 0) {
      this.integration.value.models = this.integration.value.models.map(
        (model: OpenRouterModelConfig, index: number) => index === this.editingIndex ? modelToSave : model,
      );
      this.logger.log('[INT-OPENROUTER] Updated model at index', this.editingIndex);
    } else {
      this.integration.value.models = [...this.integration.value.models, modelToSave];
      this.logger.log('[INT-OPENROUTER] Added model', modelToSave);
    }

    this.resetForm();
    this.saveIntegration();
  }

  onSelectModel(model: OpenRouterModelConfig): void {
    const index = this.findModelIndex(model);
    if (index < 0) {
      return;
    }

    this.selectedModelId = model.id;
    this.allowFallbacks = model.allow_fallbacks !== false;
    this.sort = model.sort || null;
    this.isEditing = true;
    this.editingIndex = index;
    this.loadProviders(model.id, Array.isArray(model.providers) ? [...model.providers] : []);
  }

  onDeleteModel(model: OpenRouterModelConfig): void {
    Swal.fire({
      title: this.translate.instant('AreYouSure'),
      html: this.translate.instant('Integration.OpenRouterModelWillBeDeleted', { modelName: model.name || model.id }),
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
        this.logger.log('[INT-OPENROUTER] Delete cancelled');
        return;
      }

      const indexToDelete = this.findModelIndex(model);
      if (indexToDelete < 0) {
        return;
      }

      this.integration.value.models = this.integration.value.models.filter(
        (_model: OpenRouterModelConfig, i: number) => i !== indexToDelete,
      );

      if (this.isEditing && this.editingIndex === indexToDelete) {
        this.resetForm();
      } else if (this.isEditing && this.editingIndex > indexToDelete) {
        this.editingIndex -= 1;
      }

      this.saveIntegration();

      Swal.fire({
        title: this.translate.instant('Done') + '!',
        text: this.translate.instant('Integration.OpenRouterModelHasBeenDeleted'),
        icon: 'success',
        showCloseButton: false,
        showCancelButton: false,
        confirmButtonText: this.translate.instant('Ok'),
      });
    });
  }

  resetForm(): void {
    this.selectedModelId = null;
    this.selectedProviders = [];
    this.availableProviders = [];
    this.providersLoading = false;
    this.providersError = false;
    this.allowFallbacks = true;
    this.sort = null;
    this.isEditing = false;
    this.editingIndex = -1;
  }

  // ------------------------------------------------------------- integration

  saveIntegration() {
    this.checkKey().then((status) => {
      let data = {
        integration: this.integration,
        isVerified: status
      };
      this.onUpdateIntegration.emit(data);
    });
  }

  deleteIntegration() {
    this.isVerified = null;
    this.onDeleteIntegration.emit(this.integration);
  }

  checkKey() {
    return new Promise((resolve) => {
      const apikey = String(this.integration.value.apikey || '').trim();

      // A server-masked key cannot be replayed against OpenRouter; keep the last known state.
      if (!apikey || isMaskedApikey(apikey)) {
        resolve(this.isVerified === true);
        return;
      }

      const url = 'https://openrouter.ai/api/v1/models';
      const key = 'Bearer ' + apikey;
      this.integrationService.checkIntegrationKeyValidity(url, key).subscribe((resp) => {
        this.logger.log('[INT-OPENROUTER] Key verification resp: ', resp);
        this.isVerified = true;
        resolve(true);
      }, (error) => {
        this.logger.error('[INT-OPENROUTER] Key verification failed: ', error);
        this.isVerified = false;
        resolve(false);
      });
    });
  }

  resetValues() {
    this.integration.value = {
      apikey: null,
      models: []
    };
    this.resetForm();
  }

  // ------------------------------------------------------------------ helpers

  private ensureModelsArray(): void {
    if (!this.integration) {
      return;
    }
    if (!this.integration.value || typeof this.integration.value !== 'object') {
      this.integration.value = { apikey: null, models: [] };
      return;
    }
    if (!Array.isArray(this.integration.value.models)) {
      this.integration.value.models = [];
    }
  }

  private getCatalogueName(modelId: string): string {
    const match = this.catalogue.find((model) => model.id === modelId);
    if (match) {
      return match.name;
    }
    // Editing a stored model while the catalogue is unavailable: keep the saved name.
    const stored = (this.integration.value.models || [])
      .find((model: OpenRouterModelConfig) => model.id === modelId);
    return stored?.name || modelId;
  }

  private hasDuplicateModel(modelId: string): boolean {
    return (this.integration.value.models || []).some(
      (model: OpenRouterModelConfig, index: number) => index !== this.editingIndex && model.id === modelId
    );
  }

  private findModelIndex(model: OpenRouterModelConfig): number {
    return (this.integration.value.models || []).findIndex(
      (item: OpenRouterModelConfig) => item.id === model.id
    );
  }
}
