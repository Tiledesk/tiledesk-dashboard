import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ViewChild, ElementRef, OnChanges } from '@angular/core';
import { Action, Form, Intent } from 'app/models/intent-model';
import { Subject, Subscription } from 'rxjs';

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
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StageService } from 'app/chatbot-design-studio/services/stage.service';


export enum HAS_SELECTED_TYPE {
  ANSWER = "HAS_SELECTED_ANSWER",
  QUESTION = "HAS_SELECTED_QUESTION",
  FORM = "HAS_SELECTED_FORM",
  ACTION = "HAS_SELECTED_ACTION",
}

@Component({
  selector: 'cds-intent',
  templateUrl: './cds-intent.component.html',
  styleUrls: ['./cds-intent.component.scss']
})


export class CdsIntentComponent implements OnInit {
  @Input() intent: Intent;

  @Output() questionSelected = new EventEmitter(); // !!! SI PUO' ELIMINARE
  @Output() answerSelected = new EventEmitter(); // !!! SI PUO' ELIMINARE
  @Output() formSelected = new EventEmitter(); // !!! SI PUO' ELIMINARE
  @Output() actionSelected = new EventEmitter(); // !!! SI PUO' ELIMINARE

  @Output() showPanelActions = new EventEmitter(); // nk
  @Output() onTestItOut = new EventEmitter();
  @ViewChild('openActionMenuBtn', { static: false }) openActionMenuBtnRef: ElementRef;

  // subscriptionBehaviorIntent: Subscription;
  subscriptions: Array<{key: string, value: Subscription}> = [];
  private unsubscribe$: Subject<any> = new Subject<any>();
  // intentElement: any;
  // idSelectedAction: string;
  // form: Form;
  formSize: number = 0;
  // question: any;
  // answer: string; // !!! SI PUO' ELIMINARE
  questionCount: number = 0;

  listOfActions: Action[];
  HAS_SELECTED_TYPE = HAS_SELECTED_TYPE;
  TYPE_ACTION = TYPE_ACTION;
  ACTIONS_LIST = ACTIONS_LIST;
  elementTypeSelected: HAS_SELECTED_TYPE
  isOpen: boolean = true;
  menuType: string = 'action';
  positionMenu: any;

  isStart = false;
  startAction: any;
  isDragging: boolean = false;
  isLiveActive: boolean = false;
  actionDragPlaceholderWidth: number;
  hideActionDragPlaceholder: boolean;

  constructor(
    private logger: LoggerService,
    public intentService: IntentService,
    private connectorService: ConnectorService,
    private stageService: StageService
    // private controllerService: ControllerService,
  ) {
      this.initSubscriptions()
   }

