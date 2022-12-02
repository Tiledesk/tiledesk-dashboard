
import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Answer } from '../../../../../models/intent-model';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

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
  @Output() openAddButtonPanel = new EventEmitter();
  
  @Input() response: Answer;
  @Input() index: number;

  // Textarea //
  limitCharsText: number;
  leftCharsText: number;
  textMessage: string;
  alertCharsText: boolean;

  // Delay //
  delayTime: number;


  constructor() { }

  ngOnInit(): void {
    this.limitCharsText = 300;
    this.leftCharsText = this.limitCharsText;
    this.alertCharsText = false;

    this.delayTime = this.response.delay;
    this.textMessage = this.response.messages[0];
  }


  

  // EVENTS //
  onDeleteResponse(){
    this.deleteResponse.emit(this.index);
  }

  onMoveUpResponse(){
    this.moveUpResponse.emit(this.index);
  }
  onMoveDownResponse(){
    this.moveDownResponse.emit(this.index);
  }


  onChangeText(text:string) {
    let numCharsText = text.length;
    this.leftCharsText = this.limitCharsText - numCharsText;
    if(this.leftCharsText<(this.limitCharsText/10)){
      this.alertCharsText = true;
    } else {
      this.alertCharsText = false;
    }
  }


  onChangeDelayTime(value:number){
    this.delayTime = value;
    console.log("onChangeDelayTime: ", this.delayTime);
  }

  onOpenAddButtonPanel(){
    this.openAddButtonPanel.emit(this.index);
  }

}
