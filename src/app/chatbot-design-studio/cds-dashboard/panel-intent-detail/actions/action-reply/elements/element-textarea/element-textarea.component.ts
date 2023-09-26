import { Component, OnInit, ViewChild, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { calculatingRemainingCharacters } from '../../../../../../utils';
// import { FocusOrigin } from '@angular/cdk/a11y';

@Component({
  selector: 'appdashboard-element-textarea',
  templateUrl: './element-textarea.component.html',
  styleUrls: ['./element-textarea.component.scss']
})
export class ElementTextareaComponent implements OnInit {
  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  // @ViewChild('textarea',{static: true}) textArea: ElementRef;


  @Input() textMessage: string;
  @Input() limitCharsText: number;
  @Output() changeTextarea = new EventEmitter();

  // Textarea //
  leftCharsText: number;
  alertCharsText: boolean;

  constructor() { }

  ngOnInit(): void {
    this.leftCharsText = calculatingRemainingCharacters(this.textMessage, this.limitCharsText);
    if(this.leftCharsText<(this.limitCharsText/10)){
      this.alertCharsText = true;
    } else {
      this.alertCharsText = false;
    }
  }

  // formatOrigin(origin: FocusOrigin): string {
  //   console.log('formatOrigin');
  //   if(this.textMessage.length>0){
  //     return origin ? origin + ' focused' : 'blurred';
  //   } else {
  //     return;
  //   }
    
  // }

  // ngAfterViewInit() {
  //   setTimeout(() => {
  //     console.log("this.textArea: ", this.autosize);
  //     if(this.textMessage.length === 0){
  //       try {
  //         this.autosize.enabled;// nativeElement.focus();
  //       } catch (error) {
  //         console.log("error: ", error);
  //       }
  //     }    
  //   }, 2000);
  // }

  /** */
  onChangeTextarea(text:string) {
    this.leftCharsText = calculatingRemainingCharacters(this.textMessage, this.limitCharsText);
    if(this.leftCharsText<(this.limitCharsText/10)){
      this.alertCharsText = true;
    } else {
      this.alertCharsText = false;
    }
    this.textMessage = text;
    this.changeTextarea.emit(this.textMessage);
  }

}