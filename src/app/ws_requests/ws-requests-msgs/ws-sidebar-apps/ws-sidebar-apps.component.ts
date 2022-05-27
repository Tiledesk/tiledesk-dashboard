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
    // this.getApps()
    this.getInstallations()
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
        this.appStoreService.getInstallation(this.projectId).then((installations: any) => {
          console.log("[WS-SIDEBAR-APPS] Get Installation Response: ", installations);
          installations.forEach(installation => {
            this.getAppByAppId(installation.app_id)
          });
          
          resolve(installations);
        }).catch((err) => {
          console.error("[WS-SIDEBAR-APPS] Error getting installation: ", err);
          reject(err);
        })
      })
      return promise;
    }
    getAppByAppId(appid) {

      this.appStoreService.getAppDetail(appid).subscribe((res) => {
        console.log("[APP-STORE-INSTALL] - GET APP DETAIL RESULT: ", res);
        // this.result = res;
        // //this.logger.log(this.result._body);
        // let parsed_json = JSON.parse(this.result._body);
        // this.logger.log("[APP-STORE-INSTALL] PARSED JSON: ", parsed_json);

        // this.auth.user_bs.subscribe((user) => {
        //   if (user) {
        //     this.TOKEN = user.token
        //     // this.URL = this.sanitizer.bypassSecurityTrustResourceUrl(parsed_json.installActionURL + '?project_id=' + params.projectid + '&token=' + this.TOKEN);
        //     this.URL = this.sanitizer.bypassSecurityTrustResourceUrl(parsed_json.installActionURL + '?project_id=' + params.projectid + '&app_id=' + params.appid + '&token=' + this.TOKEN);
        //     this.logger.log("[APP-STORE-INSTALL] - URL IFRAME: ", this.URL)
        //     this.getIframeHasLoaded()

        //   } else {
        //     this.logger.log("[APP-STORE-INSTALL] - GET USER TOKEN: FAILED");
        //     this.showSpinner = false;
        //   }
        // });

      })

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