  initSubscriptions(){

    let subscribtion: any;
    let subscribtionKey: string;

    /** SUBSCRIBE TO THE INTENT CREATED OR UPDATED */
    subscribtionKey = 'behaviorIntent';
    subscribtion = this.subscriptions.find(item => item.key === subscribtionKey);
    if(!subscribtion){
      subscribtion = this.intentService.behaviorIntent.pipe(takeUntil(this.unsubscribe$)).subscribe(intent => {
        if (intent && this.intent && intent.intent_id === this.intent.intent_id) {
          console.log("[CDS-INTENT] sto modifico l'intent: ",  this.intent , " con : ", intent );
          this.intent = intent;
  
          if(intent['attributesChanged']){
            console.log("[CDS-INTENT] ho solo cambiato la posizione sullo stage");
            delete intent['attributesChanged'];
          } else { // if(this.intent.actions.length !== intent.actions.length && intent.actions.length>0)
            console.log("[CDS-INTENT] aggiorno le actions dell'intent");
            this.listOfActions = this.intent.actions;
            // AGGIORNO I CONNETTORI
            // this.intentService.updateIntent(this.intent); /// DEVO ELIMINARE UPDATE DA QUI!!!!!
          }
  
          //UPDATE QUESTIONS
          if (this.intent.question) {
            const question_segment = this.intent.question.split(/\r?\n/).filter(element => element);
            this.questionCount = question_segment.length;
            // this.question = this.intent.question;
          } else{
            this.questionCount = 0
          }
          //UPDATE FORM
          if (this.intent && this.intent.form !== undefined) {
            this.formSize = Object.keys(this.intent.form).length;
          } else {
            this.formSize = 0;
          }
        }
      });
      const subscribe = {key: subscribtionKey, value: subscribtion };
      this.subscriptions.push(subscribe);
    }

    /** SUBSCRIBE TO THE INTENT LIVE SELECTED FROM TEST SITE */
    subscribtionKey = 'intentLiveActive';
    subscribtion = this.subscriptions.find(item => item.key === subscribtionKey);
    if(!subscribtion){
      subscribtion = this.intentService.liveActiveIntent.pipe(takeUntil(this.unsubscribe$)).subscribe(intent => {
        this.isLiveActive = false
        if (intent && this.intent && intent.intent_id === this.intent.intent_id) {
          var stageElement = document.getElementById(intent.intent_id);
          this.isLiveActive = true
          this.stageService.centerStageOnTopPosition(stageElement)
        }
      });
      const subscribe = {key: subscribtionKey, value: subscribtion };
      this.subscriptions.push(subscribe);
    }

  }

  ngOnInit(): void {
    // console.log('CdsPanelIntentComponent ngAfterViewInit-->');
    this.setIntentSelected();
    if(this.intent.actions && this.intent.actions.length === 1 && this.intent.actions[0]._tdActionType === TYPE_ACTION.INTENT && this.intent.intent_display_name === 'start'){
      this.startAction = this.intent.actions[0];
      if(!this.startAction._tdActionId){
        this.startAction = patchActionId(this.intent.actions[0]);
        this.intent.actions = [this.startAction];
      }
      this.isStart = true;
    }
  }

  ngOnDestroy(){
    this.unsubscribe(); 
  }

