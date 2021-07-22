import { Component, OnInit } from '@angular/core';
import { AppStoreService } from '../services/app-store.service';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Subscription } from 'rxjs/Subscription';
import { LoggerService } from '../services/logger/logger.service';

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

  constructor(
    public appStoreService: AppStoreService,
    private router: Router,
    public auth: AuthService,
    private logger: LoggerService
  ) { }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
    this.getApps();
    this.getCurrentProject();
    this.getToken()
  }

  getToken() {
    this.auth.user_bs.subscribe((user) => {
      if (user) {
        this.TOKEN = user.token
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
      this.logger.log('APP-STORE - getApps APPS ', this.apps);

      this.apps.forEach(app => {

        if (app.description.length > 118) {

          app.description = app.description.slice(0, 118) + '...'
        }

        // getRequestText(text: string): string {
        //   if (text) {
        //     return text.length >= 95 ?
        //       text.slice(0, 95) + '...' :
        //       text;
        //   }
        // }

      });


    }, (error) => {
      this.logger.error('[APP-STORE] - getApps ERROR  ', error);
      this.showSpinner = false;
    }, () => {
      this.logger.log('[APP-STORE] getApps * COMPLETE *');
      this.getInstallations().then((res: any) => {

        for (let installation of res) {
          this.logger.log("[APP-STORE] getInstallations INSTALLATION: ", this.apps.findIndex(x => x._id === installation.app_id ))
          let index = this.apps.findIndex(x => x._id === installation.app_id);
          this.apps[index].installed = true;
        }
        this.showSpinner = false;
      }).catch((err) => {
        this.logger.error("[APP-STORE] getInstallations ERROR: ", err)
        this.showSpinner = false;
      })

      // this.showSpinner = false;
    });
  }

  installApp(installationType: string, installationUrl: string, appTitle: string, appId: string) {
    this.logger.log('[APP-STORE] installationType ', installationType);
    this.logger.log('[APP-STORE] installationUrl ', installationUrl);

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
      this.router.navigate(['project/' + this.projectId + '/app-store-install/' + appId])
    } else {
      const url = installationUrlWithQueryString;
      window.open(url, '_blank');
    }
  }

  learnmore(learnmoreUrl: string) {
    this.logger.log('[APP-STORE] installationUrl ', learnmoreUrl);
    const url = learnmoreUrl;

    window.open(url, '_blank');
  }

  detectQueryString(url) {
    // regex pattern for detecting querystring
    var pattern = new RegExp(/\?.+=.*/g);
    // this.logger.log('[APP-STORE] PATTERN TEST USL ')
    return pattern.test(url);
  }

  getInstallations() {
    let promise = new Promise((resolve, reject) => {
      this.appStoreService.getInstallation(this.projectId).then((res) => {
        this.logger.log("[APP-STORE] Get Installation Response: ", res);
        resolve(res);
      }).catch((err) => {
        this.logger.error("[APP-STORE] Error getting installation: ", err);
        reject(err);
      })
    })
    return promise;
  }




}
