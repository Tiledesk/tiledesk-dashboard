import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'appdashboard-answer',
  templateUrl: './answer.component.html',
  styleUrls: ['./answer.component.scss']
})
export class AnswerComponent implements OnInit , OnChanges{
  @Input() intentSelected: any;
  public answer: string;

  constructor() { }

  ngOnInit(): void {
    this.answer = this.intentSelected.answer
  }

  ngOnChanges() {
    // console.log('[INTENT-ANSWER] intentSelected ' ,this.intentSelected) 

  }

  onChangeText(_answer:string) { 
    // console.log('[INTENT-ANSWER] onChangeText text' , _answer) 
    this.intentSelected.answer = _answer
  }

}
