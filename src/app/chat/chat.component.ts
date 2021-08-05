import { Component, OnInit, HostListener } from '@angular/core';
import { environment } from '../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser'
import { AppConfigService } from '../services/app-config.service';
import { LoggerService } from '../services/logger/logger.service';
@Component({
  selector: 'chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})

export class ChatComponent implements OnInit {
  CHAT_BASE_URL: any;
  actualHeight: any;
  // navbarHeight = 51;
  // navbarAndFooterHeight = 130;
  navbarAndFooterHeight = 67;
  newInnerHeight: any;
  // newInnerWidth: any;
  iframeHeight: any;

  constructor(
    private sanitizer: DomSanitizer,
    public appConfigService: AppConfigService,
    private logger: LoggerService
  ) {
  

    // // User screen size
    // const screenHeight = window.screen.height;
    // const screenWidth = window.screen.width;

    // // Actual space available in navigator
    // const actualHeight = window.innerHeight;
    // const actualWidth = window.innerWidth;
  }

  ngOnInit() {

    this.getAndSanitizeChatUrl();
    this.onInitframeHeight();
    // const elemNavbar = <HTMLElement>document.querySelector('.navbar');
    //this.logger.log('NAVBAR QUERY SELECTOR IN CHAT ', elemNavbar)

  }

  getAndSanitizeChatUrl() {
    this.CHAT_BASE_URL = this.sanitizer.bypassSecurityTrustResourceUrl(this.appConfigService.getConfig().CHAT_BASE_URL);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    // this.newInnerWidth = event.target.innerWidth;
    this.newInnerHeight = event.target.innerHeight;
   this.logger.log('[CHAT-COMP] NEW INNER HEIGHT ', this.newInnerHeight);
    // this.iframeHeight = this.newInnerHeight - this.navbarHeight;
    this.iframeHeight = this.newInnerHeight - this.navbarAndFooterHeight;
   this.logger.log('[CHAT-COMP] ON RESIZE -> IFRAME HEIGHT (ACTUAL HEIGHT - NAVBAR HEIGHT) ', this.iframeHeight);

    return { 'height': this.iframeHeight += 'px' };
  }

  onInitframeHeight(): any {
    this.actualHeight = window.innerHeight;
   this.logger.log('[CHAT-COMP] ACTUAL HEIGHT ', this.actualHeight);
    // this.iframeHeight = this.actualHeight += 'px';
    // this.iframeHeight = this.actualHeight - this.navbarHeight;
    this.iframeHeight = this.actualHeight - this.navbarAndFooterHeight;
   this.logger.log('[CHAT-COMP] ON INIT -> IFRAME HEIGHT (ACTUAL HEIGHT - NAVBAR HEIGHT) ', this.iframeHeight);

    return { 'height': this.iframeHeight += 'px' };
  }

}
