import { ACTIONS_LIST } from './../../utils';
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild, HostListener } from '@angular/core';

import { TYPE_ACTION, TYPE_COMMAND } from '../../utils';
import { ActionAgent, ActionClose, ActionWebRequest,
         ActionReply, ActionRandomReply, Intent, Command, 
         Message, ActionIntentConnected, ActionEmail, 
         ActionWait, ActionAssignVariable, ActionDeleteVariable, 
         ActionOnlineAgent, ActionOpenHours, ActionReplaceBot, 
         ActionChangeDepartment, ActionHideMessage, ActionJsonCondition, Expression, ActionAssignFunction, ActionWhatsappStatic, ActionWhatsappAttribute } from 'app/models/intent-model';
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
  @Output() addNewAction = new EventEmitter();

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
    //   this.logger.log('[PANEL-ACTIONS] clickout event.target)', event.target)
    //  this.logger.log('[PANEL-ACTIONS] clickout event.target.id)', event.target.id)
    //  this.logger.log('[PANEL-ACTIONS clickout event.target.className)', event.target.classList)
    const clicked_element_id = event.target.id
    this.logger.log("clicked_element_id: ", clicked_element_id);
    if (this.eRef.nativeElement.contains(event.target)) {
      // this.logger.log("clicked inside")
    } else {
      // const elSidebarUserDtls = <HTMLElement>document.querySelector('#user-details');
      // this.logger.log('[PANEL-ACTIONS] clicked outside elSidebarUserDtls ', elSidebarUserDtls)
      //this.logger.log('[PANEL-ACTIONS] HAS_CLICKED_OPEN_USER_DETAIL ', this.HAS_CLICKED_OPEN_USER_DETAIL)
      // && (!event.target.classList.contains('ng-option'))
      // clicked_element_id !== 'a0da04ac7772' && 
      this.logger.log("clicked_element_id.startsWith(actions-btns-wpr)", clicked_element_id.startsWith("actions-btns-wpr"))
      if (!event.target.classList.contains('csd-add-action-btn-wpr-element')) {
        this.closeActionsDrawer();
        this.logger.log('clicked outside')
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

  onActionSelected(typeAction: TYPE_ACTION) {
    this.logger.log('[PANEL ACTION] actionSelected ', typeAction);
    let action: any;
    if(typeAction === TYPE_ACTION.REPLY){
      action = new ActionReply();
      let commandWait = new Command(TYPE_COMMAND.WAIT);
      action.attributes.commands.push(commandWait);
      let command = new Command(TYPE_COMMAND.MESSAGE);
      command.message = new Message('text', 'A chat message will be sent to the visitor');
      action.attributes.commands.push(command);
    }
    if(typeAction === TYPE_ACTION.RANDOM_REPLY){
      action = new ActionRandomReply();
      let commandWait = new Command(TYPE_COMMAND.WAIT);
      action.attributes.commands.push(commandWait);
      let command = new Command(TYPE_COMMAND.MESSAGE);
      command.message = new Message('text', 'A chat message will be sent to the visitor');
      action.attributes.commands.push(command);
    }
    if(typeAction === TYPE_ACTION.WEB_REQUEST){
      action = new ActionWebRequest();
    }
    if(typeAction === TYPE_ACTION.AGENT){
      action = new ActionAgent();
    }
    if(typeAction === TYPE_ACTION.CLOSE){
      action = new ActionClose();
    }
    if(typeAction === TYPE_ACTION.WAIT){
      action = new ActionWait();
    }
    if(typeAction === TYPE_ACTION.INTENT) {
      action = new ActionIntentConnected()
    }
    if(typeAction === TYPE_ACTION.EMAIL) {
      action = new ActionEmail();
    }
    if(typeAction === TYPE_ACTION.ASSIGN_VARIABLE){
      action = new ActionAssignVariable();
    }
    if(typeAction === TYPE_ACTION.DELETE_VARIABLE){
      action = new ActionDeleteVariable();
    }
    if(typeAction === TYPE_ACTION.ONLINE_AGENTS){
      action = new ActionOnlineAgent();
    }
    if(typeAction === TYPE_ACTION.OPEN_HOURS){
      action = new ActionOpenHours();
    }
    if(typeAction === TYPE_ACTION.REPLACE_BOT){
      action = new  ActionReplaceBot();
    }
    if(typeAction === TYPE_ACTION.CHANGE_DEPARTMENT) {
      action = new  ActionChangeDepartment();
    }
    if(typeAction === TYPE_ACTION.HIDE_MESSSAGE){
      action = new ActionHideMessage();
    }
    if(typeAction === TYPE_ACTION.JSON_CONDITION){
      action = new ActionJsonCondition();
      action.groups.push( new Expression());
    }
    if(typeAction === TYPE_ACTION.ASSIGN_FUNCTION){
      action = new ActionAssignFunction();
    }
    if(typeAction === TYPE_ACTION.ASSIGN_FUNCTION){
      action = new ActionAssignFunction();
    }
    if(typeAction === TYPE_ACTION.WHATSAPP_STATIC) {
      action = new ActionWhatsappStatic();
    }
    if(typeAction === TYPE_ACTION.WHATSAPP_ATTRIBUTE) {
      action = new ActionWhatsappAttribute();
    }
    // this.intentSelected.actions.push(action);
    this.addNewAction.emit(action);
  }

}