import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Button, Expression, MessageAttributes, MessageWithWait, Metadata } from '../../../../../../../models/intent-model';
import { TYPE_ACTION, TEXT_CHARS_LIMIT, calculatingRemainingCharacters, TYPE_BUTTON, generateShortUID } from '../../../../../../utils';
import { ConnectorService } from 'app/chatbot-design-studio/services/connector.service';
import { IntentService } from 'app/chatbot-design-studio/services/intent.service';

@Component({
  selector: 'cds-action-reply-image',
  templateUrl: './cds-action-reply-image.component.html',
  styleUrls: ['./cds-action-reply-image.component.scss']
})
export class CdsActionReplyImageComponent implements OnInit {
  
  @Output() changeActionReply = new EventEmitter();
  @Output() deleteActionReply = new EventEmitter();
  @Output() moveUpResponse = new EventEmitter();
  @Output() moveDownResponse = new EventEmitter();
  @Output() openButtonPanel = new EventEmitter();
  @Output() createNewButton = new EventEmitter();
  @Output() deleteButton = new EventEmitter();

  @Input() idAction: string;
  @Input() response: MessageWithWait;
  @Input() index: number;
  @Input() previewMode: boolean = true
  
  idIntent: string;
  // Connector //
  connector: any;

  // Textarea //
  // limitCharsText: number;
  // leftCharsText: number;
  // textMessage: string;
  // alertCharsText: boolean;

  // Delay //
  delayTime: number;

  //Filter //
  canShowFilter: boolean = true;
  booleanOperators=[ { type: 'AND', operator: 'AND'},{ type: 'OR', operator: 'OR'},]
  
  // Buttons //
  buttons: Array<Button>;

  constructor( 
    private connectorService: ConnectorService,
    private intentService: IntentService
  ) { }

  ngOnInit(): void {
    this.delayTime = this.response.time/1000;
    
    if(this.response?.attributes?.attachment?.buttons){
      this.buttons = this.response?.attributes?.attachment?.buttons;
    } else {
      this.buttons = [];
    }

    this.intentService.isChangedConnector$.subscribe((connector: any) => {
      console.log('CdsActionReplyImageComponent isChangedConnector-->', connector);
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
      if(idConnector === this.connector.fromId){
        console.log(' updateConnector :: connector.fromId: ', this.connector.fromId);
        console.log(' updateConnector :: idConnector: ', idConnector);
        console.log(' updateConnector :: idButton: ', idButton);
        console.log(' updateConnector :: connector.id: ', this.connector.id);
        const buttonChanged = this.buttons.find(obj => obj.uid === idButton);
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
  /** */
  /** onClickDelayTime */
  onClickDelayTime(opened: boolean){
    this.canShowFilter = !opened
  }

  /** onChangeDelayTime */
  onChangeDelayTime(value:number){
    this.delayTime = value;
    this.response.time = value*1000;
    this.changeActionReply.emit();
    this.canShowFilter = true;
  }

  /** onChangeExpression */
  onChangeExpression(expression: Expression){
    this.response._tdJSONCondition = expression;
    this.changeActionReply.emit();
  }

  /**onChangeMetadata */
  onChangeMetadata(metadata: Metadata){
    this.response.metadata = metadata;
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
    this.changeActionReply.emit();
  }

  /** */
  onCloseImagePanel(event){
    
    //if(event.url){
      //this.imagePath = event.url;
      this.response.metadata.src = event.url;
    //}
    //if(event.width){
      //this.imageWidth = event.width;
      this.response.metadata.width = event.width;
    //}
    //if(event.height){
      //this.imageHeight = event.height;
      this.response.metadata.height = event.height;
    //}
    // console.log('onCloseImagePanel:: ', event);
  }

  /** */
  onDeletePathElement(){
    this.response.metadata.src = null;
    this.changeActionReply.emit();
    // console.log('onDeletePathElement::: ', this.response.metadata);
  }
  

  onOpenButtonPanel(button?){
    console.log('onOpenButtonPanel: 1 ', button, this.response);
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



  // EVENT FUNCTIONS //
  /** */
  dropButtons(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.buttons, event.previousIndex, event.currentIndex);
    // const elem = document.getElementById(this.idIntent);
    this.connectorService.movedConnector(this.idIntent);
    this.changeActionReply.emit();
  } 

  onMoveLeftButton(fromIndex){
    let toIndex = fromIndex-1;
    if(toIndex<0){
      toIndex = 0;
    }
    this.arraymove(this.buttons, fromIndex, toIndex);
  }

  onMoveRightButton(fromIndex){
    let toIndex = fromIndex+1;
    if(toIndex>this.buttons.length-1){
      toIndex = this.buttons.length-1;
    }
    this.arraymove(this.buttons, fromIndex, toIndex);
  }

  private arraymove(buttons, fromIndex, toIndex) {
    var element = buttons[fromIndex];
    buttons.splice(fromIndex, 1);
    buttons.splice(toIndex, 0, element);
  }
}

