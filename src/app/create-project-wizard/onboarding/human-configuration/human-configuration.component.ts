import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'appdashboard-human-configuration',
  templateUrl: './human-configuration.component.html',
  styleUrls: ['./human-configuration.component.scss']
})
export class HumanConfigurationComponent implements OnInit {
  @Output() lastPage = new EventEmitter();
  @Output() nextPage = new EventEmitter();
  @Output() prevPage = new EventEmitter();
  @Input() selectedQuestion: string;
  @Input() welcomeMessage: string;
  @Input() primaryColor: string;
  @Input() secondaryColor: string;
  @Input() projectName: string;
  @Input() questions: string[];
  @Input() answers: string[];
  @Input() questionMsg: string;
  @Input() answerMsg: string;
  @Input() DISPLAY_SPINNER_SECTION: boolean;

  step: number; 
  page = 'first';

  lastQuestion: boolean;
  questionError: boolean;
  answerError: boolean;

  numCharsTitle = 0;
  limitCharsTitle = 35;
  numCharsText = 0;
  limitCharsText = 500;
  HAS_FOCUSED_ONLINE_MSG: boolean = true;

  constructor() { 
    // is empty
  }

  ngOnInit() {
    this.init();
  }

  init(){
    this.step = this.questions.length;
    this.questionError = false;
    this.answerError = false;
    this.lastQuestion = false;
    this.initQuestion();
  }

  initQuestion(){
    if(this.questionMsg){
      this.numCharsTitle = this.questionMsg.length;
    }
    if(this.answerMsg){
      this.numCharsText = this.answerMsg.length;
    }
    this.questions.push(this.questionMsg);
    this.answers.push(this.answerMsg);
  }


  titleChange(event:string) {
    this.numCharsTitle = event.length;
    this.questionMsg = event;
    if(this.numCharsTitle > this.limitCharsTitle){
      this.questionMsg = this.questionMsg.substring(0,this.limitCharsTitle);
      this.numCharsTitle = this.limitCharsTitle;
      this.questionError = true;
    } else {
      this.questionError = false;
    }
    this.questions[this.questions.length-1] = this.questionMsg;
  }

  messageChange(event:string) {
    this.numCharsText = event.length;
    this.answerMsg = event;
    if(this.numCharsText > this.limitCharsText){
      this.answerMsg = this.answerMsg.substring(0,this.limitCharsText);
      this.numCharsText = this.limitCharsText;
      this.answerError = true;
    } else {
      this.answerError = false;
    }
    this.answers[this.answers.length-1] = this.answerMsg;
  }

  checkError(){
    if(this.questionMsg.length == 0 || this.questionMsg.length >= this.limitCharsTitle){
      this.questionError = true;
      return false;
    }
    if(this.answerMsg.length == 0 || this.answerMsg.length >= this.limitCharsText){
      this.answerError = true;
      return false;
    }
    return true;
  }

  goToPrevPage() {
    this.questions.pop();
    this.answers.pop();
    let event = { step:'step2'}
    this.prevPage.emit(event);
    this.page = 'first';
  }

  goToNextPage() {
    this.questions.pop();
    this.answers.pop();
    this.answerMsg = this.answerMsg + '\n\\agent';
    this.answers.push(this.answerMsg);
    this.questions.push(this.questionMsg);
    let event = { step:'createBot', questions:this.questions, answers: this.answers}
    this.nextPage.emit(event);
  }

  goToNextPageWithoutAgent() {
    this.questions.pop();
    this.answers.pop();
    let event = { step:'createBot', questions:this.questions, answers: this.answers}
    this.lastPage.emit(event);
  }


  goToPrevStep(){
    this.page = 'first';
  }

  goToNextStep(){
    this.page = 'second';
  }
}
