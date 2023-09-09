import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Wait, Button, Message, Command, ActionReply, MessageAttributes, Intent } from 'app/models/intent-model';
import { TYPE_INTENT_ELEMENT, ELEMENTS_LIST, ACTIONS_LIST, TYPE_ACTION, TYPE_COMMAND, TYPE_RESPONSE, TYPE_BUTTON, TYPE_URL, TYPE_MESSAGE, generateShortUID } from 'app/chatbot-design-studio/utils';
import { LoggerService } from 'app/services/logger/logger.service';

import { ControllerService } from 'app/chatbot-design-studio/services/controller.service';
import { IntentService } from 'app/chatbot-design-studio/services/intent.service';
import { ConnectorService } from 'app/chatbot-design-studio/services/connector.service';


@Component({
  selector: 'cds-action-reply',
  templateUrl: './cds-action-reply.component.html',
  styleUrls: ['./cds-action-reply.component.scss']
})
export class CdsActionReplyComponent implements OnInit {

  @ViewChild('scrollMe', { static: false }) scrollContainer: ElementRef;
  translateY: string;

  @Input() action: ActionReply;
  @Input() intentSelected: Intent;
  @Input() previewMode: boolean = true
  @Output() updateAndSaveAction = new EventEmitter();
  

  // idIntentSelected: string;
  idAction: string;

  openCardButton: boolean = false;
  // buttonSelected: Button;
  // newButton: boolean = false;

  typeCommand = TYPE_COMMAND;
  typeResponse = TYPE_RESPONSE;
  typeMessage = TYPE_MESSAGE;
  typeActions = TYPE_ACTION;
  actionList = ACTIONS_LIST;

  intentName: string;
  intentNameResult: boolean;
  textGrabbing: boolean;
  arrayResponses: Array<Command>;
  typeAction: string;

  element: any;
  showTip: boolean = true;
  descriptionTooltip: string = "";
  dataInput: string;
  tipText: string;
  titlePlaceholder: string;

  constructor(
    private logger: LoggerService,
    private intentService: IntentService,
    private controllerService: ControllerService,
    private connectorService: ConnectorService
  ) { }

  // manageTooltip(){}
  // onChangeText(event){}
  // addElement(event){}


  // SYSTEM FUNCTIONS //
  ngOnInit(): void {
    console.log('ActionReplyComponent ngOnInit', this.action, this.intentSelected);
    // // console.log('ngOnInit panel-response::: ', this.typeAction);
    this.typeAction = (this.action._tdActionType === TYPE_ACTION.RANDOM_REPLY ? TYPE_ACTION.RANDOM_REPLY : TYPE_ACTION.REPLY);
    try {
      this.element = ELEMENTS_LIST.find(item => item.type === this.action._tdActionType);
      if(this.action._tdActionTitle && this.action._tdActionTitle != ""){
        this.dataInput = this.action._tdActionTitle;
      }
      console.log('ActionDescriptionComponent action:: ', this.element);
    } catch (error) {
      this.logger.log("error ", error);
    }

    // this.initialize();

  }



  ngOnChanges(changes: SimpleChanges): void {
    console.log('ActionReplyComponent ngOnChanges:: ', this.action);
    if(this.action && this.intentSelected)this.initialize();
  }






  // CUSTOM FUNCTIONS //
  /** */
  private initialize() {
    console.log('initialize:::: ', this.intentSelected);
    this.action._tdActionId = this.action._tdActionId?this.action._tdActionId:generateShortUID();
    this.idAction =this.intentSelected.intent_id+'/'+this.action._tdActionId;

    this.openCardButton = false;
    this.arrayResponses = [];

    this.intentName = '';
    this.intentNameResult = true;
    this.textGrabbing = false;
    if (this.action) {
      try {
        this.arrayResponses = this.action.attributes.commands;
      } catch (error) {
        this.logger.log('error:::', error);
      }
    }
    this.scrollToBottom();
  }


