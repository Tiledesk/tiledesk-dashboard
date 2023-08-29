
import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';

import { Message, Wait, Button, MessageAttributes, Expression } from 'app/models/intent-model';
import { TYPE_BUTTON, generateShortUID } from 'app/chatbot-design-studio/utils';
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
  @Output() deleteActionReply = new EventEmitter();
  @Output() moveUpResponse = new EventEmitter();
  @Output() moveDownResponse = new EventEmitter();
  @Output() createNewButton = new EventEmitter();
  @Output() deleteButton = new EventEmitter();
  @Output() openButtonPanel = new EventEmitter();

  @Input() idAction: string;
  @Input() response: Message;
  @Input() wait: Wait;
  @Input() index: number;
  @Input() previewMode: boolean = true;

  // Connector //
  idIntent: string;
  connector: any;
  // Textarea //
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
    this.initialize();
  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   console.log('CdsActionReplyTextComponent ngOnChanges:: ', this.response);
  // }

  // PRIVATE FUNCTIONS //

  private initialize(){
    this.delayTime = this.wait.time/1000;
    this.checkButtons();
    this.intentService.isChangedConnector$.subscribe((connector: any) => {
      console.log('[CdsActionReplyTextComponent] isChangedConnector-->', connector);
      this.connector = connector;
      this.updateConnector();
    });
    this.patchButtons();
    this.idIntent = this.idAction.split('/')[0];
  }

  private checkButtons(){
    if(!this.response.attributes || !this.response.attributes.attachment){
      this.response.attributes = new MessageAttributes();
    }
    if(this.response?.attributes?.attachment?.buttons){
      this.buttons = this.response?.attributes?.attachment?.buttons;
    } else {
      this.buttons = [];
    }
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
      console.log(' updateConnector [CdsActionReplyTextComponent]:: connector.fromId: ', this.connector.fromId);
      console.log(' updateConnector [CdsActionReplyTextComponent]:: idConnector: ', idConnector);
      console.log(' updateConnector [CdsActionReplyTextComponent]:: idButton: ', idButton);
      console.log(' updateConnector [CdsActionReplyTextComponent]:: connector.id: ', this.connector.id);
      const buttonChanged = this.buttons.find(obj => obj.uid === idButton);
      if(idConnector === this.connector.fromId && buttonChanged){
        if(this.connector.deleted){
          // DELETE 
          console.log(' deleteConnector :: ', this.connector.fromId);
          buttonChanged.isConnected = false;
          buttonChanged.idConnector = this.connector.fromId;
          buttonChanged.action = '';
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



  // EVENT FUNCTIONS //

  /** onClickDelayTime */
  onClickDelayTime(opened: boolean){
    this.canShowFilter = !opened;
  }

  /** onChangeDelayTime */
  onChangeDelayTime(value:number){
    this.delayTime = value;
    this.wait.time = value*1000;
    this.canShowFilter = true;
    this.changeActionReply.emit();
  }

  /** onChangeExpression */
  onChangeExpression(expression: Expression){
    this.response._tdJSONCondition = expression;
    this.changeActionReply.emit();
  }

  /** onDeleteActionReply */
  onDeleteActionReply(){
    this.deleteActionReply.emit(this.index);
  }

  /** onMoveUpResponse */
  onMoveUpResponse(){
    this.moveUpResponse.emit(this.index);
  }

  /** onMoveDownResponse */
  onMoveDownResponse(){
    this.moveDownResponse.emit(this.index);
  }

  /** onChangeTextarea */
  onChangeTextarea(text:string) {
    if(!this.previewMode){
      this.response.text = text;
      this.changeActionReply.emit();
    }
  }

  /** onOpenButtonPanel */
  onOpenButtonPanel(button){
    this.openButtonPanel.emit(button);
  }

  /** onCreateNewButton */
  onCreateNewButton(){
    this.createNewButton.emit(this.index);
  }

  /** onDeleteButton */
  onDeleteButton(index: number){
    this.deleteButton.emit({index: index, buttons: this.buttons});
  }

  /** dropButtons */
  dropButtons(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.buttons, event.previousIndex, event.currentIndex);
    this.connectorService.movedConnector(this.idIntent);
    this.changeActionReply.emit();
  }  
}