  unsubscribe() {
    // if (this.subscriptionBehaviorIntent) {
    //   this.subscriptionBehaviorIntent.unsubscribe();
    // }
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /** CUSTOM FUNCTIONS  */
  private setIntentSelected(){
    this.listOfActions = null;
    this.formSize = 0;
    this.questionCount = 0;
    try {
      if (this.intent) {
        this.patchAllActionsId();
        this.patchAttributesPosition();
        this.listOfActions = this.intent.actions;
        // this.form = this.intent.form;
        // this.actions = this.intent.actions;
        // this.answer = this.intent.answer;
        if (this.intent.question) {
          const question_segment = this.intent.question.split(/\r?\n/).filter(element => element);
          this.questionCount = question_segment.length;
          // this.question = this.intent.question;
        } 
      }
      if (this.intent && this.intent.form !== undefined) {
        this.formSize = Object.keys(this.intent.form).length;
      } else {
        this.formSize = 0;
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
    if(this.listOfActions && this.listOfActions.length>0){
      this.listOfActions.forEach(function(action, index, object) {
        if(!action._tdActionId){
          object[index] = patchActionId(action);
        }
      });
    }
  }

  /**
   * patchAttributesPosition
   * retrocompatibility patch.
   */
  private patchAttributesPosition() {
    if (!this.intent.attributes || !this.intent.attributes.position) {
      this.intent['attributes'] = {};
    }
    if (!this.intent.attributes.position) {
      this.intent.attributes['position'] = { 'x': 0, 'y': 0 };
    }
  }


  /** getActionParams
   * Get action parameters from a map to create the header (title, icon) 
   * */
  getActionParams(action) {
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
      console.error("[CDS-INTENT] getActionParams ERROR: ", error);
      return;
    }
  }

  /** updateIntent 
   * service updateIntent is async
   * !!! the response from the service is NOT handled!!!
  */
  private async updateIntent() {
    const response = await this.intentService.updateIntent(this.intent);
    if (response) {
      console.log('updateIntent: ', this.intent);
    }
  }

  /*********************************************/


  /** EVENTS  */

  onSelectAction(action, index: number, idAction) {
    console.log('[CDS-INTENT] onActionSelected action: ', action, );
    this.elementTypeSelected = idAction;
    this.intentService.setIntentSelected(this.intent);
    this.intentService.selectAction(this.intent.intent_id, idAction);
    this.actionSelected.emit({ action: action, index: index, maxLength: this.listOfActions.length });
  }

  // onSelectAnswer(elementSelected) {
  //   this.elementTypeSelected = elementSelected;
  //   // this.isIntentElementSelected = true;
  //   this.answerSelected.emit(this.answer);
  // }

  onSelectQuestion(elementSelected) {
    console.log('[CDS-INTENT] onSelectQuestion-->', elementSelected, this.intent.question)
    this.elementTypeSelected = elementSelected;
    this.intentService.selectIntent(this.intent.intent_id)
    // this.isIntentElementSelected = true;
    this.questionSelected.emit(this.intent.question);
  }

  onSelectForm(elementSelected) {
    // this.isIntentElementSelected = true;
    this.elementTypeSelected = elementSelected;
    this.intentService.selectIntent(this.intent.intent_id)
    if (this.intent && !this.intent.form) {
      let newForm = new Form()
      this.intent.form = newForm;
    }
    this.formSelected.emit(this.intent.form);
  }

  onClickControl(event: 'delete' | 'edit', action: Action, index: number){
    console.log('[CDS-INTENT] onClickControl', event)
    if(event === 'edit'){
      this.onSelectAction(action, index, action._tdActionId)
    }else if(event === 'delete'){
      this.intentService.selectAction(this.intent.intent_id, action._tdActionId)
      this.intentService.deleteSelectedAction();
    }
  }

  /**
   * onKeydown
   * delete selected action by keydown backspace
   * */
  onKeydown(event) {
    console.log('[CDS-INTENT] onKeydown: ', event);
    if (event.key === 'Backspace' || event.key === 'Escape' || event.key === 'Canc') {
      this.intentService.deleteSelectedAction();
    }
  }

  /** !!! IMPORTANT 
   * when the drag of an action starts, I save the starting intent. 
   * Useful in case I move an action between different intents 
  * */
  onDragStarted(event, previousIntentId) {
    console.log('[CDS-INTENT] onDragStarted event ', event , 'previousIntentId ',  previousIntentId);
    this.intentService.setPreviousIntentId(previousIntentId);

    
    console.log('[CDS-INTENT] onDragStarted isDragging', this.isDragging)
    const actionDragPlaceholder = <HTMLElement>document.querySelector('.action-drag-placeholder');
    console.log('[CDS-INTENT] onDragStarted actionDragPlaceholder', actionDragPlaceholder)
    // const actionDragPlaceholderWidth = actionDragPlaceholder.offsetWidth;
    // console.log('[CDS-INTENT] onDragStarted actionDragPlaceholderWidth', actionDragPlaceholderWidth)
    const myObserver = new ResizeObserver(entries => {
      // this will get called whenever div dimension changes
       entries.forEach(entry => {
        this.actionDragPlaceholderWidth  = entry.contentRect.width
         console.log('[CDS-INTENT] width', this.actionDragPlaceholderWidth);
        if (this.actionDragPlaceholderWidth === 258) {
          this.hideActionDragPlaceholder = false;
          console.log('[CDS-INTENT] Hide action drag placeholder', this.hideActionDragPlaceholder);
          // actionDragPlaceholder.style.opacity = 1;
          // actionDragPlaceholder.classList.add("cdk-action-placeholder");
        }  else {
          this.hideActionDragPlaceholder = true;
          console.log('[CDS-INTENT] Hide action drag placeholder', this.hideActionDragPlaceholder);
          // actionDragPlaceholder.style.display = 'none';
          // actionDragPlaceholder.classList.remove("cdk-action-placeholder");
        }

         console.log('height', entry.contentRect.height);
       });
     });
  
     myObserver.observe(actionDragPlaceholder);
  }

  /** onDragEnded
   * get the action moved and update its connectors */
  onDragEnded(event) {
    console.log('[CDS-INTENT] onDragEnded: ', event);
    this.isDragging = false;
    console.log('[CDS-INTENT] onDragEnded isDragging', this.isDragging)
    // const fromEle = document.getElementById(this.intent.intent_id);
    // this.connectorService.movedConnector(fromEle);
  }

  /** on Drop Action check the three possible cases:
   * chaimata quando muovo la action in un intent
   * 1 - moving action in the same intent 
   * 2 - moving action from another intent
   * 3 - moving new action in intent from panel elements
   */
  async onDropAction(event: CdkDragDrop<string[]>) {
    console.log('[CDS-INTENT] onDropAction: ', event);
    // console.log('event:', event, 'previousContainer:', event.previousContainer, 'event.container:', event.container);
    if (event.previousContainer === event.container) {
      // moving action in the same intent
      console.log("[CDS-INTENT]sto spostando una action all'interno dello stesso intent: ", event);
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      console.log("[CDS-INTENT] aggiorno l'intent");
      const response = await this.intentService.updateIntent(this.intent);
      if(response){
        this.connectorService.movedConnector(this.intent.intent_id);
      }
    } else {
      try {
        let action: any = event.previousContainer.data[event.previousIndex];
        if(event.previousContainer.data.length>1){
          if (action._tdActionType) {
            // moving action from another intent
            console.log("[CDS-INTENT] sposto la action tra 2 intent differenti");
            this.intentService.moveActionBetweenDifferentIntents(event, action, this.intent.intent_id);
          } else if (action.value && action.value.type) {
            // moving new action in intent from panel elements
            console.log("[CDS-INTENT] aggiungo una nuova action all'intent da panel elements");
            this.intentService.moveNewActionIntoIntent(event, action, this.intent.intent_id);
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  /**  onUpdateAndSaveAction: 
   * function called by all actions in @output whenever they are modified!
   * 1 - update connectors
   * 2 - update intent
   * */
  public async onUpdateAndSaveAction(event) {
    console.log('[CDS-INTENT] onUpdateAndSaveAction:::: ', event, this.intent, this.intent.actions);
    const response = await this.intentService.updateIntent(this.intent);
    if (response) {
      console.log('updateIntent: ', this.intent);
    }
    // const fromEle = document.getElementById(this.intent.intent_id);
    // if(fromEle){
    //   this.connectorService.movedConnector(fromEle);
    //   this.updateIntent();
    // }
  }


  openActionMenu(intent: any, calleBy: string) {
    console.log('[CDS-INTENT] openActionMenu > intent ', intent)
    console.log('[CDS-INTENT] openActionMenu > calleBy ', calleBy)
    const openActionMenuElm = this.openActionMenuBtnRef.nativeElement.getBoundingClientRect()
    let xOffSet = 157
    if (calleBy === 'add-action-placeholder') {
     xOffSet = 277
    }
    let buttonXposition = openActionMenuElm.x + xOffSet // 157 
    let buttonYposition = openActionMenuElm.y // - 10
    console.log('[CDS-INTENT] openActionMenu > openActionMenuBtnRef ', openActionMenuElm)
    console.log('[CDS-INTENT] openActionMenu > buttonXposition ', buttonXposition)
    const data = { 'x': buttonXposition, 'y': buttonYposition, 'intent': intent, 'addAction': true};
    this.showPanelActions.emit(data);
  }

  openTestSiteInPopupWindow() {
    this.onTestItOut.emit(true)
  }

}
