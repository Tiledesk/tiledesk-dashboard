import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Chatbot } from 'app/models/faq_kb-model';

@Component({
  selector: 'appdashboard-cds-chatbot-details',
  templateUrl: './cds-chatbot-details.component.html',
  styleUrls: ['./cds-chatbot-details.component.scss']
})
export class CdsChatbotDetailsComponent implements OnInit , OnChanges{
  @Input() selectedChatbot: Chatbot;
  HAS_SELECTED_BOT_DETAILS: boolean = true;
  HAS_SELECTED_BOT_IMPORTEXORT: boolean = false;
  
  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    console.log('[CDS-CHATBOT-DTLS] (OnChanges) selectedChatbot ', this.selectedChatbot)
  }


  toggleTab(displaysecodtab) {

    console.log('[TILEBOT] displaydetails', displaysecodtab)
    if (displaysecodtab) {
      this.HAS_SELECTED_BOT_DETAILS = false;
      this.HAS_SELECTED_BOT_IMPORTEXORT = true;
    } else {
      this.HAS_SELECTED_BOT_DETAILS = true;
      this.HAS_SELECTED_BOT_IMPORTEXORT = false;
    }

    console.log('[TILEBOT] toggle Tab Detail / Import Export HAS_SELECTED_BOT_DETAILS', this.HAS_SELECTED_BOT_DETAILS)
    console.log('[TILEBOT] toggle Tab Detail / Import Export HAS_SELECTED_BOT_IMPORTEXORT', this.HAS_SELECTED_BOT_IMPORTEXORT)
  }

}
