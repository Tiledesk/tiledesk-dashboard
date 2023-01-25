import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Form, Intent } from '../../../models/intent-model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Observable, Subscription } from 'rxjs';
@Component({
  selector: 'appdashboard-panel-intent',
  templateUrl: './panel-intent.component.html',
  styleUrls: ['./panel-intent.component.scss']
})


export class PanelIntentComponent implements OnInit, OnChanges {
  // objectKeys = Object.keys;
  @Input() intentSelected: Intent;
  @Input() isOpenActionDrawer: boolean = false;
  @Input() events: Observable<any>;
  private updatedIntentSubscription: Subscription;
  @Output() openActionDrawer = new EventEmitter();
  @Output() answerSelected = new EventEmitter();
  @Output() actionSelected = new EventEmitter();
  @Output() intentForm = new EventEmitter();
  @Output() questionSelected = new EventEmitter();
  @Output() actionDeleted = new EventEmitter();

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



  constructor() { }

  ngOnInit(): void {
// this.listenToIntentUpdates();
    // this.actions = this.intentSelected.actions
  }

  listenToIntentUpdates(){
   
    this.events.subscribe((intent: Intent) => {
      console.log("[PANEL-INTENT] LISTEN TO INTENTS UPDATES ", intent)
      
    
    })
  }


  ngOnChanges(changes: SimpleChanges) {

    if (changes.intentSelected) {
      if (changes.intentSelected.firstChange === false) {
        // console.log('[PANEL INTENT] (ngOnChanges) changes', changes);
        // console.log('[PANEL INTENT] (ngOnChanges) changes intentSelected currentValue', changes.intentSelected.currentValue);
        // console.log('[PANEL INTENT] (ngOnChanges) changes intentSelected previousValue', changes.intentSelected.previousValue);
        // console.log('[PANEL INTENT] (ngOnChanges) changes intentSelected firstChange', changes.intentSelected.firstChange);
        if (changes.intentSelected.previousValue._id !== changes.intentSelected.currentValue._id) {
          this.HAS_SELECTED_ANSWER = false
          this.HAS_SELECTED_QUESTION = false
          this.HAS_SELECTED_FORM = false
          this.HAS_SELECTED_ACTION = false
        }
      }
    }

    if (this.intentSelected) {
      // console.log('[PANEL INTENT] (ngOnChanges) intentSelected', this.intentSelected);
      this.actions = this.intentSelected.actions;
      
      // console.log('[PANEL INTENT] (ngOnChanges) actions', this.actions);
      if (this.intentSelected && this.intentSelected.question) {
        // const question_segment = this.intentSelected.question.split(\n);
        // https://bobbyhadz.com/blog/javascript-split-string-by-newline
        
        // const question_segment = this.intentSelected.question.split(/\r?\n/).filter(element => element);
       
        // console.log('[PANEL INTENT] question_segment', question_segment);
      }
      this.question = this.intentSelected.question;
      // console.log('[PANEL INTENT] (ngOnChanges) question: ', this.question);
      // if (this.HAS_SELECTED_QUESTION) {
      //   this.onSelectQuestion()
      // }
      this.answer = this.intentSelected.answer;
      // console.log('[PANEL INTENT] (ngOnChanges) answer: ', this.answer);
      // if (this.HAS_SELECTED_ANSWER) {
      //   this.onSelectAnswer()
      // }
      this.form = this.intentSelected.form;
      if (this.form && this.form !== undefined) {
        this.formSize = Object.keys(this.form).length;
      } else {
        this.formSize = 0;
      }

      // console.log('[PANEL INTENT] (ngOnChanges) form: ', this.form);
      // console.log('[PANEL INTENT] (ngOnChanges) form size: ', this.formSize);
      // if (this.HAS_SELECTED_ANSWER) {
      //   this.onSelectAnswer()
      // }

      this.webhook_enabled = this.intentSelected.webhook_enabled;
      // console.log('[PANEL INTENT] webhook_enabled: ', this.webhook_enabled);


    } else {
      // console.log('[PANEL INTENT] actions - OPS! intentSelected ', this.intentSelected)
    }
    // console.log('[PANEL INTENT] actions', this.actions)
    // console.log('[PANEL INTENT] intentSelected', this.intentSelected)
    // console.log('[PANEL INTENT] *** ->  isOpenActionDrawer', this.isOpenActionDrawer)
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.actions, event.previousIndex, event.currentIndex);
  }

  toggleActions(_displayActions: boolean) {
    this.displayActions = _displayActions
    console.log('[PANEL INTENT] displayActions', this.displayActions)
  }

  openActionsDrawer() {
    this.isOpenActionDrawer = !this.isOpenActionDrawer
    console.log('[PANEL INTENT] isOpenActionDrawer', this.isOpenActionDrawer)
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

  onActionSelected(action, index) {
    this.HAS_SELECTED_ANSWER = false
    this.HAS_SELECTED_QUESTION = false
    this.HAS_SELECTED_FORM = false
    this.HAS_SELECTED_ACTION = true
    console.log('[PANEL INTENT] onActionSelected action: ', action)
    console.log('[PANEL INTENT] onActionSelected index', index)
    
    let elementsWithActiveClass = Array.from(document.getElementsByClassName('cds-action-active'));
    console.log('[PANEL INTENT] onActionSelected elementsWithActiveClass', elementsWithActiveClass)
    if (elementsWithActiveClass.length != 0) {
      elementsWithActiveClass.forEach((el) => {
        el.classList.remove('cds-action-active');
      })
    }

    const actionElement =  <HTMLElement>document.querySelector(`#action_${index}`);
    console.log('[PANEL INTENT] onActionSelected actionElement', actionElement)
    actionElement.classList.add("cds-action-active");


    this.actionSelected.emit(action);
  }


  displayForm() {
    this.HAS_SELECTED_ANSWER = false
    this.HAS_SELECTED_QUESTION = false
    this.HAS_SELECTED_FORM = true
    this.HAS_SELECTED_ACTION = false
    console.log('[PANEL INTENT] displayForm ')

    if (this.intentSelected && !this.intentSelected.form) {
      let newForm = new Form()
      this.intentSelected.form = newForm;

    }
    this.intentForm.emit(this.intentSelected.form);

  }

  onDeleteAction(actionindex) {
    console.log('[PANEL INTENT] onDeleteAction index', actionindex);
    console.log('[PANEL INTENT] onDeleteAction intentSelected', this.intentSelected);
    this.intentSelected.actions.splice(actionindex, 1); 
    this.actionDeleted.emit(true);
  }

}
