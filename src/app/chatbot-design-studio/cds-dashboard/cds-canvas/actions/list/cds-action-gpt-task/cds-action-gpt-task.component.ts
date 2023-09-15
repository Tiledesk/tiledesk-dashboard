import { Component, EventEmitter, HostListener, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { ActionGPTTask, Intent } from 'app/models/intent-model';
import { LoggerService } from 'app/services/logger/logger.service';
import { variableList } from 'app/chatbot-design-studio/utils';
import { MatDialog } from '@angular/material/dialog';
import { OpenaikbsService } from 'app/services/openaikbs.service';
import { IntentService } from 'app/chatbot-design-studio/services/intent.service';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';


@Component({
  selector: 'cds-action-gpt-task',
  templateUrl: './cds-action-gpt-task.component.html',
  styleUrls: ['./cds-action-gpt-task.component.scss']
})
export class CdsActionGPTTaskComponent implements OnInit {

  @Input() intentSelected: Intent;
  @Input() action: ActionGPTTask;
  @Input() previewMode: boolean = true;
  @Output() updateAndSaveAction = new EventEmitter;

  panelOpenState = false;
  models_list = [{ name: "GPT-3 (DaVinci)", value: "text-davinci-003" },{ name: "GPT-3.5 Turbo (ChatGPT)", value: "gpt-3.5-turbo" },{ name: "GPT-4 (ChatGPT)", value: "gpt-4" }];
  

  constructor(
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
    console.log("[ACTION GPT-TASK] ngOnInit action: ", this.action);
    this.initializeAttributes();
  }

  ngOnChanges(changes: SimpleChanges) {
  }


  private initializeAttributes() {
    let new_attributes = [];
    if (!variableList.userDefined.some(v => v.name === 'gpt_reply')) {
      new_attributes.push({ name: "gpt_reply", value: "gpt_reply" });
    }
    variableList.userDefined = [ ...variableList.userDefined, ...new_attributes];
    this.logger.debug("[ACTION GPT-TASK] Initialized variableList.userDefined: ", variableList.userDefined);
  }

  changeTextarea($event: string, property: string) {
    this.logger.debug("[ACTION GPT-TASK] changeTextarea event: ", $event);
    this.logger.debug("[ACTION GPT-TASK] changeTextarea propery: ", property);
    this.action[property] = $event;
    this.updateAndSaveAction.emit();
  }

  onSelectedAttribute(event, property) {
    this.logger.log("[ACTION GPT-TASK] onEditableDivTextChange event", event)
    this.logger.log("[ACTION GPT-TASK] onEditableDivTextChange property", property)
    this.action[property] = event.value;
    this.updateAndSaveAction.emit();
  }

  onChangeSelect(event, target) {
    this.logger.debug("[ACTION GPT-TASK] onChangeSelect event: ", event.value)
    this.logger.debug("[ACTION GPT-TASK] onChangeSelect target: ", target)
    this.action[target] = event.value;
    this.updateAndSaveAction.emit();
  }

  updateSliderValue(event, target)  {
    this.logger.debug("[ACTION GPT-TASK] updateSliderValue event: ", event)
    this.logger.debug("[ACTION GPT-TASK] updateSliderValue target: ", target)

    if (event.value) {
      this.action[target] = event.value;
    } else {
      this.action[target] = event;
    }
    this.updateAndSaveAction.emit();
  }


}
