import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { LoggerService } from 'app/services/logger/logger.service';
import { slideInOutAnimationNoBckgrnd } from '../../../_animations/index';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
@Component({
  selector: 'appdashboard-ws-sidebar-apps',
  templateUrl: './ws-sidebar-apps.component.html',
  styleUrls: ['./ws-sidebar-apps.component.scss'],
  animations: [slideInOutAnimationNoBckgrnd],
  // tslint:disable-next-line:use-host-property-decorator
  host: { '[@slideInOutAnimationNoBckgrnd]': '' }
})
export class WsSidebarAppsComponent implements OnInit {
  @Output() valueChange = new EventEmitter();
  isOpenRightSidebar: boolean = true;
  SIDEBAR_APPS_IN_CHAT_PANEL_MODE: boolean;
  apps = [
    { 'src': "http://www.frontiere21.it/", iframeHeight: 200 }]

  constructor(
    private logger: LoggerService,
    private translate: TranslateService,
    public router: Router,
  ) { }

  ngOnInit() {
    this.getIfRouteUrlIsRequestForPanel();
  }

    // --------------------------------------------------------------------------------------------------------------------------------
    getIfRouteUrlIsRequestForPanel() {
      this.SIDEBAR_APPS_IN_CHAT_PANEL_MODE = false
      if (this.router.url.indexOf('/request-for-panel') !== -1) {
        this.SIDEBAR_APPS_IN_CHAT_PANEL_MODE = true;
        console.log('[WS-SIDEBAR-APPS] - SIDEBAR_APPS_IN_CHAT_PANEL_MODE »»» ', this.SIDEBAR_APPS_IN_CHAT_PANEL_MODE);
  
        // const _elemMainPanel = <HTMLElement>document.querySelector('.main-panel')
        // _elemMainPanel.classList.add("main-panel-chat-panel-mode");
  
      } else {
        this.SIDEBAR_APPS_IN_CHAT_PANEL_MODE = false;
       console.log('[WS-SIDEBAR-APPS] - SIDEBAR_APPS_IN_CHAT_PANEL_MODE »»» ', this.SIDEBAR_APPS_IN_CHAT_PANEL_MODE);
        // const _elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
        // if (_elemMainPanel.classList.contains('main-panel-chat-panel-mode')) {
        //   _elemMainPanel.classList.remove("main-panel-chat-panel-mode");
        // }
  
      }
    }
  


  closeAppsRightSideBar() {
    this.logger.log('[WS-SIDEBAR-APPS] - closeRightSideBar this.valueChange ', this.valueChange)
    // this.valueChange.next()
    this.valueChange.emit(false);
    this.isOpenRightSidebar = false;


    [].forEach.call(
      document.querySelectorAll('footer ul li a'),
      function (el) {
        // this.logger.log('footer > ul > li > a element: ', el);
        el.setAttribute('style', 'text-transform: none');
      }
    );

  }

}
