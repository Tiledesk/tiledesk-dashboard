import { Chatbot } from 'app/models/faq_kb-model';
import { ActionReplaceBot } from 'app/models/intent-model';
import { FaqKbService } from 'app/services/faq-kb.service';
import { Component, OnInit, Input } from '@angular/core';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'cds-action-replace-bot',
  templateUrl: './action-replace-bot.component.html',
  styleUrls: ['./action-replace-bot.component.scss']
})
export class ActionReplaceBotComponent implements OnInit {

  @Input() action: ActionReplaceBot;

  //bots: Chatbot[] = [];
  chatbots_name_list: Array<{name: string, value: string, icon?:string}>;
  bot_selected: Chatbot;
  
  constructor(
    private chatbotService: FaqKbService,
    private logger: LoggerService,
    ) { }

  ngOnInit(): void {
    this.logger.log("[ACTION REPLACE BOT] action: ", this.action)
    this.getAllBots();
  }

  getAllBots() {
    this.chatbotService.getAllBotByProjectId().subscribe((chatbots) => {
      this.logger.log("[ACTION REPLACE BOT] chatbots: ", chatbots);
      //this.bots = bots;
      this.chatbots_name_list = chatbots.map(a => ({ name: a.name, value: a.name, icon: 'smart_toy'}));
    }, (error) => {
      this.logger.error("[ACTION REPLACE BOT] error get bots: ", error);
    }, () => {
      this.logger.log("[ACTION REPLACE BOT] get all chatbots completed.");
    })
  }

  onChangeSelect(event) {
    //this.logger.log("[ACTION REPLACE BOT] onChangeActionButton event: ", event)
    this.action.botName = event.value;
    this.logger.log("[ACTION REPLACE BOT] action edited: ", this.action)
  }

}
