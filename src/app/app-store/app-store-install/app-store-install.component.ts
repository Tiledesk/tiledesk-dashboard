import { AuthService } from './../../core/auth.service';
import { Component, OnInit, HostListener, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser'
import { Location } from '@angular/common';
import { AppStoreService } from 'app/services/app-store.service';
import { Subscription } from 'rxjs/Subscription';
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
  projectId: string;

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

    this.getRouteParams();

  }

  ngOnInit() {
    // this.getCurrentProject();
    this.onInitframeHeight();

  }

  ngOnDestroy() {
    // if ( this.subscription) {
    // this.subscription.unsubscribe();
    // }
  }

  // getCurrentProject() {
  //   this.subscription = this.auth.project_bs.subscribe((project) => {
  //     if (project) {
  //       this.projectId = project._id
  //       this.logger.log('APP-STORE - projectId ', this.projectId)
  //     }
  //   });
  // }


  getRouteParams() {
    this.showSpinner = true;
    this.route.params.subscribe((params) => {
      this.projectId = params.projectid
      this.logger.log('[APP-STORE-INSTALL] - GET ROUTE PARAMS ', params);

      this.appStoreService.getAppDetail(params.appid).subscribe((res) => {
        this.logger.log("[APP-STORE-INSTALL] - GET APP DETAIL RESULT: ", res);
        this.result = res;
        //this.logger.log(this.result._body);
        let parsed_json = JSON.parse(this.result._body);
        this.logger.log("[APP-STORE-INSTALL] PARSED JSON: ", parsed_json);

        this.auth.user_bs.subscribe((user) => {
          if (user) {
            this.TOKEN = user.token
            // this.URL = this.sanitizer.bypassSecurityTrustResourceUrl(parsed_json.installActionURL + '?project_id=' + params.projectid + '&token=' + this.TOKEN);
            this.URL = this.sanitizer.bypassSecurityTrustResourceUrl(parsed_json.installActionURL + '?project_id=' + params.projectid + '&app_id=' + params.appid + '&token=' + this.TOKEN);
            this.logger.log("[APP-STORE-INSTALL] - URL IFRAME: ", this.URL)
            this.getIframeHasLoaded()

          } else {
            this.logger.log("[APP-STORE-INSTALL] - GET USER TOKEN: FAILED");
            this.showSpinner = false;
          }
        });

      })

      //this.app_title = params.apptitle;
      //this.logger.log('APP-STORE-INSTALL - APP TITLE ',   this.app_title);

      //this.URL = this.sanitizer.bypassSecurityTrustResourceUrl(params.url);
      //this.logger.log("URL IFRAME: ", this.URL)
    })
  }

  getIframeHasLoaded() {
    var self = this;
    var iframe = document.getElementById('i_frame') as HTMLIFrameElement;;
    this.logger.log('[APP-STORE-INSTALL] GET iframe ', iframe)
    if (iframe) {
      iframe.addEventListener("load", function () {
        self.logger.log("[APP-STORE-INSTALL] GET - Finish");
        let spinnerElem = <HTMLElement>document.querySelector('.stretchspinner_in_app_install')
        // let spinnerElem = document.getElementsByClassName("stretchspinner_in_app_install")  as HTMLCollectionOf<HTMLElement>;
        self.logger.log('[APP-STORE-INSTALL] GET iframeDoc readyState spinnerElem', spinnerElem)
        spinnerElem.classList.add("hide-stretchspinner")

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
    this.logger.log("[APP-STORE-INSTALL] - goBack to app store");
    // this.location.back();
    this.router.navigate(['project/' + this.projectId + '/app-store/'])
  }


}
