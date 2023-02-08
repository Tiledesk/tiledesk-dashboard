import { ActionEmail } from 'app/models/intent-model';
import { Component, OnInit, Input } from '@angular/core';
import { TEXT_CHARS_LIMIT } from './../../../../utils';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'cds-action-email',
  templateUrl: './action-email.component.html',
  styleUrls: ['./action-email.component.scss']
})
export class ActionEmailComponent implements OnInit {

  @Input() action: ActionEmail;

  email_error: boolean = false;
  // intents = ['uno', 'due', 'tre'];


  constructor(
    private logger: LoggerService,
  ) { }

  ngOnInit(): void {
    this.logger.log("[ACTION-EMAIL] elementSelected: ", this.action)
  }


  onChangeActionButton(event) {
    //this.logger.log("event: ", event)
  }

  onToChange(event) {
    this.logger.log("[ACTION-EMAIL] onToChange event: ", event);
    this.action.to = event;
  }

  // onTextChange(event) {
  //   this.logger.log("[ACTION-EMAIL] onTextChange event: ", event);
  //   //this.elementSelected.intentName = event;
  // }

}
