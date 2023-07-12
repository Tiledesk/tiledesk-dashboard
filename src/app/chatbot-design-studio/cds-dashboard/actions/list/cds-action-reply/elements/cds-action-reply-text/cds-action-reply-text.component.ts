
import { Component, OnInit, ViewChild, Input, Output, EventEmitter, Attribute } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';

import { MessageWithWait, Button, MessageAttributes, Expression } from 'app/models/intent-model';
import { TYPE_ACTION, TYPE_BUTTON, TYPE_URL, generateShortUID, calculatingRemainingCharacters } from 'app/chatbot-design-studio/utils';
import { IntentService } from 'app/chatbot-design-studio/services/intent.service';
import { ConnectorService } from 'app/chatbot-design-studio/services/connector.service';


@Component({
  selector: 'cds-action-reply-text',
  templateUrl: './cds-action-reply-text.component.html',
  styleUrls: ['./cds-action-reply-text.component.scss']
})


export class CdsActionReplyTextComponent implements OnInit {
  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  

  @Output() changeActionReply = new EventEmitter();
  // @Output() changeDelayTimeReplyAction = new EventEmitter();
  @Output() openButtonPanel = new EventEmitter();
  
  @Output() createNewButton = new EventEmitter();
  @Output() deleteButton = new EventEmitter();
  
  @Output() deleteActionReply = new EventEmitter();
  @Output() moveUpResponse = new EventEmitter();
  @Output() moveDownResponse = new EventEmitter();

  
  @Input() idAction: string;
  @Input() response: MessageWithWait;
  @Input() index: number;
  @Input() typeAction: string;

  idIntent: string;
  // Connector //
  connector: any;

  // Textarea //
  // limitCharsText: number;
  // leftCharsText: number;
  // alertCharsText: boolean;

  // Delay //
  delayTime: number;

  // Filter // 
  canShowFilter: boolean = true;
  booleanOperators = [ { type: 'AND', operator: 'AND'},{ type: 'OR', operator: 'OR'},];

  // Buttons //
  buttons: Array<Button>;


  constructor(
    private connectorService: ConnectorService,
    private intentService: IntentService
  ) { }

  // SYSTEM FUNCTIONS //
  ngOnInit(): void {
    console.log('typeAction: ', this.typeAction);
    // this.limitCharsText = TEXT_CHARS_LIMIT;
    this.delayTime = this.response.time/1000;

    if(this.response?.attributes?.attachment?.buttons){
      this.buttons = this.response?.attributes?.attachment?.buttons;
    } else {
      this.buttons = [];
    }
  
    this.intentService.isChangedConnector$.subscribe((connector: any) => {
      console.log('CdsActionReplyTextComponent isChangedConnector-->', connector);
      this.connector = connector;
      this.updateConnector();
    });
    this.patchButtons();

    this.idIntent = this.idAction.split('/')[0];
  }



  private patchButtons(){
    console.log('patchButtons:: ', this.response);
    let buttons = this.response?.attributes?.attachment?.buttons;
    if(!buttons)return;
    buttons.forEach(button => {
      if(!button.uid || button.uid === undefined){
        const idButton = generateShortUID();
        const idActionConnector = this.idAction+'/'+idButton;
        button.uid = idButton;
        button.idConnector = idActionConnector;
        if(button.action && button.action !== ''){
          button.isConnected = true;
        } else {
          button.isConnected = false;
        }
      }
    }); 
  }


  private updateConnector(){
    try {
      const array = this.connector.fromId.split("/");
      const idButton = array[array.length - 1];
      const idConnector = this.idAction+'/'+idButton;
      console.log(' updateConnector :: connector.fromId: ', this.connector.fromId);
      console.log(' updateConnector :: idConnector: ', idConnector);
      console.log(' updateConnector :: idButton: ', idButton);
      console.log(' updateConnector :: connector.id: ', this.connector.id);
      if(idConnector === this.connector.fromId){
        const buttonChanged = this.buttons.find(obj => obj.uid === idButton);
        if(this.connector.deleted){
          // DELETE 
          console.log(' deleteConnector :: ', this.connector.fromId);
          buttonChanged.isConnected = false;
          buttonChanged.idConnector = null;
          buttonChanged.action = null;
          buttonChanged.type = TYPE_BUTTON.TEXT;
        } else {
          // ADD / EDIT
          buttonChanged.isConnected = true;
          buttonChanged.idConnector = this.connector.fromId;
          buttonChanged.action = '#' + this.connector.toId;
          buttonChanged.type = TYPE_BUTTON.ACTION;
          console.log(' updateConnector :: ', this.buttons);
        }
        this.changeActionReply.emit();
      }
    } catch (error) {
      console.log('error: ', error);
    }
  }


  
  // PRIVATE FUNCTIONS //
  /** */
  private arraymove(buttons, fromIndex, toIndex) {
    var element = buttons[fromIndex];
    buttons.splice(fromIndex, 1);
    buttons.splice(toIndex, 0, element);
  }


  // EVENT FUNCTIONS //

  /** onClickDelayTime */
  onClickDelayTime(opened: boolean){
    this.canShowFilter = !opened;
  }

  /** onChangeDelayTime */
  onChangeDelayTime(value:number){
    this.delayTime = value;
    this.response.time = value*1000;
    this.changeActionReply.emit();
  }

  /** onChangeExpression */
  onChangeExpression(expression: Expression){
    this.response._tdJSONCondition = expression
    this.changeActionReply.emit();
  }

  /** onDeleteActionReply */
  onDeleteActionReply(){
    this.deleteActionReply.emit(this.index);
  }
  onMoveUpResponse(){
    this.moveUpResponse.emit(this.index);
  }
  onMoveDownResponse(){
    this.moveDownResponse.emit(this.index);
  }

  /** onChangeTextarea */
  onChangeTextarea(text:string) {
    this.response.text = text;
    setTimeout(() => {
      this.changeActionReply.emit();
    }, 500);
  }

  /** onOpenButtonPanel */
  onOpenButtonPanel(button: Button){
    // console.log('onOpenButtonPanel: 1 ', button, this.response);
    try {
      if(!this.response.attributes || !this.response.attributes.attachment.buttons){
        this.response.attributes = new MessageAttributes();
        this.buttons = this.response.attributes.attachment.buttons;
      }
    } catch (error) {
      console.log('error: ', error);
    }
    this.openButtonPanel.emit({button: button, refResponse: this.response});
  }

  /** onCreateNewButton */
  onCreateNewButton(){
    try {
      if(!this.response.attributes || !this.response.attributes.attachment.buttons){
        this.response.attributes = new MessageAttributes();
        this.buttons = this.response.attributes.attachment.buttons;
      }
    } catch (error) {
      console.log('error: ', error);
    }
    this.createNewButton.emit({refResponse: this.response});
  }

  /** onDeleteButton */
  onDeleteButton(index: number){
    let button = this.buttons[index];
    this.buttons.splice(index, 1);
    var intentId = this.idAction.substring(0, this.idAction.indexOf('/'));
    this.connectorService.deleteConnectorFromAction(intentId, button.idConnector);
    this.deleteButton.emit();
  }

  /** */
  dropButtons(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.buttons, event.previousIndex, event.currentIndex);
    const elem = document.getElementById(this.idIntent);
    this.connectorService.movedConnector(elem);
    this.changeActionReply.emit();
  }  
}
