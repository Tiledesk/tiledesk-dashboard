import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoggerService } from 'app/services/logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { ConnectorEntry } from '../connector-integration/connector-integration.component';
import { ConnectorItemsModalComponent } from './connector-items-modal/connector-items-modal.component';

const Swal = require('sweetalert2');

const DEFAULT_CONNECTOR_ICON = 'assets/img/int/connector-icon.svg';

@Component({
  selector: 'connector-detail',
  templateUrl: './connector-detail.component.html',
  styleUrls: ['./connector-detail.component.scss']
})
export class ConnectorDetailComponent {

  @Input() integration: any;
  @Input() connectorItem: ConnectorEntry;
  @Output() onUpdateIntegration = new EventEmitter();

  constructor(
    private logger: LoggerService,
    private translate: TranslateService,
    private dialog: MatDialog
  ) { }

  get iconUrl(): string {
    return (this.connectorItem && this.connectorItem.icon) || DEFAULT_CONNECTOR_ICON;
  }

  onIconError(event: Event): void {
    (event.target as HTMLImageElement).src = DEFAULT_CONNECTOR_ICON;
  }

  hasActions(): boolean {
    return !!(this.connectorItem && this.connectorItem.actions && this.connectorItem.actions.length);
  }

  hasTriggers(): boolean {
    return !!(this.connectorItem && this.connectorItem.triggers && this.connectorItem.triggers.length);
  }

  openActionsModal(): void {
    if (!this.hasActions()) {
      return;
    }
    this.dialog.open(ConnectorItemsModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '80vh',
      data: {
        title: this.translate.instant('Actions'),
        items: this.connectorItem.actions,
        groups: this.connectorItem.groups
      }
    });
  }

  openTriggersModal(): void {
    if (!this.hasTriggers()) {
      return;
    }
    this.dialog.open(ConnectorItemsModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '80vh',
      data: {
        title: this.translate.instant('Triggers'),
        items: this.connectorItem.triggers,
        groups: this.connectorItem.groups
      }
    });
  }

  deleteConnector(): void {
    if (!this.connectorItem) {
      return;
    }

    Swal.fire({
      title: this.translate.instant('AreYouSure'),
      html: this.translate.instant('Integration.ConnectorWillBeDeleted', { serverName: this.connectorItem.name }),
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
        const index = this.integration.value.items.findIndex((i: ConnectorEntry) => i.baseUrl === this.connectorItem.baseUrl);
        if (index >= 0) {
          this.integration.value.items.splice(index, 1);
          this.logger.log('[CONNECTOR-DETAIL] deleted connector', this.connectorItem.baseUrl);
          this.onUpdateIntegration.emit({ integration: this.integration });
        }
      }
    });
  }

}
