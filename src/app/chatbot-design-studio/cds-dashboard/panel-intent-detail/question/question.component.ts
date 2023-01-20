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
  questions_array: string[]

  constructor() { }

  ngOnInit(): void {
    this.question = this.intentSelected.question
  }


  ngOnChanges() {
    console.log('[INTENT-QUESTION] intent ' ,this.intentSelected) 

    if(this.intentSelected && this.intentSelected.question) {
    console.log('[INTENT-QUESTION] intent > question' ,this.intentSelected.question) 

    this.questions_array = this.intentSelected.question.split(/\r?\n/).filter(element => element);
       
    console.log('[INTENT-QUESTION] questions_array', this.questions_array);
  }
  }

  onChangeText(_question:string) { 
    // console.log('[INTENT-QUESTION] onChangeText _question' , _question) 
    this.intentSelected.question = _question
  }

  saveQuestion(){
    console.log('[INTENT-QUESTION] saveQuestion intentSelected > question' , this.intentSelected.question) 
  } 

  trackByIndex(index: number, obj: any): any {
    return index;
  }

}
