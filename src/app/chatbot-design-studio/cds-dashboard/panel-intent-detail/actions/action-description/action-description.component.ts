import { ELEMENTS_LIST, TYPE_INTENT_ELEMENT } from './../../../../utils';
import { Component, Input, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { Action, Form } from 'app/models/intent-model';
import { SatPopover } from '@ncstate/sat-popover';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'cds-action-description',
  templateUrl: './action-description.component.html',
  styleUrls: ['./action-description.component.scss']
})
export class ActionDescriptionComponent implements OnInit {

  @ViewChild("descriptionTooltip") popover : SatPopover;

  @Input() actionSelected: Action;
  @Input() elementType: string;
  @Input() showTip: boolean = false;

  @Output() closeIntent = new EventEmitter();
  @Output() saveIntent = new EventEmitter();

  constructor(
    private logger: LoggerService
  ) { 
  }

  titlePlaceholder: string = 'set a title to your action...';
  element: any;
  dataInput: string;
  
  ngOnInit(): void {
    this.logger.log('ActionDescriptionComponent ngOnInit:: ', this.actionSelected);
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
      this.logger.log('ActionDescriptionComponent action:: ', this.element);
    } catch (error) {
      this.logger.log("error ", error);
    }
  }

  onChangeText(text: string){
    this.logger.log('ActionDescriptionComponent onChangeText:: ', text);
    this.actionSelected._tdActionTitle = text;
  }


  manageTooltip(){
    this.popover.toggle()
    // setTimeout(() => {
    //   // this.popover.close()
    // }, 3000);
  }

  onCloseIntent(){
    this.closeIntent.emit();
  }

  onSaveIntent(){
    this.saveIntent.emit();
  }

}
