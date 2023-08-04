import { Component, Input, OnInit } from '@angular/core';
import { ActionAskGPT } from 'app/models/intent-model';
import { LoggerService } from 'app/services/logger/logger.service';
import { variableList } from 'app/chatbot-design-studio/utils';
import { FaqKbService } from 'app/services/faq-kb.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'cds-action-askgpt',
  templateUrl: './action-askgpt.component.html',
  styleUrls: ['./action-askgpt.component.scss']
})
export class ActionAskgptComponent implements OnInit {

  @Input() action: ActionAskGPT;

  question: string = "";
  kbid: string = "";
  gptkey: string = "";

  idBot: string;
  variableListUserDefined: Array<{ name: string, value: string }> // = variableList.userDefined 

  constructor(
    private faqkbService: FaqKbService,
    private logger: LoggerService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.logger.debug("[ACTION-ASKGPT] elementSelected: ", this.action);
    this.question = this.action.question;
    this.kbid = this.action.kbid;
    this.gptkey = this.action.gptkey;

    // this.getBotId();
    this.initializeAttributes();
  }

  private initializeAttributes() {
    let new_attributes = [];
    if (!variableList.userDefined.some(v => v.name === 'gpt_reply')) {
      new_attributes.push({ name: "gpt_reply", value: "gpt_reply" });
    }
    if (!variableList.userDefined.some(v => v.name === 'gpt_source')) {
      new_attributes.push({ name: "gpt_source", value: "gpt_source" });
    }
    if (!variableList.userDefined.some(v => v.name === 'gpt_success')) {
      new_attributes.push({ name: "gpt_success", value: "gpt_success" });
    }
    variableList.userDefined = [ ...variableList.userDefined, ...new_attributes];
    console.log("Initialized variableList.userDefined: ", variableList.userDefined);
  }

  changeTextarea($event: string, property: string) {
    this.logger.log("[ACTION-ASKGPT] onEditableDivTextChange event", $event)
    this.logger.log("[ACTION-ASKGPT] onEditableDivTextChange property", property)
    this.action[property] = $event
  }

  onSelectedAttribute(event, property) {
    this.logger.log("[ACTION-ASKGPT] onEditableDivTextChange event", event)
    this.logger.log("[ACTION-ASKGPT] onEditableDivTextChange property", property)
    this.action[property] = event.value;
  }

}
