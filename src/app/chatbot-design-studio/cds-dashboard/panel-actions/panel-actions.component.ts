import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Action, Intent } from 'app/models/intent-model';


@Component({
  selector: 'appdashboard-panel-actions',
  templateUrl: './panel-actions.component.html',
  styleUrls: ['./panel-actions.component.scss']
})
export class PanelActionsComponent implements OnInit, OnChanges {
 

  @Input() isOpenActionDrawer: boolean;
  @Input() intentSelected: Intent
  @Output() openActionDrawer = new EventEmitter();

  // @ViewChild('drawer' ,{ static: false }) drawer: MatDrawer

  constructor() { }

  ngOnInit(): void {
  
  }

  ngOnChanges() {

    if (this.isOpenActionDrawer === true) {
      this.isOpenActionDrawer = true
    } else if (this.isOpenActionDrawer === false) {
      this.isOpenActionDrawer = false
    }

     console.log('[PANEL ACTION] isOpenActionDrawer ',this.isOpenActionDrawer)
     console.log('[PANEL ACTION] intentSelected ',this.intentSelected)
    // if (this.isOpenActionDrawer === true)  {
    //   this.drawer.open()
    // } else if (this.isOpenActionDrawer === false)  {
    //   this.drawer.close()
    // }
  }

  closeActionsDrawer() {
    this.isOpenActionDrawer = false
    this.openActionDrawer.emit(this.isOpenActionDrawer);
  }

  actionSelected(action: string) {
    console.log('[PANEL ACTION] actionSelected ', action)
    if (action === 'reply') {
      let action = new Action()
      action.type = 'reply'
      action.body = {
        text: '',
        commands: [
          {
            type: 'message',
            message: {
              text: 'A chat message will be sent to the visitor',
              type: 'text'
            }
          }
        ]
      }
    }
  }



}
