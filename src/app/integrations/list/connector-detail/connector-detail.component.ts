import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HubConnector, HubMe } from 'app/services/connector-hub.service';

// Shell: Details + Connections tabs are built in Task 6.
@Component({
  selector: 'connector-detail',
  template: ''
})
export class ConnectorDetailComponent {
  @Input() connector: HubConnector;
  @Input() me: HubMe;
  @Output() onChanged = new EventEmitter<void>();
}
