import { Component, Input } from '@angular/core';
import { HubConnector, HubMe } from 'app/services/connector-hub.service';

// Shell: the Connections tab is built in Task 7.
@Component({
  selector: 'connector-connections',
  template: ''
})
export class ConnectorConnectionsComponent {
  @Input() connector: HubConnector;
  @Input() me: HubMe;
}
