import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ActionWait } from 'app/models/intent-model';

@Component({
  selector: 'cds-action-wait',
  templateUrl: './action-wait.component.html',
  styleUrls: ['./action-wait.component.scss']
})
export class ActionWaitComponent implements OnInit, OnChanges {

  @Input() action: ActionWait;
  
  delayTime: number;

  constructor() { }

  ngOnInit(): void {
  }
  ngOnChanges() {
    // console.log('[ACTION-WAIT] wait this.actionwait.millis ', this.action.millis)
    const waitInSec = this.action.millis / 1000
    this.delayTime = waitInSec
  }

  formatLabel(value: number) {
    // console.log('[ACTION-WAIT] formatLabel value ', value)
    return value + 's';
  }

  updateWaitValue(event) {
    // console.log('[ACTION-WAIT] formatLabel updateSetting ', event.value)
    const msvalue = event.value * 1000

    this.action.millis = msvalue
    // this.delayTime  = msvalue
    // console.log('[ACTION-WAIT] formatLabel msvalue ', msvalue)
  }
}
