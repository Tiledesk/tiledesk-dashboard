import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Form, Intent } from '../../../models/intent-model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
@Component({
  selector: 'appdashboard-panel-intent',
  templateUrl: './panel-intent.component.html',
  styleUrls: ['./panel-intent.component.scss']
})


export class PanelIntentComponent implements OnInit, OnChanges {
  // objectKeys = Object.keys;
  @Input() intentSelected: Intent;
  @Input() isOpenActionDrawer: boolean = false;

  @Output() openActionDrawer = new EventEmitter();
  @Output() answerSelected = new EventEmitter();
  @Output() actionSelected = new EventEmitter();
  @Output() intentForm = new EventEmitter();
  @Output() questionSelected = new EventEmitter();

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

    // this.actions = this.intentSelected.actions
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes.intentSelected) {
      if (changes.intentSelected.firstChange === false) {
        console.log('[PANEL INTENT] (ngOnChanges) changes', changes);
        console.log('[PANEL INTENT] (ngOnChanges) changes intentSelected currentValue', changes.intentSelected.currentValue);
        console.log('[PANEL INTENT] (ngOnChanges) changes intentSelected previousValue', changes.intentSelected.previousValue);
        console.log('[PANEL INTENT] (ngOnChanges) changes intentSelected firstChange', changes.intentSelected.firstChange);
        if (changes.intentSelected.previousValue._id !== changes.intentSelected.currentValue._id) {
          this.HAS_SELECTED_ANSWER = false
          this.HAS_SELECTED_QUESTION = false
          this.HAS_SELECTED_FORM = false
          this.HAS_SELECTED_ACTION = false
        }
      }
    }

    if (this.intentSelected) {
      console.log('[PANEL INTENT] (ngOnChanges) intentSelected', this.intentSelected);
      this.actions = this.intentSelected.actions;
      
      console.log('[PANEL INTENT] (ngOnChanges) actions', this.actions);
      if (this.intentSelected && this.intentSelected.question) {
        const question_segment = this.intentSelected.question.split('\\n');
        console.log('[PANEL INTENT] question_segment', question_segment);
      }
      this.question = this.intentSelected.question;
      console.log('[PANEL INTENT] (ngOnChanges) question: ', this.question);
      // if (this.HAS_SELECTED_QUESTION) {
      //   this.onSelectQuestion()
      // }
      this.answer = this.intentSelected.answer;
      console.log('[PANEL INTENT] (ngOnChanges) answer: ', this.answer);
      // if (this.HAS_SELECTED_ANSWER) {
      //   this.onSelectAnswer()
      // }
      this.form = this.intentSelected.form;
      if (this.form && this.form !== undefined) {
        this.formSize = Object.keys(this.form).length;
      } else {
        this.formSize = 0;
      }

      console.log('[PANEL INTENT] (ngOnChanges) form: ', this.form);
      console.log('[PANEL INTENT] (ngOnChanges) form size: ', this.formSize);
      // if (this.HAS_SELECTED_ANSWER) {
      //   this.onSelectAnswer()
      // }

      this.webhook_enabled = this.intentSelected.webhook_enabled;
      console.log('[PANEL INTENT] webhook_enabled: ', this.webhook_enabled);


    } else {
      console.log('[PANEL INTENT] actions - OPS! intentSelected ', this.intentSelected)
    }
    // console.log('[PANEL INTENT] actions', this.actions)
    // console.log('[PANEL INTENT] intentSelected', this.intentSelected)
    console.log('[PANEL INTENT] *** ->  isOpenActionDrawer', this.isOpenActionDrawer)
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

  onActionSelected(action) {
    this.HAS_SELECTED_ANSWER = false
    this.HAS_SELECTED_QUESTION = false
    this.HAS_SELECTED_FORM = false
    this.HAS_SELECTED_ACTION = true
    console.log('[PANEL INTENT] onActionSelected ', action)
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
  }

}
