import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { calculatingRemainingCharacters } from '../../../../../../utils';

@Component({
  selector: 'appdashboard-element-textarea',
  templateUrl: './element-textarea.component.html',
  styleUrls: ['./element-textarea.component.scss']
})
export class ElementTextareaComponent implements OnInit {
  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  @Input() textMessage: string;
  @Input() limitCharsText: number;
  @Output() changeTextarea = new EventEmitter();

  // Textarea //
  leftCharsText: number;
  alertCharsText: boolean;

  constructor() { }

  ngOnInit(): void {
    this.leftCharsText = calculatingRemainingCharacters(this.textMessage);
    if(this.leftCharsText<(this.limitCharsText/10)){
      this.alertCharsText = true;
    } else {
      this.alertCharsText = false;
    }
  }

   /** */
   onChangeTextarea(text:string) {
    this.leftCharsText = calculatingRemainingCharacters(this.textMessage);
    if(this.leftCharsText<(this.limitCharsText/10)){
      this.alertCharsText = true;
    } else {
      this.alertCharsText = false;
    }
    this.textMessage = text;
    this.changeTextarea.emit(this.textMessage);
  }

}