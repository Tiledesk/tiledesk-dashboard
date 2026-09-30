import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoggerService } from 'app/services/logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { VllmEndpoint } from './vllm-endpoint-table/vllm-endpoint-table.component';
import {
  VllmEndpointDialogComponent,
  VllmEndpointDialogResult,
} from './vllm-endpoint-dialog/vllm-endpoint-dialog.component';

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

  constructor(
    private logger: LoggerService,
    private translate: TranslateService,
    private dialog: MatDialog,
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

  openAddEndpointDialog(): void {
    this.openEndpointDialog({
      isEditing: false,
      editingIndex: -1,
      servers: this.integration.value.servers || [],
    });
  }

  onSelectEndpoint(endpoint: VllmEndpoint): void {
    this.logger.log('[INT-vLLM] Endpoint selected:', endpoint);
    const index = this.findEndpointIndex(endpoint);
    if (index < 0) {
      return;
    }

    this.openEndpointDialog({
      isEditing: true,
      editingIndex: index,
      endpoint: {
        name: endpoint.name,
        url: endpoint.url,
        apikey: endpoint.apikey || '',
        models: [...(endpoint.models || [])],
        customHeaders: Array.isArray(endpoint.customHeaders)
          ? endpoint.customHeaders.map((h) => ({
              key: h.key,
              value: h.value,
              enabled: h.enabled !== false,
            }))
          : [],
      },
      servers: this.integration.value.servers || [],
    });
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

  saveIntegration(): void {
    this.sanitizeIntegrationValue();
    const data = {
      integration: this.integration,
    };
    this.logger.log('[INT-vLLM] saveIntegration ', this.integration);
    this.onUpdateIntegration.emit(data);
  }

  private openEndpointDialog(data: {
    isEditing: boolean;
    editingIndex: number;
    endpoint?: VllmEndpoint;
    servers: VllmEndpoint[];
  }): void {
    const dialogRef = this.dialog.open(VllmEndpointDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      autoFocus: false,
      position: { top: '60px' },
      data,
    });

    dialogRef.afterClosed().subscribe((result?: VllmEndpointDialogResult) => {
      if (!result?.endpoint) {
        return;
      }

      const endpointToSave = result.endpoint;
      if (data.isEditing && data.editingIndex >= 0) {
        this.integration.value.servers = this.integration.value.servers.map(
          (endpoint: VllmEndpoint, index: number) =>
            index === data.editingIndex ? endpointToSave : endpoint,
        );
        this.logger.log('[INT-vLLM] Updated endpoint at index', data.editingIndex);
      } else {
        this.integration.value.servers = [...this.integration.value.servers, endpointToSave];
        this.logger.log('[INT-vLLM] Added new endpoint');
      }

      this.saveIntegration();
    });
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
    const customHeaders = this.normalizeCustomHeaders(endpoint?.customHeaders);

    return {
      name,
      url,
      models,
      ...(apikey ? { apikey } : {}),
      ...(customHeaders.length ? { customHeaders } : {}),
    };
  }

  private normalizeCustomHeaders(headers: VllmEndpoint['customHeaders']): VllmEndpoint['customHeaders'] {
    if (!Array.isArray(headers)) {
      return [];
    }
    return headers
      .map((header) => ({
        key: String(header?.key || '').trim(),
        value: String(header?.value || '').trim(),
        enabled: header?.enabled !== false,
      }))
      .filter((header) => !!header.key && !!header.value);
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

  private findEndpointIndex(endpoint: VllmEndpoint): number {
    const normalizedName = this.normalizeValue(endpoint.name);
    const normalizedUrl = this.normalizeValue(endpoint.url);

    return this.integration.value.servers.findIndex((item: VllmEndpoint) =>
      this.normalizeValue(item.name) === normalizedName &&
      this.normalizeValue(item.url) === normalizedUrl
    );
  }
}
