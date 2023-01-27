import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'appdashboard-create-chatbot',
  templateUrl: './create-chatbot.component.html',
  styleUrls: ['./create-chatbot.component.scss']
})
export class CreateChatbotComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    this.getCommunityTemplatesAndFilterForStartChatbot()
  }

  getCommunityTemplatesAndFilterForStartChatbot() {
    
  }

}
