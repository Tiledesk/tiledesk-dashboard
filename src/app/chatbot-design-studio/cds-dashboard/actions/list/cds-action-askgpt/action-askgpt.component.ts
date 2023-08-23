import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
export class CdsActionAskgptComponent implements OnInit {

  @Input() action: ActionAskGPT;
  @Input() previewMode: boolean = true;
  @Output() updateAndSaveAction = new EventEmitter;

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
    console.log("[ACTION-ASKGPT] elementSelected: ", this.action);
    this.question = this.action.question;
    this.kbid = this.action.kbid;
    this.gptkey = this.action.gptkey;

    this.initializeAttributes();
    this.initializeAction();

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

  private initializeAction() {
    if (!this.action.assignReplyTo) {
      console.log("assente: ", this.action.assignReplyTo);
    } else {
      console.log("presente ", this.action.assignReplyTo);
    }
    //this.action.assignReplyTo = 'gpt_reply'
  }

  changeTextarea($event: string, property: string) {
    this.logger.log("[ACTION-ASKGPT] onEditableDivTextChange event", $event)
    this.logger.log("[ACTION-ASKGPT] onEditableDivTextChange property", property)
    this.action[property] = $event
    // this.updateAndSaveAction.emit()
  }

  onSelectedAttribute(event, property) {
    this.logger.log("[ACTION-ASKGPT] onEditableDivTextChange event", event)
    this.logger.log("[ACTION-ASKGPT] onEditableDivTextChange property", property)
    console.log("[ACTION-ASKGPT] onEditableDivTextChange event", event)
    console.log("[ACTION-ASKGPT] onEditableDivTextChange property", property)
    this.action[property] = event.value;
    // this.updateAndSaveAction.emit()
  }

}
