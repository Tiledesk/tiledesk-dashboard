import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ActionWait } from 'app/models/intent-model';

@Component({
  selector: 'appdashboard-action-wait',
  templateUrl: './action-wait.component.html',
  styleUrls: ['./action-wait.component.scss']
})
export class ActionWaitComponent implements OnInit, OnChanges {
  @Input() actionwait: ActionWait;
  constructor() { }

  ngOnInit(): void {
  }
  ngOnChanges() {
    console.log('[ACTION-WAIT] wait ', this.actionwait.millis = 500)
  }

  formatLabel(value: number) {
    let self = this
    console.log('[ACTION-WAIT] formatLabel value ', value)

    return value + 's';
  }

  updateSetting(event) {
    console.log('[ACTION-WAIT] formatLabel updateSetting ', event.value)
    const msvalue = event.value * 1000

    this.actionwait.millis = msvalue

    console.log('[ACTION-WAIT] formatLabel msvalue ', msvalue)
  }
}
