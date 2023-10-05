import { AuthService } from './../../core/auth.service';
import { Component, OnInit, HostListener, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser'
import { Location } from '@angular/common';
import { AppStoreService } from 'app/services/app-store.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { LoggerService } from '../../services/logger/logger.service';


@Component({
  selector: 'appdashboard-app-store-install',
  templateUrl: './app-store-install.component.html',
  styleUrls: ['./app-store-install.component.scss']
})
export class AppStoreInstallComponent implements OnInit {

  subscription: Subscription;
  URL: any;
  iframeHeight: any;
  actualHeight: any;
  navbarAndFooterHeight = 67;
  newInnerHeight: any;
  app_title: string;
  result: any;
  TOKEN: string;
  showSpinner: boolean;
  project: any;
  projectId: string;
  isChromeVerGreaterThan100: boolean;
  reason: string;
  appurl: string;
  calledBy: string;

  constructor(
    public route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    public location: Location,
    private appStoreService: AppStoreService,
    private auth: AuthService,
    private ngZone: NgZone,
    private router: Router,
    private logger: LoggerService
  ) {
    // console.log('Here app-store-install!!!')
    this.getRouteParams();

  }

  ngOnInit() {
    this.getCurrentProject();
    this.onInitframeHeight();
    this.getBrowserVersion()
  }


  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //  console.log("[BOT-CREATE] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
  }

  ngOnDestroy() {
    // if ( this.subscription) {
    // this.subscription.unsubscribe();
    // }
  }

  getCurrentProject() {
    this.subscription = this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.project = project

      }
    });
  }


  getRouteParams() {
    // console.log("[APP-STORE-INSTALL] app url: NK", this.appurl);
    this.showSpinner = true;
    this.route.params.subscribe((params) => {
      this.projectId = params.projectid
      this.logger.log('[APP-STORE-INSTALL] - GET ROUTE PARAMS ', params);
      if (params.calledby && params.calledby === 'h') {
        this.calledBy = 'home'
      }

      this.appStoreService.getAppDetail(params.appid).subscribe((res) => {
        this.logger.log("[APP-STORE-INSTALL] - GET APP DETAIL RESULT: ", res);
        if (res) {
          this.result = res;
          this.app_title = this.result.title

          if (this.result.version === 'v1') {
            this.appurl = this.result.installActionURL
            this.reason = 'Manage'
            // console.log("[APP-STORE-INSTALL] USE CASE MANAGE - appurl ", this.appurl);
          } else if (this.result.version === 'v2' && params.reason === 'run') {
            this.appurl = this.result.runURL
            this.reason = 'Run'
            // console.log("[APP-STORE-INSTALL] USE CASE RUN - appurl ", this.appurl);
          } else if (this.result.version === 'v2' && params.reason === 'configure') {

            this.appurl = this.result.installActionURL
            // console.log("[APP-STORE-INSTALL] USE CASE CONFIGURE - appurl ", this.appurl);
            this.reason = 'Configure'
          } else if ((this.result.version === 'v2' || this.result.version === 'v1') && params.reason === 'detail') {
            // console.log("[APP-STORE-INSTALL] HERE FOR DETAILS  ");
            if (this.result.learnMore) {
              const learnMoreParsed = JSON.parse(this.result.learnMore)
              // console.log("[APP-STORE-INSTALL] HERE FOR DETAILS learnMoreParsed ", learnMoreParsed);
              this.appurl = learnMoreParsed.url;
              // console.log("[APP-STORE-INSTALL] HERE FOR DETAILS PARSED LEARN URL ", this.appurl);

              this.reason = 'Detail'
            }
          }
          this.auth.user_bs.subscribe((user) => {
            if (user && this.appurl !== undefined) {
              this.TOKEN = user.token

              // use case 1 -> https://cms.tiledesk.com/
              // use case 2 -> https://cms.tiledesk.com/?version=v3

              let qsCharacterSeparator = ""
              const appurlHasQueryParams = this.hasQueryParams(this.appurl)
              // console.log('APP URL this.appurl', this.appurl)
              // console.log('APP URL appurlHasQueryParams', appurlHasQueryParams)
              if (appurlHasQueryParams === false) {
                qsCharacterSeparator = '?'
              } else {
                qsCharacterSeparator = '&'
              }
              // this.URL = this.sanitizer.bypassSecurityTrustResourceUrl(parsed_json.installActionURL + '?project_id=' + params.projectid + '&app_id=' + params.appid + '&token=' + this.TOKEN);
              this.URL = this.sanitizer.bypassSecurityTrustResourceUrl(this.appurl + qsCharacterSeparator + 'project_id=' + params.projectid + '&app_id=' + params.appid + '&token=' + this.TOKEN);
              // console.log("[APP-STORE-INSTALL] - URL IFRAME: ", this.URL)
              if (this.URL) {
                setTimeout(() => {
                  this.getIframeHasLoaded(this.result)
                }, 0);

              }

            } else {
              this.logger.log("[APP-STORE-INSTALL] - GET USER TOKEN: FAILED");
              this.showSpinner = false;
            }
          });
        } else {
          this.logger.error('Error getting app details')
        }
      })
    })
  }

  hasQueryParams(url) {
    return url.includes('?');
  }

  getIframeHasLoaded(app) {
    // console.log("[APP-STORE-INSTALL] -  getIframeHasLoaded ")
    var self = this;
    var iframe = document.getElementById('i_frame') as HTMLIFrameElement;;
    this.logger.log('[APP-STORE-INSTALL] GET iframe ', iframe)
    if (iframe) {
      iframe.addEventListener("load", function () {
        self.logger.log("[APP-STORE-INSTALL] GET - Finish");
        let spinnerElem = <HTMLElement>document.querySelector('.stretchspinner_in_app_install')
        // let spinnerElem = document.getElementsByClassName("stretchspinner_in_app_install")  as HTMLCollectionOf<HTMLElement>;
        // self.logger.log('[APP-STORE-INSTALL] GET iframeDoc readyState spinnerElem', spinnerElem)
        // console.log('[APP-STORE-INSTALL] GET iframeDoc readyState spinnerElem', spinnerElem)
        spinnerElem.classList.add("hide-stretchspinner")

        // console.log("[APP-STORE-INSTALL]  - app", app)
        if (app.version === 'v2' && app.where.appsstore === true) {
          const isIFrame = (input: HTMLElement | null): input is HTMLIFrameElement =>
            input !== null && input.tagName === 'IFRAME';

          if (isIFrame(iframe) && iframe.contentWindow) {
            const msg = { appname: app.title, request: self.project, token: self.TOKEN }
            iframe.contentWindow.postMessage(msg, '*');
          }
        }
      });
    }
  }


  // _getIframeHaLoaded() {
  //   var self = this;
  //   var iframe = document.getElementById('i_frame') as HTMLIFrameElement;;
  //   this.logger.log('APP-STORE-INSTALL GET iframe ', iframe)
  //   var iframeDoc = iframe.contentDocument;
  //   this.logger.log('APP-STORE-INSTALL GET iframeDoc ', iframeDoc)

  //   // Check if loading is complete
  //   if (iframeDoc.readyState == 'complete') {
  //     this.logger.log('APP-STORE-INSTALL GET iframeDoc readyState', iframeDoc.readyState)
  //     this.logger.log('APP-STORE-INSTALL GET iframeDoc readyState  iframeDoc', iframeDoc)
  //     // this.ngZone.run( () => {
  //     self.showSpinner = false;
  //     let spinnerElem = <HTMLElement>document.querySelector('.stretchspinner_in_app_install')
  //     // let spinnerElem = document.getElementsByClassName("stretchspinner_in_app_install")  as HTMLCollectionOf<HTMLElement>;
  //     this.logger.log('APP-STORE-INSTALL GET iframeDoc readyState spinnerElem', spinnerElem)
  //     spinnerElem.classList.add("hide-stretchspinner")
  //     // });
  //     this.logger.log('APP-STORE-INSTALL GET iframeDoc readyState   this.showSpinner', self.showSpinner)
  //   } else {
  //     // If we are here, it is not loaded. Set things up so we check   the status again in 100 milliseconds
  //     window.setTimeout(this._getIframeHaLoaded, 100)
  //   }
  // }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    // this.newInnerWidth = event.target.innerWidth;
    this.newInnerHeight = event.target.innerHeight;
    this.logger.log('[APP-STORE-INSTALL] NEW INNER HEIGHT ', this.newInnerHeight);
    // this.iframeHeight = this.newInnerHeight - this.navbarHeight;
    this.iframeHeight = this.newInnerHeight - this.navbarAndFooterHeight;
    this.logger.log('[APP-STORE-INSTALL] ON RESIZE -> IFRAME HEIGHT (ACTUAL HEIGHT - NAVBAR HEIGHT) ', this.iframeHeight);

    return { 'height': this.iframeHeight += 'px' };
  }

  onInitframeHeight(): any {
    this.actualHeight = window.innerHeight;
    this.logger.log('[APP-STORE-INSTALL] ACTUAL HEIGHT ', this.actualHeight);
    // this.iframeHeight = this.actualHeight += 'px';
    // this.iframeHeight = this.actualHeight - this.navbarHeight;
    this.iframeHeight = this.actualHeight - this.navbarAndFooterHeight;
    this.logger.log('[APP-STORE-INSTALL] ON INIT -> IFRAME HEIGHT (ACTUAL HEIGHT - NAVBAR HEIGHT) ', this.iframeHeight);

    return { 'height': this.iframeHeight += 'px' };
  }

  goBack() {
    // console.log("[APP-STORE-INSTALL] - goBack to app store calledBy ", this.calledBy);
    // this.location.back();
    if (this.calledBy === 'home') {
      this.router.navigate(['project/' + this.projectId + '/home'])
    } else {
      this.router.navigate(['project/' + this.projectId + '/app-store'])
    }
  }


}
