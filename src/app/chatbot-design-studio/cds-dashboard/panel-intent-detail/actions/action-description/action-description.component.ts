import { ACTIONS_LIST2 } from './../../../../utils';
import { Component, Input, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { Action } from 'app/models/intent-model';
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
  @Input() showTip: boolean = false;

  @Output() closeIntent = new EventEmitter();
  @Output() saveIntent = new EventEmitter();

  constructor(
    private logger: LoggerService
  ) { 
  }

  titlePlaceholder: string = 'set a title to your action...';
  actionType: string;
  action: any;
  dataInput: string;
  
  ngOnInit(): void {
    try {
      this.actionType = this.actionSelected._tdActionType;
      this.action = ACTIONS_LIST2.find(item => item.type === this.actionType);
      if(this.actionSelected._tdActionTitle && this.actionSelected._tdActionTitle != ""){
        this.dataInput = this.actionSelected._tdActionTitle;
      }
    } catch (error) {
      this.logger.log("error ", error);
    }
  }

  onChangeText(text: string){
    console.log('ActionDescriptionComponent onChangeText:: ', text);
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
