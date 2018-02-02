import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})


export class ChatComponent implements OnInit {

  actualHeight: any;
  navbarHeight = 51;

  newInnerHeight: any;
  // newInnerWidth: any;
  iframeHeight: any;

  constructor() {

  // // User screen size
  // const screenHeight = window.screen.height;
  // const screenWidth = window.screen.width;

  // // Actual space available in navigator
  // const actualHeight = window.innerHeight;
  // const actualWidth = window.innerWidth;
  }

  ngOnInit() {

    this.onInitframeHeight();

  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    // this.newInnerWidth = event.target.innerWidth;
    this.newInnerHeight = event.target.innerHeight;
    console.log('NEW INNER HEIGHT ', this.newInnerHeight);
    this.iframeHeight = this.newInnerHeight - this.navbarHeight;
    console.log('ON RESIZE -> IFRAME HEIGHT (ACTUAL HEIGHT - NAVBAR HEIGHT) ', this.iframeHeight);

    return { 'height': this.iframeHeight += 'px'};
  }

  onInitframeHeight(): any {
    this.actualHeight = window.innerHeight;
    console.log('ACTUAL HEIGHT ', this.actualHeight);
    // this.iframeHeight = this.actualHeight += 'px';
    this.iframeHeight = this.actualHeight - this.navbarHeight;
    console.log('ON INIT -> IFRAME HEIGHT (ACTUAL HEIGHT - NAVBAR HEIGHT) ', this.iframeHeight);

    return { 'height': this.iframeHeight += 'px'};
  }

}
