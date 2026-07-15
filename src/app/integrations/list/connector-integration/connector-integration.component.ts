import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IntegrationService } from 'app/services/integration.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { NotifyService } from 'app/core/notify.service';
import { TranslateService } from '@ngx-translate/core';

const Swal = require('sweetalert2');

export interface ConnectorEntry {
  name: string;
  baseUrl: string;
  addedAt?: number;
  actionCount?: number;
  triggerCount?: number;
}

@Component({
  selector: 'connector-integration',
  templateUrl: './connector-integration.component.html',
  styleUrls: ['./connector-integration.component.scss']
})
export class ConnectorIntegrationComponent implements OnInit {

  @Input() integration: any;
  @Output() onUpdateIntegration = new EventEmitter;
  @Output() onDeleteIntegration = new EventEmitter;

  currentEntry: ConnectorEntry = { name: '', baseUrl: '' };

  isLoadingManifest: boolean = false;
  manifestPreview: { connectorName: string, actionCount: number, triggerCount: number } | null = null;
  loadingBaseUrl: string = '';
  private previewedBaseUrl: string = '';

  constructor(
    private integrationService: IntegrationService,
    private logger: LoggerService,
    private notify: NotifyService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.logger.log('[INT-CONNECTOR] integration ', this.integration);
    if (!this.integration.value.items) {
      this.integration.value.items = [];
    }
  }

  resetForm(): void {
    this.currentEntry = { name: '', baseUrl: '' };
    this.manifestPreview = null;
    this.previewedBaseUrl = '';
  }

  onUrlChange(): void {
    if (this.manifestPreview && this.currentEntry.baseUrl !== this.previewedBaseUrl) {
      this.manifestPreview = null;
    }
  }

  previewManifest(): void {
    if (!this.currentEntry.baseUrl) {
      this.notify.showWidgetStyleUpdateNotification('Please enter a connector URL', 3, 'error');
      return;
    }

    this.isLoadingManifest = true;
    this.loadingBaseUrl = this.currentEntry.baseUrl;
    this.manifestPreview = null;

    this.integrationService.getConnectorManifest(this.currentEntry.baseUrl).subscribe(
      (response: any) => {
        const manifest = response && response.manifest;
        if (!manifest || !manifest.connector) {
          this.notify.showWidgetStyleUpdateNotification('No manifest found at this URL', 3, 'warning');
          this.isLoadingManifest = false;
          this.loadingBaseUrl = '';
          return;
        }

        this.manifestPreview = {
          connectorName: manifest.connector.name || this.currentEntry.baseUrl,
          actionCount: Array.isArray(manifest.actions) ? manifest.actions.length : 0,
          triggerCount: Array.isArray(manifest.triggers) ? manifest.triggers.length : 0
        };
        this.previewedBaseUrl = this.currentEntry.baseUrl;

        if (!this.currentEntry.name) {
          this.currentEntry.name = manifest.connector.name;
        }

        this.isLoadingManifest = false;
        this.loadingBaseUrl = '';
      },
      (error) => {
        this.logger.error('[INT-CONNECTOR] Error fetching manifest:', error);
        this.isLoadingManifest = false;
        this.loadingBaseUrl = '';
        const errorMessage = error?.error?.error || error?.message || 'Failed to fetch manifest from this URL';
        this.notify.showWidgetStyleUpdateNotification(errorMessage, 3, 'error');
      }
    );
  }

  addConnector(): void {
    if (!this.currentEntry.name || !this.currentEntry.baseUrl || !this.manifestPreview) {
      return;
    }

    const entry: ConnectorEntry = {
      name: this.currentEntry.name,
      baseUrl: this.currentEntry.baseUrl,
      addedAt: Date.now(),
      actionCount: this.manifestPreview.actionCount,
      triggerCount: this.manifestPreview.triggerCount
    };

    this.integration.value.items.push(entry);
    this.resetForm();
    this.save();
  }

  deleteConnector(entry: ConnectorEntry): void {
    Swal.fire({
      title: this.translate.instant('AreYouSure'),
      html: this.translate.instant('Integration.ConnectorWillBeDeleted', { serverName: entry.name }),
      icon: "warning",
      showCloseButton: false,
      showCancelButton: true,
      showConfirmButton: false,
      showDenyButton: true,
      denyButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
      focusConfirm: false,
      reverseButtons: true,
    }).then((result) => {
      if (result.isDenied) {
        const index = this.integration.value.items.findIndex((i: ConnectorEntry) => i.baseUrl === entry.baseUrl);
        if (index >= 0) {
          this.integration.value.items.splice(index, 1);
          this.save();
        }
      }
    });
  }

  private save(): void {
    this.onUpdateIntegration.emit({ integration: this.integration });
  }

}
