import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HubMe } from 'app/services/connector-hub.service';

// Shell: the register-a-connector UI is built in Task 5.
@Component({
  selector: 'connector-integration',
  template: ''
})
export class ConnectorIntegrationComponent {
  @Input() me: HubMe;
  @Output() onChanged = new EventEmitter<void>();
}
