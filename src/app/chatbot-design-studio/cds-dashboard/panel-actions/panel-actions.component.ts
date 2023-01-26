import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';

import { TYPE_ACTION, TYPE_COMMAND } from '../../utils';
import { ActionCondition, ActionAgent, ActionClose, 
         ActionReply, Intent, Command, 
         Message, ActionIntentConnected, ActionEmail, 
         ActionWait, ActionAssignVariable, ActionDeleteVariable, 
         ActionOnlineAgent, ActionOpenHours, ActionReplaceBot, 
         ActionChangeDepartment, ActionHideMessage } from 'app/models/intent-model';


@Component({
  selector: 'appdashboard-panel-actions',
  templateUrl: './panel-actions.component.html',
  styleUrls: ['./panel-actions.component.scss']
})
export class PanelActionsComponent implements OnInit, OnChanges {
  @Input() isOpenActionDrawer: boolean;
  @Input() intentSelected: Intent
  @Output() openActionDrawer = new EventEmitter();

  // @ViewChild('drawer' ,{ static: false }) drawer: MatDrawer

  typeAction = TYPE_ACTION;

  constructor() { }

  ngOnInit(): void {

  }

  ngOnChanges() {

    if (this.isOpenActionDrawer === true) {
      this.isOpenActionDrawer = true
    } else if (this.isOpenActionDrawer === false) {
      this.isOpenActionDrawer = false
    }

    // console.log('[PANEL ACTION] isOpenActionDrawer ', this.isOpenActionDrawer)
    // console.log('[PANEL ACTION] intentSelected ', this.intentSelected)


    // if (this.isOpenActionDrawer === true)  {
    //   this.drawer.open()
    // } else if (this.isOpenActionDrawer === false)  {
    //   this.drawer.close()
    // }
  }

  closeActionsDrawer() {
    this.isOpenActionDrawer = false
    this.openActionDrawer.emit(this.isOpenActionDrawer);
  }

  actionSelected(typeAction: string) {
    console.log('[PANEL ACTION] actionSelected ', typeAction);
    if(typeAction === TYPE_ACTION.REPLY){
      let action = new ActionReply();
      let commandWait = new Command(TYPE_COMMAND.WAIT);
      action.attributes.commands.push(commandWait);
      let command = new Command(TYPE_COMMAND.MESSAGE);
      command.message = new Message('text', 'A chat message will be sent to the visitor');
      console.log('1 action:  ', action)
      console.log('2 command:  ', command)
      action.attributes.commands.push(command);
      this.intentSelected.actions.push(action);
    }
    if(typeAction === TYPE_ACTION.AGENT){
      let action = new ActionAgent();
      this.intentSelected.actions.push(action);
    }
    if(typeAction === TYPE_ACTION.CLOSE){
      let action = new ActionClose();
      this.intentSelected.actions.push(action);
    }
    if(typeAction === TYPE_ACTION.WAIT){
      let action = new ActionWait();
      this.intentSelected.actions.push(action);
    }
    if(typeAction === TYPE_ACTION.INTENT) {
      let action = new ActionIntentConnected()
      this.intentSelected.actions.push(action)
    }
    if(typeAction === TYPE_ACTION.EMAIL) {
      let action = new ActionEmail()
      this.intentSelected.actions.push(action);
    }
    if(typeAction === TYPE_ACTION.CONDITION){
      let action = new ActionCondition();
      this.intentSelected.actions.push(action);
    }
    if(typeAction === TYPE_ACTION.ASSIGN_VARIABLE){
      let action = new ActionAssignVariable();
      this.intentSelected.actions.push(action);
    }
    if(typeAction === TYPE_ACTION.DELETE_VARIABLE){
      let action = new ActionDeleteVariable();
      this.intentSelected.actions.push(action);
    }
    if(typeAction === TYPE_ACTION.ONLINE_AGENTS){
      let action = new ActionOnlineAgent();
      this.intentSelected.actions.push(action);
    }
    if(typeAction === TYPE_ACTION.OPEN_HOURS){
      let action = new ActionOpenHours();
      this.intentSelected.actions.push(action);
    }
    if(typeAction === TYPE_ACTION.REPLACE_BOT){
      let action = new  ActionReplaceBot();
      this.intentSelected.actions.push(action);
    }
    if(typeAction === TYPE_ACTION.CHANGE_DEPARTMENT) {
      let action = new  ActionChangeDepartment();
      this.intentSelected.actions.push(action);
    }
    if(typeAction === TYPE_ACTION.HIDE_MESSSAGE){
      let action = new ActionHideMessage();
      this.intentSelected.actions.push(action);
    }
    
  }

}