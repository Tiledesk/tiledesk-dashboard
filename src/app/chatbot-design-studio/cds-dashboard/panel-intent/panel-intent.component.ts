import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Form, Intent } from '../../../models/intent-model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
// import { Observable, Subscription } from 'rxjs';
import { ACTIONS_LIST, TYPE_ACTION, patchActionId } from 'app/chatbot-design-studio/utils';
import { LoggerService } from 'app/services/logger/logger.service';
const swal = require('sweetalert');

export enum HAS_SELECTED_TYPE {
  ANSWER = "HAS_SELECTED_ANSWER",
  QUESTION = "HAS_SELECTED_QUESTION",
  FORM = "HAS_SELECTED_FORM",
  ACTION = "HAS_SELECTED_ACTION",
}

@Component({
  selector: 'appdashboard-panel-intent',
  templateUrl: './panel-intent.component.html',
  styleUrls: ['./panel-intent.component.scss']
})

export class PanelIntentComponent implements OnInit, OnChanges {
  @Input() idSelected: string;
  @Input() intentSelected: Intent;
  @Input() isIntentElementSelected: boolean = false;
  @Input() isOpenActionDrawer: boolean = false;
  // @Input() eventUpadatedIntent: Observable<any>;
  // @Input() eventCreateIntent: Observable<any>;
  // @Input() events: Observable<any>;
  // private updatedIntentSubscription: Subscription;
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
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
    // this.listenToIntentUpdates();
    this.logger.log('PanelIntentComponent ngOnInit-->', this.intentSelected)
    // this.actions = this.intentSelected.actions
    this.setIntentSelected();
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
    this.setIntentSelected();
  }

  

  private setIntentSelected(){
    this.form = null;
    this.formSize = 0;
    this.actions = null;
    this.answer = null;
    this.question = null;
    this.questionCount = 0;
    this.logger.log('PanelIntentComponent ngOnChanges-->', this.idSelected);
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
    this.logger.log('[PANEL INTENT] onSelectQuestion-->', elementSelected, this.intentSelected.question)
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
    this.logger.log('[PANEL INTENT] onActionSelected action: ', action);
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
    // this.HAS_SELECTED_ANSWER = false
    // this.HAS_SELECTED_QUESTION = false
    // this.HAS_SELECTED_FORM = true
    // this.HAS_SELECTED_ACTION = false
    // this.logger.log('[PANEL INTENT] displayForm HAS_SELECTED_FORM ', this.HAS_SELECTED_FORM)
    // let activeElements = Array.from(document.getElementsByClassName('cds-action-active'));
    // this.logger.log('[PANEL INTENT] activeElements', activeElements)
    // activeElements.forEach((activeElement) => {
    //   this.logger.log('[PANEL INTENT] activeElement', activeElement)
    //   activeElement.classList.remove('cds-action-active');
    // })
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
    this.logger.log('[PANEL INTENT] onDeleteAction:::: ' , actionindex);
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

}
