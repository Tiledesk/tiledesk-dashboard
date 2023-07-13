import { Component, Input, OnInit } from '@angular/core';
import { ELEMENTS_LIST } from 'app/chatbot-design-studio/utils';
import { Action } from 'app/models/intent-model';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'cds-action-description',
  templateUrl: './cds-action-description.component.html',
  styleUrls: ['./cds-action-description.component.scss']
})
export class CdsActionDescriptionComponent implements OnInit {

  @Input() actionSelected: Action;
  @Input() elementType: string;
  
  element: any;
  dataInput: string;

  constructor(
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
    console.log('ActionDescriptionComponent ngOnInit:: ', this.actionSelected, this.elementType);
    // if(this.elementSelected){
    //   this.elementType = TYPE_INTENT_ELEMENT.FORM;
    // } else {
    //   this.elementType = this.actionSelected._tdActionType;
    // }
    if(this.actionSelected){
      this.elementType = this.actionSelected._tdActionType;
    }
    try {
      this.element = ELEMENTS_LIST.find(item => item.type === this.elementType);
      if(this.actionSelected._tdActionTitle && this.actionSelected._tdActionTitle != ""){
        this.dataInput = this.actionSelected._tdActionTitle;
      }
      console.log('ActionDescriptionComponent action:: ', this.element);
    } catch (error) {
      this.logger.log("error ", error);
    }
  }

}
