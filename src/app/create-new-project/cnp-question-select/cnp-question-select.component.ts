import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'cnp-question-select',
  templateUrl: './cnp-question-select.component.html',
  styleUrls: ['./cnp-question-select.component.scss']
})
export class CnpQuestionSelectComponent implements OnInit {
  @Output() goToNext = new EventEmitter();
  @Input() question: any;

  selectedOption: any;
  placeholder: string;

  constructor() { }

  ngOnInit(): void {
    this.placeholder = this.question.labels.placeholder?this.question.labels.placeholder:'Please choose...';
  }

  initialize(){
    this.selectedOption = this.question[0];
  }

  onSelected(){
    // this.goToNext.emit();
  }

}
