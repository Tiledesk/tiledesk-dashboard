import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'appdashboard-chatbot-setup',
  templateUrl: './chatbot-setup.component.html',
  styleUrls: ['./chatbot-setup.component.scss']
})
export class ChatbotSetupComponent implements OnInit {
  @Output() nextPage = new EventEmitter();
  @Output() lastPage = new EventEmitter();
  @Input() selectedQuestion: string;
  constructor() { 
    // is empty
  }

  ngOnInit(): void {
    // is empty
  }

  goToNextStep(event){
    this.nextPage.emit(event);
  }

  goToLastStep(){
    this.lastPage.emit();
  }

}
