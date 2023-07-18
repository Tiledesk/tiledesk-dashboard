import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'
import { Expression, MessageWithWait } from '../../../../../../../models/intent-model';
import { TYPE_ACTION, TYPE_MESSAGE, TEXT_CHARS_LIMIT, MESSAGE_METADTA_WIDTH, MESSAGE_METADTA_HEIGHT, calculatingRemainingCharacters } from '../../../../../../utils';

@Component({
  selector: 'cds-action-reply-frame',
  templateUrl: './cds-action-reply-frame.component.html',
  styleUrls: ['./cds-action-reply-frame.component.scss']
})
export class CdsActionReplyFrameComponent implements OnInit {

  // @Output() changeDelayTimeReplyElement = new EventEmitter();
  @Output() changeActionReply = new EventEmitter();
  @Output() deleteActionReply = new EventEmitter();
  @Output() moveUpResponse = new EventEmitter();
  @Output() moveDownResponse = new EventEmitter();
  @Output() openButtonPanel = new EventEmitter();
  
  @Input() idAction: string;
  @Input() response: MessageWithWait;
  @Input() index: number;
  @Input() previewMode: boolean = true
  
  // frame //
  typeActions = TYPE_ACTION;
  framePath: any;
  frameWidth: number | string;
  frameHeight: number | string;
  typeMessage =  TYPE_MESSAGE;

  // Textarea //
  // limitCharsText: number;
  // leftCharsText: number;
  // textMessage: string;
  // alertCharsText: boolean;

  // Delay //
  delayTime: number;

  // Filter // 
  canShowFilter: boolean = true;
  booleanOperators=[ { type: 'AND', operator: 'AND'},{ type: 'OR', operator: 'OR'},]


  constructor(
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.delayTime = this.response.time/1000;

    this.frameWidth = this.response.metadata.width?this.response.metadata.width:MESSAGE_METADTA_WIDTH;
    this.frameHeight = this.response.metadata.height?this.response.metadata.height:MESSAGE_METADTA_HEIGHT;
    if(this.response.metadata.src){
      this.framePath = this.sanitizer.bypassSecurityTrustResourceUrl(this.response.metadata.src?this.response.metadata.src:null);
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
  onCloseFramePanel(event){
    //if(event.url){
      this.framePath = event.url;
      this.response.metadata.src = event.url;
    //}
    //if(event.width){
      this.frameWidth = event.width;
      this.response.metadata.width = event.width;
    //}
    //if(event.height){
      this.frameHeight = event.height;
      this.response.metadata.height = event.height;
    //}
    // console.log('onCloseframePanel:: ', event);
  }

  /** */
  onDeletePathElement(){
    this.framePath = null;
    this.response.metadata.src = '';
  }

  /** */
  onLoadPathElement(){
    try {
      this.framePath = this.sanitizer.bypassSecurityTrustResourceUrl(this.response.metadata.src);
      // console.log('onLoadPathElement:: ', this.framePath, this.response.metadata);
      this.changeActionReply.emit();
    } catch (error) {
      // console.log('error:: ', error);
    }
  }

}
