import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Intent, Button, ActionReply, Action } from '../../../models/intent-model';
import { TYPE_INTENT_ELEMENT } from '../../utils';


@Component({
  selector: 'appdashboard-panel-intent-detail',
  templateUrl: './panel-intent-detail.component.html',
  styleUrls: ['./panel-intent-detail.component.scss']
})
export class PanelIntentDetailComponent implements OnInit {
  @Output() openButtonPanel = new EventEmitter();
  @Input() intentSelected: Intent;
  @Input() showSpinner: boolean;

  typeIntentElement = TYPE_INTENT_ELEMENT;
  typeIntentElementSelected: string;

  openCardButton = false;
  buttonSelected: Button;

  actionReplay: ActionReply;


  constructor() { }

  ngOnInit(): void {
    this.typeIntentElementSelected = TYPE_INTENT_ELEMENT.RESPONSE;

    // this.intentSelected.actions.forEach(element => {
    //   if(element.type === 'reply'){
    //     this.actionReplay = element.content;
    //   }
    // });

    this.actionReplay = new ActionReply();
    let action = new Action();
    action.type = 'reply';
    action.content = this.actionReplay;
    this.intentSelected.actions = [action];
    console.log('ngOnInit Actions ---->', this.intentSelected.actions);
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