  /** */
  scrollToBottom(): void {
    setTimeout(() => {
      try {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        this.scrollContainer.nativeElement.animate({ scrollTop: 0 }, '500');
      } catch (error) {
        this.logger.log('scrollToBottom ERROR: ', error);
      }
    }, 300);
  }


  // EVENT FUNCTIONS //


  // on drag //
  /** */
  mouseDown() {
    this.textGrabbing = true;
  }

  /** */
  mouseUp() {
    this.textGrabbing = false;
  }

  /** */
  drop(event: CdkDragDrop<string[]>) {
    // this.textGrabbing = false;
    // moveItemInArray(this.arrayResponses, event.previousIndex, event.currentIndex);
    // this.onUpdateAndSaveAction();
  }


  // on action //
  /** */
  onMoveUpResponse(index: number) {
    try {
      let from = index - 1;
      let to = from - 2;
      this.arrayResponses.splice(to, 0, this.arrayResponses.splice(from, 1)[0]); 
      from = index;
      to = from - 2;
      this.arrayResponses.splice(to, 0, this.arrayResponses.splice(from, 1)[0]);
      // console.log( 'onMoveUpResponse ---> ', this.arrayResponses);
      this.onUpdateAndSaveAction();
    } catch (error) {
      this.logger.log('onAddNewResponse ERROR', error);
    }
  }

  /** */
  onMoveDownResponse(index: number) {
    try {
      let from = index;
      let to = from + 2;
      this.arrayResponses.splice(to, 0, this.arrayResponses.splice(from, 1)[0]); 
      from = index - 1;
      to = from + 2;
      this.arrayResponses.splice(to, 0, this.arrayResponses.splice(from, 1)[0]);
      // console.log( 'onMoveUpResponse ---> ', this.arrayResponses);
      this.onUpdateAndSaveAction();
    } catch (error) {
      this.logger.log('onAddNewResponse ERROR', error);
    }
  }


  /** onAddNewActionReply */
  onAddNewActionReply(element) {
    console.log('onAddNewActionReply: ', element);
    try {
      let message = new Message(element.message.type, element.message.text);
      if (element.message.attributes) {
        message.attributes = element.message.attributes;
      }
      if (element.message.metadata) {
        message.metadata = element.message.metadata;
      }
      const wait = new Wait();
      let command = new Command(element.type);
      command.message = message;
      this.arrayResponses.push(wait);
      this.arrayResponses.push(command);
      this.scrollToBottom();
      this.onUpdateAndSaveAction();
    } catch (error) {
      this.logger.log('onAddNewResponse ERROR', error);
    }
  }


  /** onDeleteActionReply */
  onDeleteActionReply(index: number) {
    // console.log('onDeleteActionReply: ', this.arrayResponses[index]);
    try {
      let buttons = this.arrayResponses[index].message.attributes.attachment.buttons;
      buttons.forEach(button => {
        if(button.__isConnected){
          this.connectorService.deleteConnector(button.__idConnector);
        }
      });
    } catch (error) {
      this.logger.log('onAddNewResponse ERROR', error);
    }
    const wait = this.arrayResponses[index-1];
    if( wait && wait.type === this.typeCommand.WAIT){
      this.arrayResponses.splice(index-1, 2); 
    } else {
      this.arrayResponses.splice(index, 1); 
    }
    // console.log('onDeleteActionReply', this.arrayResponses);
    this.onUpdateAndSaveAction();
  }


  /** onChangingReplyAction */
  onChangeActionReply(event) {
    // console.log('onChangeActionReply ************', event);
    this.onUpdateAndSaveAction();
  }
  


  // on button action //

