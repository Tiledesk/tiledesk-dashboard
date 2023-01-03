import { Component, ElementRef, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'appdashboard-panel-actions',
  templateUrl: './panel-actions.component.html',
  styleUrls: ['./panel-actions.component.scss']
})
export class PanelActionsComponent implements OnInit, OnChanges {
  showFiller = false;
  @Input() isOpenActionDrawer: boolean;
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

    // console.log('[PANEL ACTION] isOpenActionDrawer ',this.isOpenActionDrawer)
    // if (this.isOpenActionDrawer === true)  {
    //   this.drawer.open()
    // } else if (this.isOpenActionDrawer === false)  {
    //   this.drawer.close()
    // }
  }

  closeActionsDrawer() {
    this.isOpenActionDrawer = false
  }

  actionSelected(action: string) {
    console.log('[PANEL ACTION] actionSelected ', action)
  }



}
