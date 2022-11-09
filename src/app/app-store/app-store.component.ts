import { Component, OnInit } from '@angular/core';
import { AppStoreService } from '../services/app-store.service';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Subscription } from 'rxjs'
import { LoggerService } from '../services/logger/logger.service';
import { NotifyService } from 'app/core/notify.service';
import { TranslateService } from '@ngx-translate/core';

const swal = require('sweetalert');
@Component({
  selector: 'appdashboard-app-store',
  templateUrl: './app-store.component.html',
  styleUrls: ['./app-store.component.scss']
})
export class AppStoreComponent implements OnInit {

  apps: any;
  subscription: Subscription;
  projectId: string;
  showSpinner = true;
  TOKEN: string;
  isChromeVerGreaterThan100: boolean;
  userId: string;
  areYouSureMsg: string;
  appWillBeDeletedMsg: string;
  appHasBeenDeletedMsg: string;
  errorWhileDeletingApp: string;
  done_msg: string;
  constructor(
    public appStoreService: AppStoreService,
    private router: Router,
    public auth: AuthService,
    private logger: LoggerService,
    private notify: NotifyService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
    this.getApps();
    this.getCurrentProject();
    this.getToken()
    this.getBrowserVersion()
    this.translateLabels()
  }

  translateLabels() {
    this.translateAreYouSure();
    this.translateAppWillBeDeleted();
    this.translateAppHasBeenDeleted();
    this.translateAnErrorOccurreWhileDeletingTheApp();
    this.translateDone();
  }

  translateAreYouSure() {
    this.translate.get('AreYouSure').subscribe((text: string) => {
      this.areYouSureMsg = text;
    });
  }

  translateAppWillBeDeleted() {
    this.translate.get('TheAppWillBeDeleted').subscribe((text: string) => {
      this.appWillBeDeletedMsg = text;
    });
  }


  translateAppHasBeenDeleted() {
    this.translate.get('TheAppHasBeenDeleted').subscribe((text: string) => {
      this.appHasBeenDeletedMsg = text;
    });
  }
  translateAnErrorOccurreWhileDeletingTheApp() {
    this.translate.get('AnErrorOccurreWhileDeletingTheApp').subscribe((text: string) => {
      this.errorWhileDeletingApp = text;
    });
  }

