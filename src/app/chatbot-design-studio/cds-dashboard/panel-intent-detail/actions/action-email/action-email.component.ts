import { ActionEmail } from 'app/models/intent-model';
import { Component, OnInit, Input } from '@angular/core';
import { TEXT_CHARS_LIMIT } from './../../../../utils';

@Component({
  selector: 'cds-action-email',
  templateUrl: './action-email.component.html',
  styleUrls: ['./action-email.component.scss']
})
export class ActionEmailComponent implements OnInit {

  @Input() action: ActionEmail;

  email_error: boolean = false;
  // intents = ['uno', 'due', 'tre'];


  constructor() { }

  ngOnInit(): void {
    console.log("[ACTION-EMAIL] elementSelected: ", this.action)
  }


  onChangeActionButton(event) {
    //console.log("event: ", event)
  }

  onToChange(event) {
    console.log("[ACTION-EMAIL] onToChange event: ", event);
    this.action.to = event;
  }

  // onTextChange(event) {
  //   console.log("[ACTION-EMAIL] onTextChange event: ", event);
  //   //this.elementSelected.intentName = event;
  // }

}
