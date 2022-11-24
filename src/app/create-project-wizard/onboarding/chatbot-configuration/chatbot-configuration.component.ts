import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'appdashboard-chatbot-configuration',
  templateUrl: './chatbot-configuration.component.html',
  styleUrls: ['./chatbot-configuration.component.scss']
})
export class ChatbotConfigurationComponent implements OnInit {
  @Output() nextPage = new EventEmitter();
  @Output() nextPageNoFaq = new EventEmitter();
  @Output() prevPage = new EventEmitter();
  @Input() selectedQuestion: string;
  @Input() welcomeMessage: string;
  @Input() primaryColor: string;
  @Input() secondaryColor: string;
  @Input() projectName: string;
  @Input() questions: string[];
  @Input() answers: string[];
  @Input() DISPLAY_SPINNER_SECTION: boolean;

  DISPLAY_WIDGET_CHAT: boolean = true;
  HAS_FOCUSED_ONLINE_MSG: boolean = true;

  step: number;
  lastQuestion: boolean;
  questionError: boolean;
  answerError: boolean;
  questionMsg: string;
  answerMsg: string;
  numCharsTitle = 0;
  limitCharsTitle = 35;
  numCharsText = 0;
  limitCharsText = 500;
  translateY: string;

  constructor() { 
    // is empty
  }

  ngOnInit() {
    this.init();
  }

  init(){
    this.questionError = false;
    this.answerError = false;
    this.step = 0;
    this.lastQuestion = false;
    this.translateY = 'translateY(0px)';
    this.initQuestion();
  }

  initQuestion(){
    if(this.questions[this.step]){
      this.questionMsg = this.questions[this.step];
      this.numCharsTitle = this.questionMsg.length;
    }
    if(this.answers[this.step]){
      this.answerMsg = this.answers[this.step];
      this.numCharsText = this.answerMsg.length;
    }
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
    this.questions[this.step] = this.questionMsg;
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
    this.answers[this.step] = this.answerMsg;
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
    let event = { step:'step1'}
    this.prevPage.emit(event);
  }

  goToNextPageAndSaveAllQuestions() {
    let event = { step:'step3', questions:this.questions, answers: this.answers}
    this.nextPage.emit(event);
  }

  // goToNextPageAndSaveQuestions() {
  //   this.questions.pop();
  //   this.answers.pop();
  //   let event = { step:'step3', questions:this.questions, answers: this.answers}
  //   this.changePage.emit(event);
  // }

  goToNextPage() {
    let event = { step:'step3', questions:[], answers:[] }
    this.nextPageNoFaq.emit(event);
  }


  goToPrevStep() {
    this.lastQuestion = false;
    if(this.step > 0){
      this.step--;
      this.questionError = false;
      this.answerError = false;
      // this.changeStepNumber.emit(-1);
      this.initQuestion();
      this.gotToChangeStepNumber();
    }
  }

  goToNextStep(){
    if(this.step < (this.questions.length-1)){
      this.step++;
      this.questionError = false;
      this.answerError = false;
      // this.changeStepNumber.emit(1);
      this.initQuestion();
      this.gotToChangeStepNumber();
      if(this.step === (this.questions.length-1)){
        this.lastQuestion = true;
      } else {
        this.lastQuestion = false;
      }
    }
  }

  gotToChangeStepNumber(){
    this.translateY = 'translateY('+(-(this.step+1)*20+20)+'px)';
  }



}
