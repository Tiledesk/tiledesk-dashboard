import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TYPE_ACTION } from 'app/chatbot-design-studio/utils';
import { Expression, MessageWithWait, Metadata } from 'app/models/intent-model';

@Component({
  selector: 'appdashboard-redirect-response',
  templateUrl: './redirect-response.component.html',
  styleUrls: ['./redirect-response.component.scss']
})
export class RedirectResponseComponent implements OnInit {

  @Output() changeDelayTimeReplyElement = new EventEmitter();
  @Output() changeReplyElement = new EventEmitter();
  
  @Output() deleteResponse = new EventEmitter();
  @Output() moveUpResponse = new EventEmitter();
  @Output() moveDownResponse = new EventEmitter();
  

  @Input() response: MessageWithWait;
  @Input() index: number;
  @Input() typeAction: string;
  
  // Delay //onMoveTopButton
  delayTime: number;
  // Filter // 
  canShowFilter: boolean = true;
  booleanOperators=[ { type: 'AND', operator: 'AND'},{ type: 'OR', operator: 'OR'},]
 
  typeActions = TYPE_ACTION;
  

  metadata: Metadata
  constructor() { }

  ngOnInit(): void {
    // console.log('responseeeeeee', this.response)
    this.delayTime = this.response.time/1000;
    try {
      this.metadata = this.response.metadata;
    } catch (error) {
      // console.log('there are no buttons');
    }
  }


  /** */
  onDeleteResponse(){
    this.deleteResponse.emit(this.index);
  }

  /** */
  onMoveUpResponse(){
    this.moveUpResponse.emit(this.index);
  }

  /** */
  onMoveDownResponse(){
    this.moveDownResponse.emit(this.index);
  }

  onClickDelayTime(opened: boolean){
    this.canShowFilter = !opened
  }
  /** */
  onChangeDelayTime(value:number){
    this.delayTime = value;
    this.response.time = value*1000;
    this.changeDelayTimeReplyElement.emit();
    this.canShowFilter = true;
  }

  onChangeExpression(expression: Expression){
    this.response._tdJSONCondition = expression
    this.changeReplyElement.emit();
  }

  onChangeTextarea(text:string) {
    this.metadata.src = text;
    setTimeout(() => {
      this.changeReplyElement.emit();
    }, 500);
  }

  onButtonToogleChange(event){
    // console.log('onButtonToogleChange::: event', event)
    this.metadata.target = event.value
    // console.log('onButtonToogleChange::: response', this.response)
  }

}
