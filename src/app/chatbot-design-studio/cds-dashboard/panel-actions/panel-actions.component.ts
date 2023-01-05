import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';


@Component({
  selector: 'appdashboard-panel-actions',
  templateUrl: './panel-actions.component.html',
  styleUrls: ['./panel-actions.component.scss']
})
export class PanelActionsComponent implements OnInit, OnChanges {
 

  @Input() isOpenActionDrawer: boolean;
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
  }



}
