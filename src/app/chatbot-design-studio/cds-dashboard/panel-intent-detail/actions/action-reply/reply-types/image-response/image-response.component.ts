import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Button, Expression, MessageAttributes, MessageWithWait } from '../../../../../../../models/intent-model';
import { TYPE_ACTION, TEXT_CHARS_LIMIT, calculatingRemainingCharacters } from '../../../../../../utils';

@Component({
  selector: 'appdashboard-image-response',
  templateUrl: './image-response.component.html',
  styleUrls: ['./image-response.component.scss']
})
export class ImageResponseComponent implements OnInit {
  
  @Output() changeReplyElement = new EventEmitter()
  @Output() deleteResponse = new EventEmitter();
  @Output() moveUpResponse = new EventEmitter();
  @Output() moveDownResponse = new EventEmitter();
  @Output() openButtonPanel = new EventEmitter();
  
  @Input() response: MessageWithWait;
  @Input() index: number;
  @Input() typeAction: string;

  // Textarea //
  typeActions = TYPE_ACTION;
  limitCharsText: number;
  leftCharsText: number;
  textMessage: string;
  alertCharsText: boolean;
  buttons: Array<Button>;
  // Delay //
  delayTime: number;
  //Filter //
  canShowFilter: boolean = true;
  booleanOperators=[ { type: 'AND', operator: 'AND'},{ type: 'OR', operator: 'OR'},]
  
  constructor() { }

  ngOnInit(): void {
    this.limitCharsText = TEXT_CHARS_LIMIT;
    this.delayTime = this.response.time/1000;
    this.textMessage = this.response.text;
    this.leftCharsText = calculatingRemainingCharacters(this.textMessage, this.limitCharsText);
    if(this.leftCharsText<(TEXT_CHARS_LIMIT/10)){
      this.alertCharsText = true;
    } else {
      this.alertCharsText = false;
    }

    this.buttons = [];
    try {
      this.buttons = this.response.attributes.attachment.buttons;
    } catch (error) {
      // console.log('there are no buttons');
    }
  }

  // EVENT FUNCTIONS //
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
  onChangeImageSelected(event){

  }



  /** */
  onDeletePathElement(){
    this.response.metadata.src = null;
    // console.log('onDeletePathElement::: ', this.response.metadata);
  }

  /** */
  onChangeTextarea(text:string) {
    this.response.text = text;
    this.changeReplyElement.emit()
  }

  onClickDelayTime(opened: boolean){
    this.canShowFilter = !opened
  }

  /** */
  onChangeDelayTime(value:number){
    this.delayTime = value;
    this.response.time = value*1000;
    this.changeReplyElement.emit();
  }

  onChangeExpression(expression: Expression){
    this.response._tdJSONCondition = expression;
    this.changeReplyElement.emit();
  }
  
  onOpenButtonPanel(button?){
    // if(!button){
    //   button = this.addNewButton();
    // }
    try {
      if(!this.response.attributes || !this.response.attributes.attachment.buttons){
        this.response.attributes = new MessageAttributes();
        this.buttons = this.response.attributes.attachment.buttons;
      }
    } catch (error) {
    }
    
    this.openButtonPanel.emit({button: button, refResponse: this.response});
  }

  onDeleteButton(index){
    this.buttons.splice(index, 1);
    //REMOVE ATTRIBUTES OBJ IF NO BUTTONS EXIST
    if(this.buttons.length === 0){
      delete this.response.attributes.attachment
    } 
  }

   // EVENT FUNCTIONS //
  /** */
  drop(event: CdkDragDrop<string[]>) {
    // this.textGrabbing = false;
    moveItemInArray(this.buttons, event.previousIndex, event.currentIndex);
    // console.log(this.buttons, event.previousIndex, event.currentIndex);
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

