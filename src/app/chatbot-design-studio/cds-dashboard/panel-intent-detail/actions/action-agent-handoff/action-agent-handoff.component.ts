import { ACTIONS_LIST } from 'app/chatbot-design-studio/utils';
import { Component, Input, OnInit } from '@angular/core';
import { ActionAgent } from 'app/models/intent-model';

@Component({
  selector: 'cds-action-agent',
  templateUrl: './action-agent-handoff.component.html',
  styleUrls: ['./action-agent-handoff.component.scss']
})
export class ActionAgentHandoffComponent implements OnInit {

  @Input() action: ActionAgent;

  actions = ACTIONS_LIST

  constructor() { }

  ngOnInit(): void {
  }

}
