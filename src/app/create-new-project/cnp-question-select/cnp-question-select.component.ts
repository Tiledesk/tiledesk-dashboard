import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'cnp-question-select',
  templateUrl: './cnp-question-select.component.html',
  styleUrls: ['./cnp-question-select.component.scss']
})
export class CnpQuestionSelectComponent implements OnInit {
  @Output() goToNext = new EventEmitter();
  @Input() question: any;
  @Input() index: number;
  @Input() segmentAttributes: any;

  selectedOption: string;
  placeholder: string;
  LABEL_PLACEHOLDER: string = 'Please choose...';

  constructor() { }

  ngOnInit(): void {
    this.initialize();
  }

  initialize(){
    this.placeholder = this.question.labels.placeholder?this.question.labels.placeholder:this.LABEL_PLACEHOLDER;
    if(this.question.answer){
      this.selectedOption = this.question.answer;
    }
  }

  onSelected($event){
    this.question.answer = $event.value;
    try {
      this.segmentAttributes[this.question.attribute_name] = $event.value;
    } catch (error) {
      // error;
    }
    // console.log('CNP-QUESTION-SELECT goToNext segmentAttributes ', this.segmentAttributes) 
    this.goToNext.emit(this.segmentAttributes);
  }

}
