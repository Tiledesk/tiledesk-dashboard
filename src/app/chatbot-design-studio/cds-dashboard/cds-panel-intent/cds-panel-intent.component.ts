import { Component, OnInit, HostListener, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Form, Intent, Action } from '../../../models/intent-model';

import { ACTIONS_LIST, TYPE_ACTION, patchActionId } from 'app/chatbot-design-studio/utils';
import { LoggerService } from 'app/services/logger/logger.service';
import { IntentService } from 'app/chatbot-design-studio/cds-services/intent.service'; 

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
  selector: 'cds-panel-intent',
  templateUrl: './cds-panel-intent.component.html',
  styleUrls: ['./cds-panel-intent.component.scss']
})

export class CdsPanelIntentComponent implements OnInit, OnChanges {
  // @HostListener('window:keydown', ['$event'])

  @Input() intent: Intent;
  @Output() selectAction = new EventEmitter();
  @Output() saveIntent = new EventEmitter();

  idSelectedAction: string;
  intentActionList: Array<any>;
  arrayActionsForDrop = [];

  HAS_SELECTED_TYPE = HAS_SELECTED_TYPE;
  TYPE_ACTION = TYPE_ACTION;
  ACTIONS_LIST = ACTIONS_LIST;
  

  constructor(
    private logger: LoggerService,
    public intentService: IntentService
  ) { }

  ngOnInit(): void { 
    // console.log('CdsPanelIntentComponent ngAfterViewInit-->');
  }

  ngAfterViewInit(){
    this.setIntentSelected();
  }
  
  ngOnChanges(changes: SimpleChanges){
    // console.log('CdsPanelIntentComponent ngAfterViewInit-->');
  }

  /** CUSTOM FUNCTIONS  */
  private setIntentSelected(){
    this.intentActionList = null;
    // console.log('CdsPanelIntentComponent setIntentSelected-->', this.intent);
    try {
      if (this.intent) {
        this.patchAllActionsId();
        this.intentActionList = this.intent.actions;
      }
    } catch (error) {
      this.logger.error("error: ", error);
    }
  }

  private patchAllActionsId(){
    if(this.intentActionList && this.intentActionList.length>0){
      this.intentActionList.forEach(function(action, index, object) {
        if(!action._tdActionId){
          object[index] = patchActionId(action);
        }
      });
    }
  }

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
    //const oggettoAzione = TYPE_ACTION.find(item => item.type === 'azione');
  }


  /** EVENTS  */
  onDropAction(event: CdkDragDrop<string[]>) {
    // console.log('event:', event, 'previousContainer:', event.previousContainer, 'event.container:', event.container);
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      try {
        let actionType: any = event.previousContainer.data[event.previousIndex];
        let newAction = this.intentService.createAction(actionType.value.type);
        this.intentActionList.splice(event.currentIndex, 0, newAction);
        // console.log('intentActionList:', this.intentActionList);
      } catch (error) {
        console.error(error);
      }
    }
    this.intent.actions = this.intentActionList;
    this.saveIntent.emit(this.intent);
  }

  onSelectAction(idAction) {
    console.log('onSelectAction: ', idAction);
    this.idSelectedAction = idAction;
    this.selectAction.emit(idAction);
  }
  
  onDeleteAction(event: any) {
    console.log('onDeleteAction:::: ' , event, event.key);
    if (event.key === 'Delete' || event.key === 'Backspace') {
      this.intentActionList = this.intentActionList.filter(item => item._tdActionId !== this.idSelectedAction);
      this.intent.actions = this.intentActionList;
      this.saveIntent.emit(this.intent);
    }
  }
  

}
