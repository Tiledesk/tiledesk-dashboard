import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Intent } from 'app/models/intent-model';
// import { Question } from 'app/models/intent-model';

@Component({
  selector: 'appdashboard-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss']
})
export class QuestionComponent implements OnInit, OnChanges {
  @Input() intentSelected: Intent;
  public question: string

  constructor() { }

  ngOnInit(): void {
    this.question = this.intentSelected.question
  }


  ngOnChanges() {
    console.log('[INTENT-QUESTION] intent ' ,this.intentSelected) 
  }

  onChangeText(_question:string) { 
    // console.log('[INTENT-QUESTION] onChangeText _question' , _question) 
    this.intentSelected.question = _question
  }

}
