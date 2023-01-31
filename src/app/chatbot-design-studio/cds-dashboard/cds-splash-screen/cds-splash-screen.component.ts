import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'cds-splash-screen',
  templateUrl: './cds-splash-screen.component.html',
  styleUrls: ['./cds-splash-screen.component.scss']
})
export class CdsSplashScreenComponent implements OnInit {
  
  @Input() text: string
  @Output() onClickBtn = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  onAdd() {
    this.onClickBtn.emit(true);
  }

}
