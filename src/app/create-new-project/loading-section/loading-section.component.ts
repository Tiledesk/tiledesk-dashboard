import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'loading-section',
  templateUrl: './loading-section.component.html',
  styleUrls: ['./loading-section.component.scss']
})
export class LoadingSectionComponent implements OnInit {
  @Input() DISPLAY_SPINNER_SECTION: any;
  @Input() DISPLAY_SPINNER: any;
  @Output() continueToNextStep = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }


  goToContinueToNextStep(){
    this.continueToNextStep.emit();
  }
}
