
import { Component, OnInit, ViewChild, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';

import { Message, Wait, Button, MessageAttributes, Expression } from 'app/models/intent-model';
import { TYPE_BUTTON, generateShortUID } from 'app/chatbot-design-studio/utils';
import { IntentService } from 'app/chatbot-design-studio/services/intent.service';
import { ConnectorService } from 'app/chatbot-design-studio/services/connector.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'cds-action-reply-text',
  templateUrl: './cds-action-reply-text.component.html',
  styleUrls: ['./cds-action-reply-text.component.scss']
})
export class CdsActionReplyTextComponent implements OnInit {
  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  
  @Output() updateIntentFromConnectorModification = new EventEmitter();
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
  private subscriptionChangedConnector: Subscription;


  constructor(
    private connectorService: ConnectorService,
    private intentService: IntentService,
    private logger: LoggerService,
  ) { }

  // SYSTEM FUNCTIONS //
  ngOnInit(): void {
    this.initialize();
  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   console.log('[CDS-ACTION-INTENT] >>', changes);
  // }

  /** */
  ngOnDestroy() {
    if (this.subscriptionChangedConnector) {
      this.subscriptionChangedConnector.unsubscribe();
    }
  }
  // ngOnChanges(changes: SimpleChanges): void {
  //   this.logger.log('CdsActionReplyTextComponent ngOnChanges:: ', this.response);
  // }

  // PRIVATE FUNCTIONS //

  private initialize(){
    this.delayTime = (this.wait && this.wait.time)? (this.wait.time/1000) : 500;
    this.checkButtons();
    this.subscriptionChangedConnector = this.intentService.isChangedConnector$.subscribe((connector: any) => {
      this.logger.log('[CdsActionReplyTextComponent] isChangedConnector-->', connector);
      this.connector = connector;
      this.updateConnector();
    });
    // this.patchButtons();
    // this.buttons = this.response?.attributes?.attachment?.buttons;
    this.buttons = this.intentService.patchButtons(this.buttons, this.idAction);
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

  // private async patchButtons(){
  //   this.logger.log('patchButtons:: ', this.response);
  //   let buttons = this.response?.attributes?.attachment?.buttons;
  //   if(!buttons)return;
  //   buttons.forEach(button => {
  //     if(!button.__uid || button.__uid === undefined){
  //       button.__uid = generateShortUID();
  //     }
  //     const idActionConnector = this.idAction+'/'+button.__uid;
  //     button.__idConnector = idActionConnector;
  //     if(button.action && button.action !== ''){
  //       button.__isConnected = true;
  //     } else {
  //       button.__isConnected = false;
  //     }
  //     this.logger.log('[cds-action-reply-text ]:: button: ', button, button.__uid);
  //     // button.__isConnected = true;
      
  //   }); 
  // }

  private updateConnector(){
    try {
      const array = this.connector.fromId.split("/");
      const idButton = array[array.length - 1];
      const idConnector = this.idAction+'/'+idButton;
      this.logger.log(' updateConnector [CdsActionReplyTextComponent]:: connector.fromId: ', this.connector.fromId);
      const buttonChanged = this.buttons.find(obj => obj.uid === idButton);
      if(idConnector === this.connector.fromId && buttonChanged){
        if(this.connector.deleted){
          // DELETE 
          console.log('[CdsActionReplyTextComponent] deleteConnector :: ', this.connector.fromId);
          buttonChanged.__isConnected = false;
          buttonChanged.__idConnector = this.connector.fromId;
          buttonChanged.action = '';
          buttonChanged.type = TYPE_BUTTON.TEXT;
          if(this.connector.notify)this.updateIntentFromConnectorModification.emit(this.connector.id);
          // this.changeActionReply.emit();
        } else {
          // ADD / EDIT
          // buttonChanged.__isConnected = true;
          buttonChanged.__idConnector = this.connector.fromId;
          buttonChanged.action = buttonChanged.action? buttonChanged.action : '#' + this.connector.toId;
          buttonChanged.type = TYPE_BUTTON.ACTION;
          console.log('[CdsActionReplyTextComponent] updateConnector :: ', this.buttons);
          if(!buttonChanged.__isConnected){
            buttonChanged.__isConnected = true;
            if(this.connector.notify)this.updateIntentFromConnectorModification.emit(this.connector.id);
            // this.changeActionReply.emit();
          } 
        }
        // this.changeActionReply.emit();
      }
    } catch (error) {
      this.logger.error('error: ', error);
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

  onSelectedAttribute(variableSelected: {name: string, value: string}){
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
    this.connectorService.updateConnector(this.idIntent);
    this.changeActionReply.emit();
  }  

  checkForVariablesInsideText(text: string){
    text.match(new RegExp(/(?<=\$\{)(.*)(?=\})/g, 'g')).forEach(match => {
      let createTag = '<span class="tag">' + match + '</span>'
      text = text.replace('{' + match + '}',createTag)
    });
    return text
  }
}
