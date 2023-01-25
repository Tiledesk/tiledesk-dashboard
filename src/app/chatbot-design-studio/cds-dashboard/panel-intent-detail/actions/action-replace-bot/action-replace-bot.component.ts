import { Chatbot } from 'app/models/faq_kb-model';
import { ActionReplaceBot } from 'app/models/intent-model';
import { FaqKbService } from 'app/services/faq-kb.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'cds-action-replace-bot',
  templateUrl: './action-replace-bot.component.html',
  styleUrls: ['./action-replace-bot.component.scss']
})
export class ActionReplaceBotComponent implements OnInit {

  @Input() action: ActionReplaceBot;

  //bots: Chatbot[] = [];
  chatbots_name_list: string[] = [];
  bot_selected: Chatbot;
  
  constructor(private chatbotService: FaqKbService) { }

  ngOnInit(): void {
    console.log("[ACTION REPLACE BOT] action: ", this.action)
    this.getAllBots();
  }

  getAllBots() {
    this.chatbotService.getAllBotByProjectId().subscribe((chatbots) => {
      console.log("[ACTION REPLACE BOT] chatbots: ", chatbots);
      //this.bots = bots;
      this.chatbots_name_list = chatbots.map(a => a.name);
    }, (error) => {
      console.error("[ACTION REPLACE BOT] error get bots: ", error);
    }, () => {
      console.log("[ACTION REPLACE BOT] get all chatbots completed.");
    })
  }

  onChangeActionButton(event) {
    //console.log("[ACTION REPLACE BOT] onChangeActionButton event: ", event)
    this.action.botName = event;
    console.log("[ACTION REPLACE BOT] action edited: ", this.action)
  }

}
