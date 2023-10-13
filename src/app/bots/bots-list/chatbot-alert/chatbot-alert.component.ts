import { Component, OnInit } from '@angular/core';
import { BotsBaseComponent } from 'app/bots/bots-base/bots-base.component';
import { FaqKbService } from 'app/services/faq-kb.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { ProjectPlanService } from 'app/services/project-plan.service';

@Component({
  selector: 'appdashboard-chatbot-alert',
  templateUrl: './chatbot-alert.component.html',
  styleUrls: ['./chatbot-alert.component.scss']
})
export class ChatbotAlertComponent extends BotsBaseComponent implements OnInit {
  public chatBotCount: number;

  constructor(
    public prjctPlanService: ProjectPlanService,
    private logger: LoggerService,
    private faqKbService: FaqKbService,
  ) { 
    super(prjctPlanService);
    this.getProjectPlan();
  }

  ngOnInit(): void {
    this.getFaqKbByProjectId();
  }

  getFaqKbByProjectId() {
    this.faqKbService.getFaqKbByProjectId().subscribe((faqKb: any) => {
      console.log('[CHATBOT-ALERT] - GET BOTS BY PROJECT ID > RES', faqKb);
      if (faqKb) {
        this.chatBotCount = faqKb.length;
        console.log('[CHATBOT-ALERT] - GET BOTS BY PROJECT ID > chatBotCount', this.chatBotCount);
      }
    }, (error) => {
      this.logger.error('[CHATBOT-ALERT] GET BOTS ERROR ', error);
    }, () => {
      this.logger.log('[CHATBOT-ALERT] GET BOTS * COMPLETE *');

    });
  }

}
