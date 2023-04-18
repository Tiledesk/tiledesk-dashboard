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

  selectedOption: string;

  constructor() { }

  ngOnInit(): void {
    this.initialize();
  }

  initialize(){
    if(this.question.answer){
      this.selectedOption = this.question.answer;
    }
  }

  goToSelectedButton($event){
    this.selectedOption = $event.value;
    this.question.answer = $event.value;
    this.goToNext.emit(this.index);
  }
}