  translateDone() {
    this.translate.get('Done').subscribe((text: string) => {
      this.done_msg = text;
    });
  }


  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //  console.log("[BOT-CREATE] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
  }

  getToken() {
    this.auth.user_bs.subscribe((user) => {
      if (user) {
        this.TOKEN = user.token
        this.userId = user._id
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getCurrentProject() {
    this.subscription = this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.projectId = project._id
        this.logger.log('APP-STORE - projectId ', this.projectId)
      }
    });
  }

  // ---------------------------
  // GET APPS
  // ---------------------------
  getApps() {
    this.appStoreService.getApps().subscribe((_apps: any) => {
      this.apps = _apps.apps;
      //  console.log('APP-STORE - getApps APPS ', this.apps);
      this.apps.forEach(app => {
        if (app.description.length > 118) {
          app.description = app.description.slice(0, 118) + '...'
        }
        // console.log('APP-STORE - getApps APPS app ', app )
        if (app && app.version === "v2")
          if (app.installActionURL === "") {
            // console.log('APP-STORE - getApps APPS app installActionURL', app.installActionURL)
            delete app.installActionURL
          }
      });


    }, (error) => {
      this.logger.error('[APP-STORE] - getApps ERROR  ', error);
      this.showSpinner = false;
    }, () => {
      this.logger.log('[APP-STORE] getApps * COMPLETE *');
      this.getInstallations().then((res: any) => {

        for (let installation of res) {
          // console.log("[APP-STORE] getInstallations INSTALLATION - res", res)
          // console.log("[APP-STORE] getInstallations INSTALLATION: ", this.apps.findIndex(x => x._id === installation.app_id))
          let index = this.apps.findIndex(x => x._id === installation.app_id);
          if (this.apps[index]) {
            this.apps[index].installed = true;
          }

        }
        this.showSpinner = false;
      }).catch((err) => {
        this.logger.error("[APP-STORE] getInstallations ERROR: ", err)
        this.showSpinner = false;
      })

      // this.showSpinner = false;
    });
  }

  installApp(app, installationType: string, installationUrl: string, appTitle: string, appId: string) {

    this.logger.log('[APP-STORE] app ', app)
    this.logger.log('[APP-STORE] app app version', app.version)
    this.logger.log('[APP-STORE] installationType ', installationType);
    this.logger.log('[APP-STORE] installationUrl ', installationUrl);

    if (app && app.version === 'v1') {

      const urlHasQueryString = this.detectQueryString(installationUrl)
      this.logger.log('[APP-STORE] installationUrl Has QueryString ', urlHasQueryString);


      let installationUrlWithQueryString = ''
      if (urlHasQueryString === false) {
        installationUrlWithQueryString = installationUrl + '?project_id=' + this.projectId + '&token=' + this.TOKEN
      } else {
        installationUrlWithQueryString = installationUrl + '&project_id=' + this.projectId + '&token=' + this.TOKEN
      }

      if (installationType === 'internal') {
        this.logger.log("[APP-STORE] Navigation to: " + 'project/' + this.projectId + '/app-store-install', installationUrlWithQueryString, appTitle)
        //this.router.navigate(['project/' + this.projectId + '/app-store-install', installationUrlWithQueryString, appTitle]);
        this.router.navigate(['project/' + this.projectId + '/app-store-install/' + appId + '/installation'])
      } else {
        const url = installationUrlWithQueryString;
        window.open(url, '_blank');
      }
    } else if (app && app.version === 'v2') {
      this.installV2App(this.projectId, appId)
    }
  }

  openInAppStoreInstall(app) {
    this.logger.log('openInAppStoreInstall app ', app)
    this.router.navigate(['project/' + this.projectId + '/app-store-install/' + app._id + '/run'])
  }

  openConfigureUrlInAppStoreInstall(app) {
    this.router.navigate(['project/' + this.projectId + '/app-store-install/' + app._id + '/configure'])
  }

  installV2App(projectId, appId) {

    this.appStoreService.installAppVersionTwo(projectId, appId).subscribe((res: any) => {
      this.logger.log('[APP-STORE] INSTALL V2 APP ', projectId, appId)

    }, (error) => {
      this.logger.error('[APP-STORE] INSTALL V2 APP - ERROR  ', error);
      this.notify.showWidgetStyleUpdateNotification("An error occurred while creating the app", 4, 'report_problem');
    }, () => {
      this.logger.log('[APP-STORE] INSTALL V2 APP - COMPLETE');
      this.notify.showWidgetStyleUpdateNotification("App installed successfully", 2, 'done');
      let index = this.apps.findIndex(x => x._id === appId);
      // this.apps[index].installed = false;
      // this.apps[index].version = 'v2';
      setTimeout(() => {
        this.apps[index].installed = true;
      }, 1000);

    });
  }

  unistallApp(appId) {
    this.logger.log('[APP-STORE] UNINSTALL V2 APP - app_id', appId);

    this.appStoreService.unistallNewApp(this.projectId, appId).subscribe((res: any) => {
      this.logger.log('[APP-STORE] UNINSTALL V2 APP - app_id - RES', res);

    }, (error) => {
      this.logger.error('[APP-STORE] UNINSTALL V2 APP - ERROR  ', error);
      this.notify.showWidgetStyleUpdateNotification("An error occurred while uninstalling the app", 4, 'report_problem');
    }, () => {
      this.logger.log('[APP-STORE] UNINSTALL V2 APP - COMPLETE');
      this.notify.showWidgetStyleUpdateNotification("App uninstalled successfully", 2, 'done');
      let index = this.apps.findIndex(x => x._id === appId);
      // this.apps[index].installed = false;
      // this.apps[index].version = 'v2';
      setTimeout(() => {
        this.apps[index].installed = false;
      }, 1000);

    });
  }


  deleteNewApp(appId) {
    swal({
      title: this.areYouSureMsg,
      text: this.appWillBeDeletedMsg,
      icon: "warning",
      buttons: ["Cancel", "Delete"],
      dangerMode: true,
    })
      .then((WillDelete) => {
        if (WillDelete) {
          this.appStoreService.deleteNewApp(appId).subscribe((res: any) => {
            //  console.log('[APP-STORE] DELETE V2 APP - app_id - RES', res);
          }, (error) => {
            swal(this.errorWhileDeletingApp, {
              icon: "error",
            });
            this.logger.error('[FAQ-EDIT-ADD] DELETE FAQ ERROR ', error);
          }, () => {
            this.logger.log('[FAQ-EDIT-ADD] DELETE FAQ * COMPLETE *');

            for (var i = 0; i < this.apps.length; i++) {

              if (this.apps[i]._id === appId) {
                this.apps.splice(i, 1);
                i--;
              }
            }

            swal(this.done_msg + "!", this.appHasBeenDeletedMsg, {
              icon: "success",
            }).then((okpressed) => {

            });
          });
        } else {
          this.logger.log('[FAQ-EDIT-ADD] WS-REQUESTS-LIST swal WillDelete (else)')
        }
      });
  }

  _deleteNewApp(appId) {
    this.appStoreService.deleteNewApp(appId).subscribe((res: any) => {
      this.logger.log('[APP-STORE] DELETE V2 APP - app_id - RES', res);

    }, (error) => {
      this.logger.error('[APP-STORE] DELETE V2 APP - ERROR  ', error);
      this.notify.showWidgetStyleUpdateNotification("An error occurred while deleting the app", 4, 'report_problem');
    }, () => {
      this.logger.log('[APP-STORE] DELETE V2 APP - COMPLETE');
      this.notify.showWidgetStyleUpdateNotification("App successfully deleted", 2, 'done');
      // let index = this.apps.findIndex(x => x._id === appId);
      // // this.apps[index].installed = false;
      // // this.apps[index].version = 'v2';
      for (var i = 0; i < this.apps.length; i++) {

        if (this.apps[i]._id === appId) {
          this.apps.splice(i, 1);
          i--;
        }
      }

    });
  }

  learnmore(learnmoreUrl: string, app_id) {
    // console.log('[APP-STORE] learnmoreUrl ', learnmoreUrl);
    if (learnmoreUrl.startsWith('{')) {
      // console.log('[APP-STORE] installationUrl start with curly bracket ');
      const learnmoreUrlString = learnmoreUrl.replace(/&quot;/ig, '"');
      const learnMoreObjct = JSON.parse(learnmoreUrlString)
      // console.log('[APP-STORE] learnmoreUrl start with curly bracket - learnMoreObjct, ', learnMoreObjct);
      // URL = learnMoreObjct.url
      const target = learnMoreObjct.target;
    
      if (target === '_self') {
        this.openAppDetails(URL, app_id)
      }
    } else if (learnmoreUrl.startsWith('http')) {
      // console.log('[APP-STORE] learnmoreUrl NOT start with curly bracket ');
      const URL = learnmoreUrl
      window.open(URL, '_blank')
    }
    //   // const url = learnmoreUrl;
  }
  openAppDetails(URL, app_id) {
    // console.log('HERE Y')
    this.router.navigate(['project/' + this.projectId + '/app-store-install/' + app_id + '/detail'])
  }

  detectQueryString(url) {
    // regex pattern for detecting querystring
    var pattern = new RegExp(/\?.+=.*/g);
    // this.logger.log('[APP-STORE] PATTERN TEST URL ')
    return pattern.test(url);
  }

  getInstallations() {
    let promise = new Promise((resolve, reject) => {
      this.appStoreService.getInstallation(this.projectId).then((res) => {
        //  console.log("[APP-STORE] Get Installation Response: ", res);
        resolve(res);
      }).catch((err) => {
        // console.error("[APP-STORE] Error getting installation: ", err);
        reject(err);
      })
    })
    return promise;
  }
  //  project/:projectid/app-create 
  goToCreateApp() {
    this.router.navigate(['project/' + this.projectId + '/app-create'])
  }

  goToEditApp(appid) {
    this.router.navigate(['project/' + this.projectId + '/app-edit/' + appid])
  }





}
