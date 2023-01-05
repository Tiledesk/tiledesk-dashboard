import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { Intent } from '../../../models/intent-model';
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
  actions: Array<any>
  question: string;
  answer: string;
  webhook_enabled: boolean;
  displayActions: boolean = true


  constructor() { }

  ngOnInit(): void {

    // this.actions = this.intentSelected.actions
  }

  ngOnChanges() {
    if (this.intentSelected) {
      this.actions = this.intentSelected.actions;
      console.log('[PANEL INTENT] actions', this.actions);
      this.question = this.intentSelected.question;
      console.log('[PANEL INTENT] question', this.question);
      this.answer = this.intentSelected.answer;
      console.log('[PANEL INTENT] answer', this.answer);
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

  onDeleteAction() {
    console.log('[PANEL INTENT] onDeleteAction')
  }

}
