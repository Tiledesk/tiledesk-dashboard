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
  questions_array: string[] = []
  newQuestion: string

  constructor() { }

  ngOnInit(): void {
    this.question = this.intentSelected.question
  }


  ngOnChanges() {
    console.log('[INTENT-QUESTION] (OnChanges)  intentSelected ', this.intentSelected)

    if (this.intentSelected && this.intentSelected.question) {
      console.log('[INTENT-QUESTION] (OnChanges) intent > question', this.intentSelected.question)

      this.questions_array = this.intentSelected.question.split(/\r?\n/).filter(element => element);

      console.log('[INTENT-QUESTION] (OnChanges) questions_array', this.questions_array);
    }
  }

  addQuestion() {
    console.log('[INTENT-QUESTION] ADD QUESTION new question', this.newQuestion)
    this.questions_array.push(this.newQuestion)
    console.log('[INTENT-QUESTION] ADD QUESTION questions_array ', this.questions_array)
    const questionArrayJoinedWithNewLine = this.questions_array.join('\n')
    this.intentSelected.question = questionArrayJoinedWithNewLine.toString();
    this.newQuestion = ''
  }


  removeQuestion(questionindex: number) {
    this.questions_array.splice(questionindex, 1); 
    console.log('[INTENT-QUESTION] REMOVE QUESTION questions_array ', this.questions_array)
    const questionArrayJoinedWithNewLine = this.questions_array.join('\n')
    this.intentSelected.question = questionArrayJoinedWithNewLine.toString();

  }
  onChangeText(_question: string, index: number) {
    console.log('[INTENT-QUESTION] onChangeText _question', _question)
    console.log('[INTENT-QUESTION] onChangeText index', index)
    // this.intentSelected.question = _question
    console.log('[INTENT-QUESTION] onChangeText  > question ', _question)
    console.log('[INTENT-QUESTION] onChangeText questions_array ', this.questions_array)
    console.log('[INTENT-QUESTION] onChangeText questions_array - question at index ', index, ': ', this.questions_array[index])
    this.questions_array[index] = _question
    console.log('[INTENT-QUESTION] onChangeText EDITED questions_array ', this.questions_array)
    // console.log('[INTENT-QUESTION] onChangeText EDITED questions_array replaced comma' ,  this.questions_array.join(',').replace(/,/g, '/n'))
    const questionArrayJoinedWithNewLine = this.questions_array.join('\n')
    console.log('[INTENT-QUESTION] onChangeText EDITED questions_array questionArrayJoinedWithNewLine', questionArrayJoinedWithNewLine)
    console.log('[INTENT-QUESTION] onChangeText EDITED questions_array questionArrayJoinedWithNewLine TO STRING', questionArrayJoinedWithNewLine.toString())
    this.intentSelected.question = questionArrayJoinedWithNewLine.toString();
    console.log('[INTENT-QUESTION] onChangeText  intentSelected  > question', this.intentSelected.question)
  }

  saveQuestion() {
    console.log('[INTENT-QUESTION] saveQuestion intentSelected > question', this.intentSelected.question)
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }

}
