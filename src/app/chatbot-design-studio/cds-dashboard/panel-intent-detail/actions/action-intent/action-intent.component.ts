import { ActionIntentConnected } from 'app/models/intent-model';
import { Component, OnInit, Input } from '@angular/core';
import { TEXT_CHARS_LIMIT } from './../../../../utils';

@Component({
  selector: 'cds-action-intent',
  templateUrl: './action-intent.component.html',
  styleUrls: ['./action-intent.component.scss']
})
export class ActionIntentComponent implements OnInit {

  @Input() intents: Array<any>;
  @Input() elementSelected: ActionIntentConnected;

  filtered_intents = [];
  limitCharsText = TEXT_CHARS_LIMIT;

  // to delete
  buttonAction: any;

  constructor() { }

  ngOnInit(): void {
    console.log("[ACTION-INTENT] intents: ", this.intents)
    this.filtered_intents = this.intents;
    console.log("[ACTION-INTENT] elementSelected: ", this.elementSelected)
  }

  onKey(event) {
    console.log("[ACTION-INTENT] onKey event: ", event);
    this.filtered_intents = this.intents;
    this.filtered_intents = this.filtered_intents.filter(intent => intent.toLowerCase().includes(event.toLowerCase()));
  }

  onChangeActionButton(event) {
    //console.log("event: ", event)
  }

  onTextChange(event) {
    console.log("[ACTION-INTENT] onTextChange event: ", event);
    this.elementSelected.intentName = event;
  }



}
