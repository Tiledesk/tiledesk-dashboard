import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { Form, Intent } from '../../../models/intent-model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
@Component({
  selector: 'appdashboard-panel-intent',
  templateUrl: './panel-intent.component.html',
  styleUrls: ['./panel-intent.component.scss']
})


export class PanelIntentComponent implements OnInit, OnChanges {
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
  form: Form

  HAS_SELECTED_ANSWER = false
  HAS_SELECTED_QUESTION = false
  HAS_SELECTED_FORM = false
  HAS_SELECTED_ACTION = false



  constructor() { }

  ngOnInit(): void {

    // this.actions = this.intentSelected.actions
  }

  ngOnChanges() {
    if (this.intentSelected) {
      this.actions = this.intentSelected.actions;
      console.log('[PANEL INTENT] actions', this.actions);
      if (this.intentSelected && this.intentSelected.question) {
        const question_segment = this.intentSelected.question.split('\\n');
        console.log('[PANEL INTENT] question_segment', question_segment);
      }
      this.question = this.intentSelected.question;
      console.log('[PANEL INTENT] question', this.question);
      if (this.HAS_SELECTED_QUESTION) {
        this.onSelectQuestion()
      }
      this.answer = this.intentSelected.answer;
      console.log('[PANEL INTENT] answer', this.answer);
      this.form = this.intentSelected.form;
      console.log('[PANEL INTENT] form', this.form);
      this.webhook_enabled = this.intentSelected.webhook_enabled;
      console.log('[PANEL INTENT] webhook_enabled', this.webhook_enabled);


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

  onDeleteAction() {
    console.log('[PANEL INTENT] onDeleteAction')
  }

}
