
import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Message, Button } from '../../../../../../../models/intent-model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TYPE_BUTTON, TYPE_URL, TEXT_CHARS_LIMIT, calculatingRemainingCharacters } from '../../../../../../utils';

@Component({
  selector: 'appdashboard-text-response',
  templateUrl: './text-response.component.html',
  styleUrls: ['./text-response.component.scss']
})


export class TextResponseComponent implements OnInit {
  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  @Output() deleteResponse = new EventEmitter();
  @Output() moveUpResponse = new EventEmitter();
  @Output() moveDownResponse = new EventEmitter();
  @Output() openButtonPanel = new EventEmitter();
  
  @Input() response: Message;
  @Input() index: number;

  // Textarea //
  limitCharsText: number;
  textMessage: string;
  // leftCharsText: number;
  // alertCharsText: boolean;

  // Delay //
  delayTime: number;
  buttons: Array<Button>;

  // Buttons //
  typeOfButton = TYPE_BUTTON;
  typeOfUrl = TYPE_URL;

 
  constructor() { }

  // SYSTEM FUNCTIONS //
  ngOnInit(): void {
    this.limitCharsText = TEXT_CHARS_LIMIT;
    // this.textMessage = this.response.text;
    this.delayTime = this.response.time/1000;
    // this.textMessage = this.response.text;

    // this.leftCharsText = calculatingRemainingCharacters(this.textMessage);
    // if(this.leftCharsText<(TEXT_CHARS_LIMIT/10)){
    //   this.alertCharsText = true;
    // } else {
    //   this.alertCharsText = false;
    // }
   
    this.buttons = [];
    try {
      this.buttons = this.response.attributes.attachment.buttons;
    } catch (error) {
      console.log('there are no buttons');
    }
  }

  // PRIVATE FUNCTIONS //
  /** */
  private arraymove(buttons, fromIndex, toIndex) {
    var element = buttons[fromIndex];
    buttons.splice(fromIndex, 1);
    buttons.splice(toIndex, 0, element);
  }

  /** */
  private addNewButton(): Button{
    let button =  {
      'value': 'Button',
      'type': this.typeOfButton.TEXT,
      'target': this.typeOfUrl.BLANK,
      'link': '',
      'action': '',
      'show_echo': true
    };
    this.buttons.push(button);
    this.response.attributes = {
      attachment: {
        type: 'template',
        buttons: this.buttons
      }
    }
    return button;
  }

  // EVENT FUNCTIONS //
  /** */
  drop(event: CdkDragDrop<string[]>) {
    // this.textGrabbing = false;
    moveItemInArray(this.buttons, event.previousIndex, event.currentIndex);
    console.log(this.buttons, event.previousIndex, event.currentIndex);
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

  /** */
  onChangeTextarea(text:string) {
    this.response.text = text;
  }

  /** */
  onChangeDelayTime(value:number){
    this.delayTime = value;
    this.response.time = value*1000;
  }

  /** */
  onOpenButtonPanel(button?){
    if(!button){
      button = this.addNewButton();
    }
    this.openButtonPanel.emit(button);
  }

  onDeleteButton(index){
    this.buttons.splice(index, 1); 
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

  
}