  /** onCreateNewButton */
  onCreateNewButton(index){
    console.log('onCreateNewButton: ', index);
    try {
      if(!this.arrayResponses[index].message.attributes || !this.arrayResponses[index].message.attributes.attachment){
        this.arrayResponses[index].message.attributes = new MessageAttributes();
      }
    } catch (error) {
      console.log('error: ', error);
    }

    let buttonSelected = this.createNewButton();
    if(buttonSelected){
      this.arrayResponses[index].message.attributes.attachment.buttons.push(buttonSelected);
      console.log('onCreateNewButton: ', this.arrayResponses);
      this.onUpdateAndSaveAction();
    }
  }

  private createNewButton() {
    const idButton = generateShortUID();
    if(this.intentSelected.intent_id){
      this.idAction = this.intentSelected.intent_id+'/'+this.action._tdActionId;
      const idActionConnector = this.idAction+'/'+idButton;
      console.log('createNewButton: ', this.intentSelected);
      let buttonSelected = new Button(
        idButton,
        idActionConnector,
        false,
        TYPE_BUTTON.TEXT,
        'Button',
        '',
        TYPE_URL.BLANK,
        '',
        '',
        true
      );

      // let buttonSelected = {
      //   'uid': idButton,
      //   'idConnector': idActionConnector,
      //   'isConnected': false,
      //   'value': 'Button',
      //   'type': TYPE_BUTTON.TEXT,
      //   'target': TYPE_URL.BLANK,
      //   'link': '',
      //   'action': '',
      //   'show_echo': true
      // };
      return buttonSelected;
    }
    return null;
    
  }

  /** onDeleteButton */
  onDeleteButton(event){
    let button = event.buttons[event.index];
    event.buttons.splice(event.index, 1);
    var intentId = this.idAction.substring(0, this.idAction.indexOf('/'));
    this.connectorService.deleteConnectorFromAction(intentId, button.__idConnector);
    this.updateAndSaveAction.emit();
  }


  /**  onUpdateAndSaveAction: 
   * function called by all actions in @output whenever they are modified!
   * 1 - update connectors
   * 2 - update intent
   * */
  public async onUpdateAndSaveAction() {
    console.log('[CDS-INTENT] onUpdateAndSaveAction:::: ', this.intentSelected, this.intentSelected.actions);
    this.connectorService.movedConnector(this.intentSelected.intent_id);
    this.updateAndSaveAction.emit();
  }

  // on intent name //

  /** onChangeIntentName */
  onChangeIntentName(name: string) {
    name.toString();
    try {
      this.intentName = name.replace(/[^A-Z0-9_]+/ig, "");
    } catch (error) {
      this.logger.log('name is not a string', error)
    }
  }

  /** onBlurIntentName */
  onBlurIntentName(name: string) {
    this.intentNameResult = true;
  }

  /** onDisableInputMessage */
  onDisableInputMessage() {
    try {
      this.action.attributes.disableInputMessage = !this.action.attributes.disableInputMessage;
    } catch (error) {
      this.logger.log("Error: ", error);
    }
  }


  /** appdashboard-button-configuration-panel: onOpenButtonPanel */
  onOpenButtonPanel(buttonSelected) {
    console.log('onOpenButtonPanel 2 :: ', buttonSelected);
    // this.response = event.refResponse;
    this.controllerService.openButtonPanel(buttonSelected);
  }

  onOpenPanelActionDetail(event){
    console.log('onOpenPanelActionDetail :: ', this.action);
    this.intentService.setIntentSelected(this.intentSelected);
    this.controllerService.openActionDetailPanel(TYPE_INTENT_ELEMENT.ACTION, this.action);
  }



  /** appdashboard-button-configuration-panel: Save button */
  onSaveButton(button) {
    // this.logger.log('onSaveButton :: ', button, this.response);
    // this.generateCommandsWithWaitOfElements();
  }

 

  /** appdashboard-button-configuration-panel: Close button panel */
  onCloseButtonPanel() {
    this.logger.log('onCloseButtonPanel :: ');
    this.openCardButton = false;
  }

  onFocusOutEvent(event) {
    // this.logger.log('onFocusOutEvent ::::::: ', event);
    // this.onCloseButtonPanel()
  }
  
}
