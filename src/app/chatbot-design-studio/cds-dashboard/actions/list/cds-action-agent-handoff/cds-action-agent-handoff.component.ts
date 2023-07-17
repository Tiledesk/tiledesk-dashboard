import { ACTIONS_LIST } from 'app/chatbot-design-studio/utils';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActionAgent } from 'app/models/intent-model';

@Component({
  selector: 'cds-action-agent',
  templateUrl: './cds-action-agent-handoff.component.html',
  styleUrls: ['./cds-action-agent-handoff.component.scss']
})
export class CdsActionAgentHandoffComponent implements OnInit {

  @Input() action: ActionAgent;
  @Output() updateAndSaveAction = new EventEmitter();
  @Input() previewMode: boolean = true;
  actions = ACTIONS_LIST

  constructor() { }

  ngOnInit(): void {
  }

}
