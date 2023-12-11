import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'cnp-question-button',
  templateUrl: './cnp-question-button.component.html',
  styleUrls: ['./cnp-question-button.component.scss']
})
export class CnpQuestionButtonComponent implements OnInit {
  @Output() goToNext = new EventEmitter();
  @Input() question: any;
  @Input() index: number;
  @Input() segmentAttributes: any;

  selectedOption: string;

  constructor() { }

  ngOnInit(): void {
    this.initialize();
  }

  initialize(){
    if(this.question.answer){
      this.selectedOption = this.question.answer;
      // console.log('CNP-QUESTION-BTN selectedOption', this.selectedOption)
    }
  }

  goToSelectedButton($event){
    // console.log('CNP-QUESTION-BTN goToSelectedButton event', $event)
    this.selectedOption = $event.value;
    this.question.answer = $event.value;
    // console.log('CNP-QUESTION-BTN goToSelectedButton selectedOption', this.selectedOption)
    // console.log('CNP-QUESTION-BTN goToSelectedButton this.question.answer', this.question.answer)
    try {
      this.segmentAttributes[this.question.attribute_name] = $event.value;
    } catch (error) {
      // error; 
    }
    // console.log('CNP-QUESTION-BTN segmentAttributes', this.segmentAttributes)
    this.segmentAttributes['solution'] = "want_to_automate_conversations"
    this.goToNext.emit(this.segmentAttributes);
  }
}
