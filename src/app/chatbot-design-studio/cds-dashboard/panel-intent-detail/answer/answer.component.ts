import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'appdashboard-answer',
  templateUrl: './answer.component.html',
  styleUrls: ['./answer.component.scss']
})
export class AnswerComponent implements OnInit , OnChanges{
  @Input() answer: any;
  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    console.log('[INTENT-ANSWER] answer ' ,this.answer) 

  }

  onChangeText(text:string) { 
    console.log('[INTENT-ANSWER] onChangeText text' , text) 
  }

}
