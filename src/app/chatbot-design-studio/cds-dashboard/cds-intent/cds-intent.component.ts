import { Component, OnInit, Input} from '@angular/core';
import { Intent } from 'app/models/intent-model';

import { ACTIONS_LIST, TYPE_ACTION, patchActionId } from 'app/chatbot-design-studio/utils';
import { LoggerService } from 'app/services/logger/logger.service';
import { IntentService } from 'app/chatbot-design-studio/services/intent.service'; 
// import { ControllerService } from 'app/chatbot-design-studio/services/controller.service';
import { ConnectorService } from 'app/chatbot-design-studio/services/connector.service';


import {
  CdkDragDrop,
  CdkDragHandle,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';


export enum HAS_SELECTED_TYPE {
  ANSWER = "HAS_SELECTED_ANSWER",
  QUESTION = "HAS_SELECTED_QUESTION",
  FORM = "HAS_SELECTED_FORM",
  ACTION = "HAS_SELECTED_ACTION",
}

// declare function setDragElement(el);
@Component({
  selector: 'cds-intent',
  templateUrl: './cds-intent.component.html',
  styleUrls: ['./cds-intent.component.scss']
})

export class CdsIntentComponent implements OnInit {
  @Input() intent: Intent;

  // intentElement: any;
  // idSelectedAction: string;
  // arrayActionsForDrop = [];

  intentActionList: Array<any>;
  HAS_SELECTED_TYPE = HAS_SELECTED_TYPE;
  TYPE_ACTION = TYPE_ACTION;
  ACTIONS_LIST = ACTIONS_LIST;
  

  constructor(
    private logger: LoggerService,
    public intentService: IntentService,
    private connectorService: ConnectorService
    // private controllerService: ControllerService,
    
  ) {
    /** SUBSCRIBE TO THE INTENT CREATED OR UPDATED */
    this.intentService.intent.subscribe(intent => {
      if(intent && this.intent && intent.intent_id === this.intent.intent_id ){
        this.intent = intent;
        this.intentActionList = this.intent.actions;
        console.log('intent created / updated ::: ',  this.intent);
      }
    });
   }

  ngOnInit(): void { 
    // console.log('CdsPanelIntentComponent ngAfterViewInit-->');
  }

  ngAfterViewInit(){
    this.setIntentSelected();
  }


  ngOnDestroy() {
  }

  /** CUSTOM FUNCTIONS  */
  private setIntentSelected(){
    this.intentActionList = null;
    try {
      if (this.intent) {
        this.patchAllActionsId();
        this.intentActionList = this.intent.actions;
      }
    } catch (error) {
      this.logger.error("error: ", error);
    }
  }


  /** patchAllActionsId
   * retrocompatibility patch.
   * Check if the action has a ._tdActionId attribute
   * otherwise it generates it on the fly */
  private patchAllActionsId(){
    if(this.intentActionList && this.intentActionList.length>0){
      this.intentActionList.forEach(function(action, index, object) {
        if(!action._tdActionId){
          object[index] = patchActionId(action);
        }
      });
    }
  }

  /** getActionParams
   * Get action parameters from a map to create the header (title, icon) 
   * */
  getActionParams(action){
    const enumKeys = Object.keys(TYPE_ACTION);
    let keyAction = '';
    try {
      for (const key of enumKeys) {
        if (TYPE_ACTION[key] === action._tdActionType) {
          keyAction = key;
          return ACTIONS_LIST[keyAction];
        }
      }
      return;
    } catch (error) {
      console.error("ERROR: ", error);
      return;
    }
  }

  /** updateIntent 
   * service updateIntent is async
   * !!! the response from the service is NOT handled!!!
  */
  private async updateIntent(){
    const response = await this.intentService.updateIntent(this.intent);
    if(response){
      console.log('updateIntent: ', this.intent);
    }
  }

  /*********************************************/


  /** EVENTS  */

  /** !!! IMPORTANT 
   * when the drag of an action starts, I save the starting intent. 
   * Useful in case I move an action between different intents 
  * */ 
  onDragStarted(event, previousIntentId){
    console.log('onDragStarted: ', previousIntentId);
    this.intentService.setPreviousIntentId(previousIntentId);
  }

  /** onDragEnded
   * get the action moved and update its connectors */
  onDragEnded(event){
    console.log('onDragEnded: ', event);
    const fromEle = document.getElementById(this.intent.intent_id);
    this.connectorService.movedConnector(fromEle);
  }

  /** on Drop Action check the three possible cases:
   * 1 - moving action in the same intent 
   * 2 - moving action from another intent
   * 3 - moving new action in intent from panel elements
   */
  async onDropAction(event: CdkDragDrop<string[]>) {
    console.log('onDropAction: ', event);
    // console.log('event:', event, 'previousContainer:', event.previousContainer, 'event.container:', event.container);
    if (event.previousContainer === event.container) {
      // moving action in the same intent
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      const response = await this.intentService.updateIntent(this.intent);
      // if(response) console.log('updateIntent: OK', this.intent);
    } else {
      try {
        let action: any = event.previousContainer.data[event.previousIndex];
        if(action._tdActionType){
          // moving action from another intent
          this.intentService.moveActionBetweenDifferentIntents(event, action, this.intent.intent_id);
        } else if(action.value && action.value.type) {
          // moving new action in intent from panel elements
          this.intentService.moveNewActionIntoIntent(event, action, this.intent.intent_id);
        }
      } catch (error) {
        console.error(error);
      }
    }
    // update the intent connectors
    const fromEle = document.getElementById(this.intent.intent_id);
    this.connectorService.movedConnector(fromEle);
  }


  /** onSelectAction */
  onSelectAction(idAction) {
    console.log('onSelectAction: ', idAction);
    this.intentService.selectAction(this.intent.intent_id, idAction);
  }
  
  /**  onUpdateAndSaveAction: 
   * function called by all actions in @output whenever they are modified!
   * 1 - update connectors
   * 2 - update intent
   * */
  onUpdateAndSaveAction() {
    console.log('onUpdateAndSaveAction:::: ' , this.intent, this.intent.actions);
    const fromEle = document.getElementById(this.intent.intent_id);
    this.connectorService.movedConnector(fromEle);
    this.updateIntent();
  }

}