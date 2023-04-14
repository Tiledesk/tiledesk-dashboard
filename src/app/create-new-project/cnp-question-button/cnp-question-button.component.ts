import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'cnp-question-button',
  templateUrl: './cnp-question-button.component.html',
  styleUrls: ['./cnp-question-button.component.scss']
})
export class CnpQuestionButtonComponent implements OnInit {
  @Output() goToNext = new EventEmitter();
  @Input() question: any;

  constructor() { }

  ngOnInit(): void {
    console.log('CnpQuestionButtonComponent');
  }

  goToSelectedButton(){

  }
}
