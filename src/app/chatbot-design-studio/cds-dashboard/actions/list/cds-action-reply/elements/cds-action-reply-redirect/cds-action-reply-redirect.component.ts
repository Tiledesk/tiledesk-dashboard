import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TYPE_ACTION } from 'app/chatbot-design-studio/utils';
import { Expression, MessageWithWait, Metadata } from 'app/models/intent-model';

@Component({
  selector: 'cds-action-reply-redirect',
  templateUrl: './cds-action-reply-redirect.component.html',
  styleUrls: ['./cds-action-reply-redirect.component.scss']
})
export class CdsActionReplyRedirectComponent implements OnInit {

  @Output() changeActionReply = new EventEmitter();
  @Output() deleteActionReply = new EventEmitter();
  @Output() moveUpResponse = new EventEmitter();
  @Output() moveDownResponse = new EventEmitter();
  
  @Input() idAction: string;
  @Input() response: MessageWithWait;
  @Input() index: number;
  
  // Delay //onMoveTopButton
  delayTime: number;
  // Filter // 
  canShowFilter: boolean = true;
  booleanOperators=[ { type: 'AND', operator: 'AND'},{ type: 'OR', operator: 'OR'},]
 
  typeActions = TYPE_ACTION;
  

  metadata: Metadata
  constructor() { }

  ngOnInit(): void {
    this.delayTime = this.response.time/1000;
    try {
      this.metadata = this.response.metadata;
    } catch (error) {
      // console.log('there are no buttons');
    }
  }

  // EVENT FUNCTIONS //
  
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
    this.metadata.src = text;
    setTimeout(() => {
      this.changeActionReply.emit();
    }, 500);
  }

  onButtonToogleChange(event){
    console.log('onButtonToogleChange::: event', event)
    this.metadata.target = event.value
    console.log('onButtonToogleChange::: response', this.response)
  }

}
