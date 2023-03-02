import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Form, Intent } from '../../../models/intent-model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Observable, Subscription } from 'rxjs';
import { ACTIONS_LIST, TYPE_ACTION } from 'app/chatbot-design-studio/utils';
import { LoggerService } from 'app/services/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'app/services/chat21-core/providers/logger/loggerInstance';
const swal = require('sweetalert');
@Component({
  selector: 'appdashboard-panel-intent',
  templateUrl: './panel-intent.component.html',
  styleUrls: ['./panel-intent.component.scss']
})


export class PanelIntentComponent implements OnInit, OnChanges {
  // objectKeys = Object.keys;
  @Input() intentSelected: Intent;
  @Input() isOpenActionDrawer: boolean = false;
  // @Input() events: Observable<any>;
  private updatedIntentSubscription: Subscription;
  @Output() saveIntent = new EventEmitter();
  @Output() openActionDrawer = new EventEmitter();
  @Output() answerSelected = new EventEmitter();
  @Output() actionSelected = new EventEmitter();
  @Output() intentForm = new EventEmitter();
  @Output() questionSelected = new EventEmitter();
  @Output() actionDeleted = new EventEmitter();
  @Input() eventUpadatedIntent: Observable<any>;
  @Input() eventCreateIntent: Observable<any>;
  actions: Array<any>
  question: any
  answer: string;
  webhook_enabled: boolean;
  displayActions: boolean = true
  form: Form;
  formSize: number;

  HAS_SELECTED_ANSWER = false
  HAS_SELECTED_QUESTION = false
  HAS_SELECTED_FORM = false
  HAS_SELECTED_ACTION = false

  TYPE_ACTION = TYPE_ACTION
  ACTIONS_LIST = ACTIONS_LIST

  private logger: LoggerService = LoggerInstance.getInstance();

  constructor() { }

  ngOnInit(): void {
    this.listenToIntentUpdates();
    // this.actions = this.intentSelected.actions
  }

  listenToIntentUpdates() {
    this.eventUpadatedIntent.subscribe((intent: Intent) => {
      this.logger.log("[PANEL-INTENT] LISTEN TO INTENTS UPDATES ", intent)
      // this.intentSelected = intent; 
    })
  }

  listenToIntentAdd() {
    this.eventCreateIntent.subscribe((intent: Intent) => {
      this.logger.log("[PANEL-INTENT] LISTEN TO INTENTS UPDATES ", intent)
      // 
    })
  }

  


