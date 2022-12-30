import { Component, OnInit, Input } from '@angular/core';
import { Intent } from '../../../models/intent-model';

@Component({
  selector: 'appdashboard-panel-intent',
  templateUrl: './panel-intent.component.html',
  styleUrls: ['./panel-intent.component.scss']
})
export class PanelIntentComponent implements OnInit {
  @Input() intentSelected: Intent;
  constructor() { }

  ngOnInit(): void {
  }

}
