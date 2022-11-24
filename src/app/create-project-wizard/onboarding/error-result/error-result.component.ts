import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'appdashboard-error-result',
  templateUrl: './error-result.component.html',
  styleUrls: ['./error-result.component.scss']
})
export class ErrorResultComponent implements OnInit {

  @Output() cancel = new EventEmitter();
  @Output() continueToNextStep = new EventEmitter();
  @Input() DISPLAY_SPINNER: boolean;
  @Input() DISPLAY_BOT: boolean;
  @Input() DISPLAY_FAQ: boolean;
  @Input() CREATE_BOT_ERROR: boolean;
  @Input() CREATE_FAQ_ERROR: boolean;

  constructor() { 
    // is empty
  }

  ngOnInit(): void {
    // is empty
  }


  // NAVIGATION //
  goToCancel(event) {
    this.cancel.emit(event);
  }

  goToContinueToNextStep(event) {
    this.continueToNextStep.emit(event);
  }

}
