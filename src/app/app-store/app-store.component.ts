import { Component, OnInit } from '@angular/core';
import { AppStoreService } from '../services/app-store.service';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Subscription } from 'rxjs/Subscription';

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
    public auth: AuthService
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
        console.log('APP-STORE - projectId ', this.projectId)
      }
    });
  }

  // ---------------------------
  // GET APPS
  // ---------------------------
  getApps() {
    this.appStoreService.getApps().subscribe((_apps: any) => {

      this.apps = _apps.apps;
      console.log('APP-STORE - APPS ', this.apps);

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
      console.log('APP-STORE - ERROR  ', error);
      this.showSpinner = false;
    }, () => {
      console.log('APP-STORE * COMPLETE *');
      this.showSpinner = false;
    });
  }

  installApp(installationType: string, installationUrl: string, appTitle: string, appId: string) {
    console.log('APP-STORE installationType ', installationType);

    console.log('APP-STORE installationUrl ', installationUrl);

    const urlHasQueryString = this.detectQueryString(installationUrl)
    console.log('APP-STORE installationUrl Has QueryString ', urlHasQueryString);


    let installationUrlWithQueryString = ''
    if (urlHasQueryString === false) {
      installationUrlWithQueryString = installationUrl + '?project_id=' + this.projectId + '&token=' + this.TOKEN
    } else {
      installationUrlWithQueryString = installationUrl + '&project_id=' + this.projectId + '&token=' + this.TOKEN
    }

    if (installationType === 'internal') {
      console.log("Navigation to: " + 'project/' + this.projectId + '/app-store-install', installationUrlWithQueryString, appTitle)
      //this.router.navigate(['project/' + this.projectId + '/app-store-install', installationUrlWithQueryString, appTitle]);
      this.router.navigate(['project/' + this.projectId + '/app-store-install/' + appId])
    } else {
      const url = installationUrlWithQueryString;
      window.open(url, '_blank');
    }
  }

  learnmore(learnmoreUrl: string) {
    console.log('APP-STORE installationUrl ', learnmoreUrl);
    const url = learnmoreUrl;

    window.open(url, '_blank');
  }

  detectQueryString(url) {
    // regex pattern for detecting querystring
    var pattern = new RegExp(/\?.+=.*/g);
    console.log('APP-STORE PATTERN TEST USRL ')
    return pattern.test(url);
  }

}
