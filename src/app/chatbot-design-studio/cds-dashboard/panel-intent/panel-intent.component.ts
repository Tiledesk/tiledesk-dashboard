import { Component, OnInit, Input } from '@angular/core';
import { Intent } from '../../../models/intent-model';

@Component({
  selector: 'appdashboard-panel-intent',
  templateUrl: './panel-intent.component.html',
  styleUrls: ['./panel-intent.component.scss']
})


export class PanelIntentComponent implements OnInit {
  @Input() intentSelected: Intent;

  actions: Array<any>
  displayActions: boolean = false

  constructor() { }

  ngOnInit(): void {

    this.actions = [
      {
        type: 'reply',
        content: {
          text: '',
          commands: [
            {
              type: 'text',
              message: 'ciao',
              time: 2000
            }
          ]
        }
      },
      {
        type: 'agent',
        content: {
          goto: '/agent'
        }
      },
      {
        type: 'email',
        content: {
          recipient: '',
        }
      },
    ]
  }

  toggleActions(_displayActions) {
    this.displayActions = _displayActions
    console.log('PANEL INTENT displayActions', this.displayActions)
  }

}
