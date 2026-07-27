import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LoggerService } from 'app/services/logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { ConnectorEntry } from '../connector-integration/connector-integration.component';

const Swal = require('sweetalert2');

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
    private translate: TranslateService
  ) { }

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
