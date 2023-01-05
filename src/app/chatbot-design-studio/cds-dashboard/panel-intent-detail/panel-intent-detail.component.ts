import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AnyARecord } from 'dns';
import { Intent, Button, ActionReply, Action } from '../../../models/intent-model';
import { TYPE_INTENT_ELEMENT } from '../../utils';


@Component({
  selector: 'appdashboard-panel-intent-detail',
  templateUrl: './panel-intent-detail.component.html',
  styleUrls: ['./panel-intent-detail.component.scss']
})
export class PanelIntentDetailComponent implements OnInit {
  @Output() openButtonPanel = new EventEmitter();

  @Input() listOfActions: Array<string>;
  @Input() elementIntentSelected: any;
  @Input() showSpinner: boolean;

  typeIntentElement = TYPE_INTENT_ELEMENT;
  elementSelected: any;
  elementIntentSelectedType: string;


  openCardButton = false;
  buttonSelected: Button;

  constructor() { }

  ngOnInit(): void {
    try {
      this.elementIntentSelectedType = this.elementIntentSelected.type;
      this.elementSelected = this.elementIntentSelected.element;
    } catch (error) {
      console.log('onAddNewResponse ERROR', error);
    }

    
  }

  // EVENT FUNCTIONS //



  
  /** appdashboard-tools: add new response **/
  // onAddNewResponse(element){
  //   try {
      
  //     // this.intentSelected.reply.attributes.commands.push(element);
  //     this.intentSelected.actions.push(element);
  //     console.log('onAddNewResponse---->', this.intentSelected.actions);
  //   } catch (error) {
  //     console.log('onAddNewResponse ERROR', error);
  //   }
  // }



    /** appdashboard-intent: Open button panel */
    onOpenButtonPanel(event){
      console.log('onOpenButtonPanel :: ', event);
      if(this.openCardButton === true){
        this.onCloseButtonPanel();
      }
      this.buttonSelected = event;
      this.openCardButton = true;
    }
  
    /** appdashboard-button-configuration-panel: Save button */
    onSaveButton(button){ 
      this.openCardButton = false;
    }
  
    /** appdashboard-button-configuration-panel: Close button panel */
    onCloseButtonPanel(){
      this.openCardButton = false;
    }

}
