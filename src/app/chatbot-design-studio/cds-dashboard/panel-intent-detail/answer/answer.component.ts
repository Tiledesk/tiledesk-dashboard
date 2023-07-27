import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'appdashboard-answer',
  templateUrl: './answer.component.html',
  styleUrls: ['./answer.component.scss']
})
export class AnswerComponent implements OnInit {
  @Input() intentSelected: any;
  @Output() updateAnswerIntentSelected = new EventEmitter();
  
  public answer: string;

  constructor() { }

  ngOnInit(): void {
    // this.answer = JSON.parse(JSON.stringify(this.intentSelected.answer));
    this.answer = this.intentSelected.answer
  }

  onChangeText(_answer:string) { 
    // console.log('onChangeText:: _answer:: ', _answer);
    this.updateAnswerIntentSelected.emit(_answer);
  }

}
