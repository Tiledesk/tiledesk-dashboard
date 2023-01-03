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

  @Input() isOpenActionDrawer: boolean;
  @Output() openActionDrawer = new EventEmitter();
  actions: Array<any>
  displayActions: boolean = false


  constructor() { }

  ngOnInit(): void {
    this.actions = this.intentSelected.actions
  }

  ngOnChanges() {
    this.actions = this.intentSelected.actions
    console.log('PANEL INTENT actions', this.actions)
    console.log('PANEL INTENT intentSelected', this.intentSelected)
    console.log('PANEL INTENT isOpenActionDrawer', this.isOpenActionDrawer)
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.actions, event.previousIndex, event.currentIndex);
  }

  toggleActions(_displayActions: boolean) {
    this.displayActions = _displayActions
    console.log('PANEL INTENT displayActions', this.displayActions)
  }

  openActionsDrawer(actionDrawerIsOpen: boolean) {
    console.log('PANEL INTENT openDrawerAddAction', actionDrawerIsOpen)
    this.openActionDrawer.emit(actionDrawerIsOpen);
  }

}
