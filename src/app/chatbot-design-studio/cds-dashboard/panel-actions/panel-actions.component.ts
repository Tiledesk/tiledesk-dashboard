import { ACTIONS_LIST } from './../../utils';
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild, HostListener } from '@angular/core';

import { TYPE_ACTION, TYPE_COMMAND } from '../../utils';
import { ActionAgent, ActionClose, ActionWebRequest,
         ActionReply, ActionRandomReply, Intent, Command, 
         Message, ActionIntentConnected, ActionEmail, 
         ActionWait, ActionAssignVariable, ActionDeleteVariable, 
         ActionOnlineAgent, ActionOpenHours, ActionReplaceBot, 
         ActionChangeDepartment, ActionHideMessage, ActionJsonCondition, Expression } from 'app/models/intent-model';
import { LoggerService } from 'app/services/logger/logger.service';


@Component({
  selector: 'appdashboard-panel-actions',
  templateUrl: './panel-actions.component.html',
  styleUrls: ['./panel-actions.component.scss']
})
export class PanelActionsComponent implements OnInit, OnChanges {

  @ViewChild('panel_actions_div') panel_actions_div: ElementRef;

  // @Input() isOpenActionDrawer: boolean;
  @Input() intentSelected: Intent
  @Output() openActionDrawer = new EventEmitter();

  TYPE_ACTION = TYPE_ACTION
  ACTIONS_LIST = ACTIONS_LIST

  constructor(
    private logger: LoggerService,
    private eRef: ElementRef
  ) { }

  ngOnInit(): void {

  }

  ngAfterViewInit(){
    this.logger.log('focussss', this.panel_actions_div)
    this.panel_actions_div.nativeElement.focus();
  }


  @HostListener('document:click', ['$event'])
  clickout(event) {
    //   console.log('[SIDEBAR-USER-DETAILS] clickout event.target)', event.target)
    //  console.log('[SIDEBAR-USER-DETAILS] clickout event.target.id)', event.target.id)
    //  console.log('[SIDEBAR-USER-DETAILS] clickout event.target.className)', event.target.classList)
    const clicked_element_id = event.target.id
    console.log("clicked_element_id: ", clicked_element_id);
    if (this.eRef.nativeElement.contains(event.target)) {
      // console.log("clicked inside")
    } else {

      // const elSidebarUserDtls = <HTMLElement>document.querySelector('#user-details');
      // console.log('[SIDEBAR-USER-DETAILS] clicked outside elSidebarUserDtls ', elSidebarUserDtls)

      //console.log('[SIDEBAR-USER-DETAILS] HAS_CLICKED_OPEN_USER_DETAIL ', this.HAS_CLICKED_OPEN_USER_DETAIL)
      // && (!event.target.classList.contains('ng-option'))
      // clicked_element_id !== 'a0da04ac7772' && 
      console.log("clicked_element_id.startsWith(actions-btns-wpr)", clicked_element_id.startsWith("actions-btns-wpr"))
      if (!event.target.classList.contains('csd-add-action-btn-wpr-element')) {
        this.closeActionsDrawer();
        console.log('clicked outside')
      }
    }
  }

  onFocusOut(event){
    this.logger.log('onFocusOut eventttttttt',event)
  }

  ngOnChanges() {


    // this.logger.log('[PANEL ACTION] isOpenActionDrawer ', this.isOpenActionDrawer)
    // this.logger.log('[PANEL ACTION] intentSelected ', this.intentSelected)


    // if (this.isOpenActionDrawer === true)  {
    //   this.drawer.open()
    // } else if (this.isOpenActionDrawer === false)  {
    //   this.drawer.close()
    // }
  }

  closeActionsDrawer() {
    this.openActionDrawer.emit(false);
  }

  actionSelected(typeAction: TYPE_ACTION) {
    console.log('[PANEL ACTION] actionSelected ', typeAction);
    if(typeAction === TYPE_ACTION.REPLY){
      let action = new ActionReply();
      let commandWait = new Command(TYPE_COMMAND.WAIT);
      action.attributes.commands.push(commandWait);
      let command = new Command(TYPE_COMMAND.MESSAGE);
      command.message = new Message('text', 'A chat message will be sent to the visitor');
      this.logger.log('1 action:  ', action)
      this.logger.log('2 command:  ', command)
      action.attributes.commands.push(command);
      this.intentSelected.actions.push(action);
    }
    if(typeAction === TYPE_ACTION.RANDOM_REPLY){
      let action = new ActionRandomReply();
      let commandWait = new Command(TYPE_COMMAND.WAIT);
      action.attributes.commands.push(commandWait);
      let command = new Command(TYPE_COMMAND.MESSAGE);
      command.message = new Message('text', 'A chat message will be sent to the visitor');
      this.logger.log('1 action:  ', action)
      this.logger.log('2 command:  ', command)
      action.attributes.commands.push(command);
      this.intentSelected.actions.push(action);
    }
    if(typeAction === TYPE_ACTION.WEB_REQUEST){
      let action = new ActionWebRequest();
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
    // if(typeAction === TYPE_ACTION.CONDITION){
    //   let action = new ActionCondition();
    //   this.intentSelected.actions.push(action);
    // }
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
    if(typeAction === TYPE_ACTION.JSON_CONDITION){
      let action = new ActionJsonCondition();
      action.groups.push( new Expression())
      console.log('actionnnnn', action)
      this.intentSelected.actions.push(action);
    }
    
  }

}