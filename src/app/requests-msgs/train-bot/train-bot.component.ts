import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { slideInOutAnimation } from '../../_animations/index';

@Component({
  selector: 'appdashboard-train-bot',
  templateUrl: './train-bot.component.html',
  styleUrls: ['./train-bot.component.scss'],
  animations: [slideInOutAnimation],
  // tslint:disable-next-line:use-host-property-decorator
  host: { '[@slideInOutAnimation]': '' }
})
export class TrainBotComponent implements OnInit {

  @Output() valueChange = new EventEmitter();
  @Input()  selectedQuestion;
  constructor() { }

  ngOnInit() {

    console.log('selectedQuestion ', this.selectedQuestion);
  }


  closeRightSideBar() {

    console.log('closeRightSideBar ')
    this.valueChange.emit(false);
  }
}
