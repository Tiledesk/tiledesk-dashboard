import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'cds-splash-screen',
  templateUrl: './cds-splash-screen.component.html',
  styleUrls: ['./cds-splash-screen.component.scss']
})
export class CdsSplashScreenComponent implements OnInit {
  @Output() addIntentBtnClicked = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  addNewIntent() {
    this.addIntentBtnClicked.emit(true);
  }

}
