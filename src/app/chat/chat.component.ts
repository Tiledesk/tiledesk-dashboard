import { Component, OnInit, HostListener } from '@angular/core';
import { environment } from '../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser'

@Component({
  selector: 'chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})

export class ChatComponent implements OnInit {
  CHAT_BASE_URL: any;
  actualHeight: any;
  // navbarHeight = 51;
  navbarAndFooterHeight = 130;

  newInnerHeight: any;
  // newInnerWidth: any;
  iframeHeight: any;

  constructor(
    private sanitizer: DomSanitizer
  ) {
    this.CHAT_BASE_URL = sanitizer.bypassSecurityTrustResourceUrl(environment.chat.CHAT_BASE_URL);
    // // User screen size
    // const screenHeight = window.screen.height;
    // const screenWidth = window.screen.width;

    // // Actual space available in navigator
    // const actualHeight = window.innerHeight;
    // const actualWidth = window.innerWidth;
  }

  ngOnInit() {

    this.onInitframeHeight();
    // const elemNavbar = <HTMLElement>document.querySelector('.navbar');
    // console.log('NAVBAR QUERY SELECTOR IN CHAT ', elemNavbar)

  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    // this.newInnerWidth = event.target.innerWidth;
    this.newInnerHeight = event.target.innerHeight;
    console.log('NEW INNER HEIGHT ', this.newInnerHeight);
    // this.iframeHeight = this.newInnerHeight - this.navbarHeight;
    this.iframeHeight = this.newInnerHeight - this.navbarAndFooterHeight;
    console.log('ON RESIZE -> IFRAME HEIGHT (ACTUAL HEIGHT - NAVBAR HEIGHT) ', this.iframeHeight);

    return { 'height': this.iframeHeight += 'px' };
  }

  onInitframeHeight(): any {
    this.actualHeight = window.innerHeight;
    console.log('ACTUAL HEIGHT ', this.actualHeight);
    // this.iframeHeight = this.actualHeight += 'px';
    // this.iframeHeight = this.actualHeight - this.navbarHeight;
    this.iframeHeight = this.actualHeight - this.navbarAndFooterHeight;
    console.log('ON INIT -> IFRAME HEIGHT (ACTUAL HEIGHT - NAVBAR HEIGHT) ', this.iframeHeight);

    return { 'height': this.iframeHeight += 'px' };
  }

}
