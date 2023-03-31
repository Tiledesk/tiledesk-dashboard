import { Component, Input, OnChanges, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'appdashboard-answer',
  templateUrl: './answer.component.html',
  styleUrls: ['./answer.component.scss']
})
export class AnswerComponent implements OnInit , OnChanges{
  @Input() intentSelected: any;
  @Output() changeAnswer = new EventEmitter();
  
  public answer: string;

  constructor() { }

  ngOnInit(): void {
    //this.answer = JSON.parse(JSON.stringify(this.intentSelected.answer));
    this.answer = this.intentSelected.answer
  }

  ngOnChanges() {
    // console.log('[INTENT-ANSWER] intentSelected ' ,this.intentSelected) 
  }

  onChangeText(_answer:string) { 
    //this.intentSelected.answer = _answer;
    console.log('onChangeText:: intentSelected:: ', this.intentSelected.answer);
    // console.log('onChangeText:: this.answer:: ', this.answer);
    console.log('onChangeText:: _answer:: ', _answer);
    this.changeAnswer.emit(_answer);
    // console.log('[INTENT-ANSWER] onChangeText text' , _answer) 
  }

}
