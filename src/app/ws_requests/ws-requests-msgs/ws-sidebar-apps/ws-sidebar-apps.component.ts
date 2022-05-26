import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { LoggerService } from 'app/services/logger/logger.service';
import { slideInOutAnimationNoBckgrnd } from '../../../_animations/index';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AppStoreService } from 'app/services/app-store.service';
import { Subscription } from 'rxjs';
import { AuthService } from 'app/core/auth.service';
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
  projectId: string;
  // apps = [
  //   { 'src': "http://www.frontiere21.it/", iframeHeight: 200 }]
  apps: any;
  subscription: Subscription;
  constructor(
    private logger: LoggerService,
    private translate: TranslateService,
    public router: Router,
    public appStoreService: AppStoreService,
    public auth: AuthService
  ) { }

  ngOnInit() {
    this.getIfRouteUrlIsRequestForPanel();
    this.getCurrentProject();
    this.getApps()
  }

  ngOnDestroy() {
    this.logger.log('[ActivitiesComponent] % »»» WebSocketJs WF +++++ ws-requests--- activities ngOnDestroy')
    this.subscription.unsubscribe();
  }
  getCurrentProject() {
    this.subscription = this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.projectId = project._id
        this.logger.log('[ActivitiesComponent] - projectId ', this.projectId)
      }
    });
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


    getApps() {
      this.appStoreService.getApps().subscribe((_apps: any) => {
  
        this.apps = _apps.apps;
        console.log('[WS-SIDEBAR-APPS] - getApps APPS ', this.apps);
  
    
  
      }, (error) => {
        console.error('[WS-SIDEBAR-APPS] - getApps ERROR  ', error);
       
      }, () => {
        console.log('[WS-SIDEBAR-APPS] getApps * COMPLETE *');
        this.getInstallations().then((res: any) => {
  
          for (let installation of res) {
            console.log("[WS-SIDEBAR-APPS] getInstallations INSTALLATION: ", this.apps.findIndex(x => x['_id'] === installation.app_id ))
            let index = this.apps.findIndex(x => x['_id']=== installation.app_id);
            this.apps[index]['installed'] = true;
          }
        
        }).catch((err) => {
          console.error("[WS-SIDEBAR-APPS] getInstallations ERROR: ", err)
         
        })
  
        // this.showSpinner = false;
      });
    }

    getInstallations() {
      let promise = new Promise((resolve, reject) => {
        this.appStoreService.getInstallation(this.projectId).then((res) => {
          console.log("[WS-SIDEBAR-APPS] Get Installation Response: ", res);
          resolve(res);
        }).catch((err) => {
          console.error("[WS-SIDEBAR-APPS] Error getting installation: ", err);
          reject(err);
        })
      })
      return promise;
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