  ngOnChanges(changes: SimpleChanges) {
    // this.logger.log('[PANEL INTENT] (ngOnChanges) - this.intentSelected', this.intentSelected);

    // this.logger.log("[PANEL INTENT]  (ngOnChanges) - this.intentSelected > actions: ", this.intentSelected.actions);
    // this.logger.log("[PANEL INTENT] (ngOnChanges) - this.intentSelected > actions length: ", this.intentSelected.actions.length);

    // let elementsActive = Array.from(document.getElementsByClassName('cds-action-active'));
    // this.logger.log('[PANEL INTENT] (ngOnChanges) - elementsActive', elementsActive);
    // this.logger.log('[PANEL INTENT] (ngOnChanges) - elementsActive length ', elementsActive.length);

    // this.HAS_SELECTED_FORM = false;
    // if (this.intentSelected.actions && this.intentSelected.actions.length > 0) {
    //   // this.logger.log('[PANEL INTENT] (ngOnChanges) - this.intentSelected Exist actions', this.intentSelected.actions[0])
    //   setTimeout(() => {
    //     const actionElement = <HTMLElement>document.querySelector(`#action_0`);
    //     // this.logger.log('[PANEL INTENT] onActionSelected actionElement', actionElement)
    //     if (actionElement) {
    //       actionElement.classList.add("cds-action-active");
    //     }
    //   }, 200);
    // }

    if (changes.intentSelected) {
      // this.logger.log('[PANEL INTENT] (ngOnChanges) - changes.intentSelected', changes.intentSelected)
      // if (!changes.intentSelected.currentValue['form']) {
       
        if (changes.intentSelected.currentValue['actions'] && changes.intentSelected.currentValue['actions'].length > 0) {
          // this.logger.log('[PANEL INTENT] (ngOnChanges) - this.intentSelected Exist actions', changes.intentSelected.currentValue['actions'][0])
          setTimeout(() => {
            const actionElement = <HTMLElement>document.querySelector(`#action_0`);
            // this.logger.log('[PANEL INTENT] onActionSelected actionElement', actionElement)
            if (actionElement) {
              actionElement.classList.add("cds-action-active");
            }
          }, 200);
        }
      // }
      if (changes.intentSelected.firstChange === false) {
        // this.logger.log('[PANEL INTENT] (ngOnChanges) changes', changes);
        // this.logger.log('[PANEL INTENT] (ngOnChanges) changes intentSelected currentValue', changes.intentSelected.currentValue);
        // this.logger.log('[PANEL INTENT] (ngOnChanges) changes intentSelected previousValue', changes.intentSelected.previousValue);
        // this.logger.log('[PANEL INTENT] (ngOnChanges) changes intentSelected firstChange', changes.intentSelected.firstChange);
        if (changes.intentSelected.previousValue._id !== changes.intentSelected.currentValue._id) {
          // this.saveIntent.emit(this.intentSelected);
          this.HAS_SELECTED_ANSWER = false
          this.HAS_SELECTED_QUESTION = false
          this.HAS_SELECTED_FORM = false
          this.HAS_SELECTED_ACTION = false
        }
      }
    }

    if (this.intentSelected) {
      // this.logger.log('[PANEL INTENT] (ngOnChanges) intentSelected', this.intentSelected);
      this.actions = this.intentSelected.actions;

      // this.logger.log('[PANEL INTENT] (ngOnChanges) actions', this.actions);
      if (this.intentSelected && this.intentSelected.question) {
        // const question_segment = this.intentSelected.question.split(\n);
        // https://bobbyhadz.com/blog/javascript-split-string-by-newline

        // const question_segment = this.intentSelected.question.split(/\r?\n/).filter(element => element);

        // this.logger.log('[PANEL INTENT] question_segment', question_segment);
      }
      this.question = this.intentSelected.question;
      // this.logger.log('[PANEL INTENT] (ngOnChanges) question: ', this.question);
      // if (this.HAS_SELECTED_QUESTION) {
      //   this.onSelectQuestion()
      // }
      this.answer = this.intentSelected.answer;
      // this.logger.log('[PANEL INTENT] (ngOnChanges) answer: ', this.answer);
      // if (this.HAS_SELECTED_ANSWER) {
      //   this.onSelectAnswer()
      // }
      this.form = this.intentSelected.form;
      if (this.form && this.form !== undefined) {
        this.formSize = Object.keys(this.form).length;
      } else {
        this.formSize = 0;
      }

      // this.logger.log('[PANEL INTENT] (ngOnChanges) form: ', this.form);
      // this.logger.log('[PANEL INTENT] (ngOnChanges) form size: ', this.formSize);
      // if (this.HAS_SELECTED_ANSWER) {
      //   this.onSelectAnswer()
      // }

      this.webhook_enabled = this.intentSelected.webhook_enabled;
      // this.logger.log('[PANEL INTENT] webhook_enabled: ', this.webhook_enabled);


    } else {
      // this.logger.log('[PANEL INTENT] actions - OPS! intentSelected ', this.intentSelected)
    }
    // this.logger.log('[PANEL INTENT] actions', this.actions)
    // this.logger.log('[PANEL INTENT] intentSelected', this.intentSelected)
    // this.logger.log('[PANEL INTENT] *** ->  isOpenActionDrawer', this.isOpenActionDrawer)
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.actions, event.previousIndex, event.currentIndex);
  }

  toggleActions(_displayActions: boolean) {
    this.displayActions = _displayActions
    this.logger.log('[PANEL INTENT] displayActions', this.displayActions)
  }

  openActionsDrawer() {
    this.isOpenActionDrawer = !this.isOpenActionDrawer
    this.logger.log('[PANEL INTENT] isOpenActionDrawer', this.isOpenActionDrawer)
    this.openActionDrawer.emit(this.isOpenActionDrawer);
  }

  onSelectQuestion() {
    this.HAS_SELECTED_ANSWER = false
    this.HAS_SELECTED_QUESTION = true
    this.HAS_SELECTED_FORM = false
    this.HAS_SELECTED_ACTION = false
    this.questionSelected.emit(this.intentSelected);
  }


  onSelectAnswer() {
    this.HAS_SELECTED_ANSWER = true
    this.HAS_SELECTED_QUESTION = false
    this.HAS_SELECTED_FORM = false
    this.HAS_SELECTED_ACTION = false
    this.answerSelected.emit(this.answer);
  }


  onActionSelected(action, index: number) {
    this.HAS_SELECTED_ANSWER = false
    this.HAS_SELECTED_QUESTION = false
    this.HAS_SELECTED_FORM = false
    this.HAS_SELECTED_ACTION = true
    this.logger.log('[PANEL INTENT] onActionSelected action: ', action)
    this.logger.log('[PANEL INTENT] onActionSelected index', index)

    let elementsWithActiveClass = Array.from(document.getElementsByClassName('cds-action-active'));
    this.logger.log('[PANEL INTENT] onActionSelected elementsWithActiveClass', elementsWithActiveClass)
    if (elementsWithActiveClass.length != 0) {
      elementsWithActiveClass.forEach((el) => {
        el.classList.remove('cds-action-active');
      })
    }

    const actionElement = <HTMLElement>document.querySelector(`#action_${index}`);
    this.logger.log('[PANEL INTENT] onActionSelected actionElement', actionElement)
    actionElement.classList.add("cds-action-active");


    this.actionSelected.emit(action);
    this.logger.log('[PANEL INTENT] onActionSelected ', action)
    this.actionSelected.emit({ action: action, index: index, maxLength: this.actions.length });
  }


  displayForm() {
    this.HAS_SELECTED_ANSWER = false
    this.HAS_SELECTED_QUESTION = false
    this.HAS_SELECTED_FORM = true
    this.HAS_SELECTED_ACTION = false
    this.logger.log('[PANEL INTENT] displayForm HAS_SELECTED_FORM ',  this.HAS_SELECTED_FORM )

    let activeElements = Array.from(document.getElementsByClassName('cds-action-active'));
    this.logger.log('[PANEL INTENT] activeElements', activeElements)
    activeElements.forEach((activeElement) => {
      this.logger.log('[PANEL INTENT] activeElement', activeElement)
      activeElement.classList.remove('cds-action-active');
    })

    if (this.intentSelected && !this.intentSelected.form) {
      let newForm = new Form()
      this.intentSelected.form = newForm;

    }
    this.intentForm.emit(this.intentSelected.form);

  }

  onDeleteAction(actionindex) {
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
        }

      });




  }

}
