import { Component, OnInit } from '@angular/core';
import { FaqKbService } from 'app/services/faq-kb.service';

@Component({
  selector: 'appdashboard-create-chatbot',
  templateUrl: './create-chatbot.component.html',
  styleUrls: ['./create-chatbot.component.scss']
})
export class CreateChatbotComponent implements OnInit {

  constructor(
    private faqKbService: FaqKbService,
  ) { }

  ngOnInit(): void {
    this.getCommunityTemplatesAndFilterForStartChatbot()
  }

 
    getCommunityTemplatesAndFilterForStartChatbot() {
      // this.showSpinner = true;
      this.faqKbService.getCommunityTemplates().subscribe((res: any) => {
  
        if (res) {
          const communityTemplates = res
          console.log('[CREATE-CHATBOT] communityTemplates' ,communityTemplates);
          // communityTemplates.forEach(template => {
          //   if () 
            
          // });

          const startChatBot = communityTemplates.filter((el) => {
            return el.mainCategory === "System" && el.tags.includes('start-chatbot')
          });
  
          console.log('[CREATE-CHATBOT] startChatBot' , startChatBot);
        }
  
      }, (error) => {
        console.error('[CREATE-CHATBOT] GET COMMUNITY TEMPLATES ERROR ', error);
      
      }, () => {
        console.log('[CREATE-CHATBOT] GET COMMUNITY TEMPLATES COMPLETE');
      
        // this.generateTagsBackground(this.templates)
      });
  
    }
  

}
