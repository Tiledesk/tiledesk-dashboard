import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'appdashboard-human-configuration',
  templateUrl: './human-configuration.component.html',
  styleUrls: ['./human-configuration.component.scss']
})
export class HumanConfigurationComponent implements OnInit {
  @Output() changePage = new EventEmitter();
  @Output() changeStepNumber = new EventEmitter();
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
    this.changePage.emit(event);
    this.page = 'first';
  }

  goToNextPage() {
    this.answerMsg = this.answers.pop() + '\n\\agent';
    this.answers.push(this.answerMsg);
    let event = { step:'createBot', questions:this.questions, answers: this.answers}
    this.changePage.emit(event);
  }

  goToNextPageWithoutHuman() {
    this.questions.pop();
    this.answers.pop();
    let event = { step:'createBot', questions:this.questions, answers: this.answers}
    this.changePage.emit(event);
  }


  goToPrevStep(){
    this.page = 'first';
  }

  goToNextStep(){
    this.page = 'second';
  }
}
