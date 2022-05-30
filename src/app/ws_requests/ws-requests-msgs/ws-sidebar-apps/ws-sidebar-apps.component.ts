import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
  @Input() request: string;
  // for TEST
  // apps = [ { 'src': "https://fakecrm.nicolan74.repl.co", iframeHeight: 200 }]
  apps: any;
  dashboardApps: any;
  webchatApps: any
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
    this.getInstallationsPopulateWithApp()
  }

  ngOnDestroy() {
    this.logger.log('[WS-SIDEBAR-APPS] ngOnDestroy')
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

  ngOnChanges() {
    this.logger.log('[WS-SIDEBAR-APPS] request', this.request)
    // for TEST
    // this.apps.forEach(app => {
    //   app['iframeUrl'] = app.src + '?email='+ this.request['lead']['email']
    //   console.log('[WS-SIDEBAR-APPS] apps', this.apps)
    // });

  }


  // --------------------------------------------------------------------------------------------------------------------------------
  getIfRouteUrlIsRequestForPanel() {
    this.SIDEBAR_APPS_IN_CHAT_PANEL_MODE = false
    if (this.router.url.indexOf('/request-for-panel') !== -1) {
      this.SIDEBAR_APPS_IN_CHAT_PANEL_MODE = true;
      this.logger.log('[WS-SIDEBAR-APPS] - SIDEBAR_APPS_IN_CHAT_PANEL_MODE »»» ', this.SIDEBAR_APPS_IN_CHAT_PANEL_MODE);

      // const _elemMainPanel = <HTMLElement>document.querySelector('.main-panel')
      // _elemMainPanel.classList.add("main-panel-chat-panel-mode");

    } else {
      this.SIDEBAR_APPS_IN_CHAT_PANEL_MODE = false;
      this.logger.log('[WS-SIDEBAR-APPS] - SIDEBAR_APPS_IN_CHAT_PANEL_MODE »»» ', this.SIDEBAR_APPS_IN_CHAT_PANEL_MODE);
      // const _elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
      // if (_elemMainPanel.classList.contains('main-panel-chat-panel-mode')) {
      //   _elemMainPanel.classList.remove("main-panel-chat-panel-mode");
      // }

    }
  }




  getInstallationsPopulateWithApp() {
    let promise = new Promise((resolve, reject) => {
      this.appStoreService.getInstallationWithApp(this.projectId).then((installations: any) => {
        // console.log("[WS-SIDEBAR-APPS] Get Installation Response: ", installations);
        this.apps = []
        this.dashboardApps = []
        this.webchatApps= []

        installations.forEach(installation => {
          //  console.log('getInstallationsPopulateWithApp installation ', installation)
          if (installation.app !== null) {
            // console.log('getInstallationsPopulateWithApp installation.app ', installation.app)


            // this.apps.push(installation.app)

            // this.dashboardApps 
            this.logger.log('getInstallationsPopulateWithApp installation.app  where', installation.app.where)
            if (installation.app.where.dashboard === true) {
              this.dashboardApps.push(installation.app)
            }

            if (installation.app.where.webchat === true) {
              this.webchatApps.push(installation.app)
            }

          }
        });

        this.logger.log("[WS-SIDEBAR-APPS] DASHBOARD APPS ARRAY: ", this.dashboardApps);
        this.logger.log("[WS-SIDEBAR-APPS] WEBCHAT APPS ARRAY: ", this.webchatApps);

        if (this.dashboardApps.length > 0) {
          this.dashboardApps.forEach(app => {
            app['iframeUrl'] = app.runURL + '?request_id=' + this.request['request_id'] + '&project_id=' + this.projectId
            this.logger.log('[WS-SIDEBAR-APPS] apps', this.apps)
          });
        }

        if (this.webchatApps.length > 0) {
          this.webchatApps.forEach(app => {
            app['iframeUrl'] = app.runURL + '?request_id=' + this.request['request_id'] + '&project_id=' + this.projectId
            this.logger.log('[WS-SIDEBAR-APPS] apps', this.apps)
          });
        }

        // dashboardApps

        resolve(installations);
      }).catch((err) => {
        this.logger.error("[WS-SIDEBAR-APPS] Error getting installation: ", err);
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
