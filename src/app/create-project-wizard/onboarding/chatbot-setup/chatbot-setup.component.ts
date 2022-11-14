import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'appdashboard-chatbot-setup',
  templateUrl: './chatbot-setup.component.html',
  styleUrls: ['./chatbot-setup.component.scss']
})
export class ChatbotSetupComponent implements OnInit {
  @Output() goToNextStep = new EventEmitter();
  @Output() continueToNextStep = new EventEmitter();
  @Input() selectedQuestion: string;
  constructor() { }

  ngOnInit(): void {
  }


  localGoToNextStep(event){
    this.goToNextStep.emit(event);
  }

  localContinueToNextStep(){
    this.continueToNextStep.emit(event);
  }

}
