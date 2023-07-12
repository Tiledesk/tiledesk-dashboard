import { Component, Input, OnInit } from '@angular/core';
import { ActionWhatsappAttribute } from 'app/models/intent-model';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'cds-action-whatsapp-attribute',
  templateUrl: './action-whatsapp-attribute.component.html',
  styleUrls: ['./action-whatsapp-attribute.component.scss']
})
export class ActionWhatsappAttributeComponent implements OnInit {

  @Input() action: ActionWhatsappAttribute;

  constructor(
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
    this.logger.log("action: ", this.action);
    this.logger.debug("action.attribute: ", this.action.attributeName);
  }

  onSelectedAttribute(event) {
    this.action.attributeName = event.value;
    this.logger.debug("onSelectedAttribute event: ", this.action);
  }

}
