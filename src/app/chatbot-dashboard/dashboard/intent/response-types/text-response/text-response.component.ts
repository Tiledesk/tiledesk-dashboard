
import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Answer } from '../../../../../models/intent-model';

@Component({
  selector: 'appdashboard-text-response',
  templateUrl: './text-response.component.html',
  styleUrls: ['./text-response.component.scss']
})


export class TextResponseComponent implements OnInit {
  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  @Output() deleteResponse = new EventEmitter();
  @Input() response: Answer;
  @Input() index: number;

  // Textarea //
  limitCharsText: number;
  leftCharsText: number;
  textMessage: string;
  alertCharsText: boolean;

  // Delay //
  delayTime: number = 2.5;


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


}
