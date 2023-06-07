import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Form, Intent } from '../../../models/intent-model';

// import { Observable, Subscription } from 'rxjs';
import { ACTIONS_LIST, TYPE_ACTION, patchActionId } from 'app/chatbot-design-studio/utils';
import { LoggerService } from 'app/services/logger/logger.service';
import { IntentService } from 'app/chatbot-design-studio/cds-services/intent.service'; 

const swal = require('sweetalert');
import {
  CdkDragDrop,
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

  arrayActionsForDrop = [];
  
  @Input() listOfActions:  Array<{ name: string, value: string, icon?: string }>;
  @Input() idSelected: string;
  @Input() intentSelected: Intent;
  @Input() isIntentElementSelected: boolean = false;
  @Input() isOpenActionDrawer: boolean = false;

  
  @Output() openActionDrawer = new EventEmitter();
  @Output() questionSelected = new EventEmitter();
  @Output() answerSelected = new EventEmitter();
  @Output() actionSelected = new EventEmitter();
  @Output() intentForm = new EventEmitter();
  @Output() actionDeleted = new EventEmitter();
  @Output() dropAction = new EventEmitter();


  HAS_SELECTED_TYPE = HAS_SELECTED_TYPE;
  TYPE_ACTION = TYPE_ACTION;
  ACTIONS_LIST = ACTIONS_LIST;
  form: Form;
  formSize: number;
  actions: Array<any>;
  question: any;
  answer: string;
  questionCount: number;
  // webhook_enabled: boolean;
  displayActions: boolean = true
  // idSelected:  string;
  isDeleting: boolean = false;

  constructor(
    private logger: LoggerService,
    public intentService:IntentService
  ) { }

  ngOnInit(): void {
    // this.listenToIntentUpdates();
    // console.log('CdsPanelIntentComponent ngOnInit-->', this.intentSelected)
    // this.actions = this.intentSelected.actions
    // setTimeout(() => {
    //   let el = document.getElementById("panel-intent-content");
    //   //document.getElementById("panel-intent-content").addEventListener("ondragstart", dragElement);
    //   console.log('******** dragElement:: el', el);
    //   setDragElement(el);
    // }, 1000);

    // imposto le coordinate
    this.setIntentSelected();
  }



  ngAfterViewInit(){
    // console.log('CdsPanelIntentComponent ngAfterViewInit-->');
  }
  
  private patchAllActionsId(){
    if(this.actions && this.actions.length>0){
      this.actions.forEach(function(action, index, object) {
        if(!action._tdActionId){
          object[index] = patchActionId(action);
        }
      });
    }
    // console.log('patchAllActionsId:: ', this.actions);
  }

  // listenToIntentUpdates() {
  //   this.eventUpadatedIntent.subscribe((intent: Intent) => {
  //     this.logger.log("[PANEL-INTENT] LISTEN TO INTENTS UPDATES ", intent)
  //     this.intentSelected = intent; 
  //   })
  // }

  // listenToIntentAdd() {
  //   this.eventCreateIntent.subscribe((intent: Intent) => {
  //     this.logger.log("[PANEL-INTENT] LISTEN TO INTENTS UPDATES ", intent)
  //   })
  // }




  ngOnChanges(changes: SimpleChanges){
    //this.setIntentSelected();
  }

  

  private setIntentSelected(){
    this.form = null;
    this.formSize = 0;
    this.actions = null;
    this.answer = null;
    this.question = null;
    this.questionCount = 0;
    // console.log('CdsPanelIntentComponent setIntentSelected-->', this.idSelected);
    try {
      if (this.intentSelected) {
        this.patchAllActionsId();
        this.form = this.intentSelected.form;
        this.actions = this.intentSelected.actions;
        this.answer = this.intentSelected.answer;
        if (this.intentSelected.question) {
          const question_segment = this.intentSelected.question.split(/\r?\n/).filter(element => element);
          this.questionCount = question_segment.length;
          this.question = this.intentSelected.question;
        } 
        // this.webhook_enabled = this.intentSelected.webhook_enabled;
      }
      if (this.form && this.form !== undefined) {
        this.formSize = Object.keys(this.form).length;
      } else {
        this.formSize = 0;
      }
    } catch (error) {
      this.logger.error("error: ", error);
    }
    // console.log('PanelIntentComponent questionCount , question -->', this.questionCount, this.question);
  }

  onDropAction(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.actions, event.previousIndex, event.currentIndex);
    this.dropAction.emit(this.actions);
  }

  toggleActions(_displayActions: boolean) {
    this.displayActions = _displayActions
    this.logger.log('[PANEL INTENT] displayActions', this.displayActions)
  }

  openActionsDrawer() {
    this.idSelected = null; 
    this.isOpenActionDrawer = !this.isOpenActionDrawer
    this.logger.log('[PANEL INTENT] isOpenActionDrawer', this.isOpenActionDrawer)
    this.openActionDrawer.emit(this.isOpenActionDrawer);
  }

  onSelectQuestion(elementSelected) {
    console.log('onSelectQuestion-->', elementSelected, this.intentSelected.question)
    this.idSelected = elementSelected;
    this.isIntentElementSelected = true;
    this.questionSelected.emit(this.intentSelected.question);
    // this.HAS_SELECTED_ANSWER = false
    // this.HAS_SELECTED_QUESTION = true
    // this.HAS_SELECTED_FORM = false
    // this.HAS_SELECTED_ACTION = false
    
    // let elementsWithActiveClass = Array.from(document.getElementsByClassName('cds-action-active'));
    // this.logger.log('[PANEL INTENT] onActionSelected elementsWithActiveClass', elementsWithActiveClass)
    // if (elementsWithActiveClass.length != 0) {
    //   elementsWithActiveClass.forEach((el) => {
    //     el.classList.remove('cds-action-active');
    //   })
    // }
  }


  onSelectAnswer(elementSelected) {
    this.idSelected = elementSelected;
    this.isIntentElementSelected = true;
    // this.HAS_SELECTED_ANSWER = true
    // this.HAS_SELECTED_QUESTION = false
    // this.HAS_SELECTED_FORM = false
    // this.HAS_SELECTED_ACTION = false
    this.answerSelected.emit(this.answer);
  }



  onActionSelected(action, index: number, idAction) {
    console.log('onActionSelected action: ', action);
    if(this.isDeleting){return;}
    this.idSelected = idAction;
    this.isIntentElementSelected = true;
    // this.HAS_SELECTED_ANSWER = false
    // this.HAS_SELECTED_QUESTION = false
    // this.HAS_SELECTED_FORM = false
    // this.HAS_SELECTED_ACTION = true
   
    // this.logger.log('[PANEL INTENT] onActionSelected action: ', action)
    // this.logger.log('[PANEL INTENT] onActionSelected index', index)

    // let elementsWithActiveClass = Array.from(document.getElementsByClassName('cds-action-active'));
    // this.logger.log('[PANEL INTENT] onActionSelected elementsWithActiveClass', elementsWithActiveClass)
    // if (elementsWithActiveClass.length != 0) {
    //   elementsWithActiveClass.forEach((el) => {
    //     el.classList.remove('cds-action-active');
    //   })
    // }

    // const actionElement = <HTMLElement>document.querySelector(`#action_${index}`);
    // this.logger.log('[PANEL INTENT] onActionSelected actionElement', actionElement)
    // actionElement.classList.add("cds-action-active");

    // console.log('NN CAPISCO PERCHè 2 emit verifica !!! action: ', action);
    // this.actionSelected.emit(action);
    // this.logger.log('[PANEL INTENT] onActionSelected ', action)
    this.actionSelected.emit({ action: action, index: index, maxLength: this.actions.length });
  }


  onDisplayForm(elementSelected) {
    this.idSelected = elementSelected;
    this.isIntentElementSelected = true;
    if (this.intentSelected && !this.intentSelected.form) {
      let newForm = new Form()
      this.intentSelected.form = newForm;
    }
    this.intentForm.emit(this.intentSelected.form);
  }

  onDeleteAction(actionindex) {
    this.isDeleting = true;
    console.log('onDeleteAction:::: ' , actionindex);
    swal({
      title: "Are you sure",
      text: "The action will be deleted",
      icon: "warning",
      buttons: ["Cancel", "Delete"],
      dangerMode: false,
    })
    .then((willdelete) => {
      this.logger.log('[PANEL INTENT] onDeleteAction willdelete', willdelete)
      if (willdelete) {
        this.logger.log('[PANEL INTENT] onDeleteAction index', actionindex);
        this.logger.log('[PANEL INTENT] onDeleteAction intentSelected', this.intentSelected);
        this.intentSelected.actions.splice(actionindex, 1);
        this.actionDeleted.emit(true);
        // this.saveIntent.emit(this.intentSelected);
      }
      this.isDeleting = false;
    });
  }



  drop(event: CdkDragDrop<string[]>) {
    console.log('event:', event, 'previousContainer:', event.previousContainer, 'event.container:', event.container);
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      try {
        let actionType: any = event.previousContainer.data[event.previousIndex];
        // transferArrayItem(
        //   event.previousContainer.data,
        //   event.container.data,
        //   event.previousIndex,
        //   event.currentIndex
        // );

        let newAction = this.intentService.createAction(actionType.value.type)
        // let newAction = CreateNewAction(actionType.value.type);
        this.actions.splice(event.currentIndex, 0, newAction);
      } catch (error) {
        console.error(error);
      }
      
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
  

}
