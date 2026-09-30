import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotifyService } from 'app/core/notify.service';
import { isMaskedApikey } from 'app/integrations/utils';
import { TranslateService } from '@ngx-translate/core';
import { VllmCustomHeader, VllmEndpoint } from '../vllm-endpoint-table/vllm-endpoint-table.component';

export interface VllmEndpointDialogData {
  endpoint?: VllmEndpoint;
  isEditing: boolean;
  editingIndex: number;
  servers: VllmEndpoint[];
}

export interface VllmEndpointDialogResult {
  endpoint: VllmEndpoint;
}

/** UI row: persisted headers are only { key, value } when enabled + both filled. */
interface VllmHeaderRow {
  key: string;
  value: string;
  enabled: boolean;
}

@Component({
  selector: 'vllm-endpoint-dialog',
  templateUrl: './vllm-endpoint-dialog.component.html',
  styleUrls: ['./vllm-endpoint-dialog.component.scss'],
})
export class VllmEndpointDialogComponent implements OnInit {
  currentEndpoint: VllmEndpoint = this.createEmptyEndpoint();
  isEditing = false;
  editingIndex = -1;
  servers: VllmEndpoint[] = [];
  newModelName = '';
  showEnterButton = false;
  apiKeyCanSave = true;
  apiKeyIsReplacing = false;
  apiKeyFieldReset = 0;
  endpointStoredApikey = '';
  headerRows: VllmHeaderRow[] = [];

  constructor(
    public dialogRef: MatDialogRef<VllmEndpointDialogComponent, VllmEndpointDialogResult | undefined>,
    @Inject(MAT_DIALOG_DATA) public data: VllmEndpointDialogData,
    private notify: NotifyService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.isEditing = !!this.data?.isEditing;
    this.editingIndex = Number.isFinite(this.data?.editingIndex) ? this.data.editingIndex : -1;
    this.servers = Array.isArray(this.data?.servers) ? this.data.servers : [];

    if (this.isEditing && this.data?.endpoint) {
      const endpoint = this.data.endpoint;
      this.currentEndpoint = {
        name: endpoint.name || '',
        url: endpoint.url || '',
        apikey: endpoint.apikey || '',
        models: [...(endpoint.models || [])],
        customHeaders: Array.isArray(endpoint.customHeaders)
          ? endpoint.customHeaders.map((h) => ({ ...h }))
          : [],
      };
      this.endpointStoredApikey = endpoint.apikey || '';
      this.headerRows = this.mapStoredHeadersToRows(endpoint.customHeaders);
    } else {
      this.currentEndpoint = this.createEmptyEndpoint();
      this.endpointStoredApikey = '';
      this.headerRows = [];
    }
    this.apiKeyFieldReset++;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  addHeaderRow(): void {
    this.headerRows = [
      ...this.headerRows,
      { key: '', value: '', enabled: true },
    ];
  }

  removeHeaderRow(index: number): void {
    this.headerRows = this.headerRows.filter((_, i) => i !== index);
  }

  /** Switch is interactive only when both Key and Value are filled. */
  canToggleHeader(row: VllmHeaderRow): boolean {
    return !!String(row.key || '').trim() && !!String(row.value || '').trim();
  }

  onHeaderFieldsChange(row: VllmHeaderRow): void {
    // Incomplete / empty rows stay ON but the switch control is disabled.
    if (!this.canToggleHeader(row)) {
      row.enabled = true;
    }
  }

  isHeaderKeyMissing(row: VllmHeaderRow): boolean {
    if (!row.enabled) {
      return false;
    }
    const key = String(row.key || '').trim();
    const value = String(row.value || '').trim();
    return !key && !!value;
  }

  isHeaderValueMissing(row: VllmHeaderRow): boolean {
    if (!row.enabled) {
      return false;
    }
    const key = String(row.key || '').trim();
    const value = String(row.value || '').trim();
    return !!key && !value;
  }

  addOrUpdateEndpoint(): void {
    this.flushPendingModel();

    const name = String(this.currentEndpoint.name || '').trim();
    const url = String(this.currentEndpoint.url || '').trim();
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

    if (this.hasIncompleteHeaders()) {
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

    const draftKey = String(this.currentEndpoint.apikey || '').trim();
    let apikeyProps = {};
    if (this.apiKeyIsReplacing) {
      if (draftKey && !isMaskedApikey(draftKey)) {
        apikeyProps = { apikey: draftKey };
      }
    } else if (this.isEditing && this.editingIndex >= 0) {
      const prev = String(this.servers[this.editingIndex]?.apikey || '').trim();
      if (prev) {
        apikeyProps = { apikey: prev };
      }
    } else if (draftKey && !isMaskedApikey(draftKey)) {
      apikeyProps = { apikey: draftKey };
    }

    const customHeaders = this.serializeCustomHeaders();
    const endpointToSave: VllmEndpoint = {
      name,
      url,
      models,
      ...apikeyProps,
      ...(customHeaders.length ? { customHeaders } : {}),
    };

    this.dialogRef.close({ endpoint: endpointToSave });
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

  canSubmit(): boolean {
    const pendingModel = String(this.newModelName || '').trim();
    const modelsCount = this.normalizeModels(this.currentEndpoint.models).length;
    return !!String(this.currentEndpoint.name || '').trim()
      && !!String(this.currentEndpoint.url || '').trim()
      && (modelsCount > 0 || !!pendingModel)
      && !this.hasIncompleteHeaders();
  }

  private hasIncompleteHeaders(): boolean {
    return this.headerRows.some((row) => this.isHeaderKeyMissing(row) || this.isHeaderValueMissing(row));
  }

  private serializeCustomHeaders(): VllmCustomHeader[] {
    return this.headerRows
      .map((row) => ({
        key: String(row.key || '').trim(),
        value: String(row.value || '').trim(),
        enabled: !!row.enabled,
      }))
      .filter((header) => !!header.key && !!header.value);
  }

  private mapStoredHeadersToRows(headers: VllmCustomHeader[] | undefined): VllmHeaderRow[] {
    if (!Array.isArray(headers) || !headers.length) {
      return [];
    }
    return headers
      .map((header) => ({
        key: String(header?.key || '').trim(),
        value: String(header?.value || '').trim(),
        // Legacy headers without `enabled` default to on.
        enabled: header?.enabled !== false,
      }))
      .filter((row) => !!row.key && !!row.value);
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
    return this.servers.some((endpoint: VllmEndpoint, index: number) =>
      index !== this.editingIndex && this.normalizeValue(endpoint.name) === normalizedName
    );
  }

  private hasDuplicateUrl(url: string): boolean {
    const normalizedUrl = this.normalizeValue(url);
    return this.servers.some((endpoint: VllmEndpoint, index: number) =>
      index !== this.editingIndex && this.normalizeValue(endpoint.url) === normalizedUrl
    );
  }
}
