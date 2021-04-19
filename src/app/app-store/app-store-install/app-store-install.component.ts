import { AuthService } from './../../core/auth.service';
import { Component, OnInit, HostListener, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser'
import { Location } from '@angular/common';
import { AppStoreService } from 'app/services/app-store.service';

@Component({
  selector: 'appdashboard-app-store-install',
  templateUrl: './app-store-install.component.html',
  styleUrls: ['./app-store-install.component.scss']
})
export class AppStoreInstallComponent implements OnInit {

  URL: any;
  iframeHeight: any;
  actualHeight: any;
  navbarAndFooterHeight = 67;
  newInnerHeight: any;
  app_title: string;
  result: any;
  TOKEN: string;
  showSpinner: boolean;


  constructor(
    public route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    public location: Location,
    private appStoreService: AppStoreService,
    private auth: AuthService,
    private ngZone: NgZone
  ) {

    this.getRouteParams();

  }

  ngOnInit() {

    this.onInitframeHeight();

  }





  getRouteParams() {
    this.showSpinner = true;
    this.route.params.subscribe((params) => {

      console.log('APP-STORE-INSTALL - GET ROUTE PARAMS ', params);

      this.appStoreService.getAppDetail(params.appid).subscribe((res) => {
        console.log("APP-STORE-INSTALL - GET APP DETAIL RESULT: ", res);
        this.result = res;
        //console.log(this.result._body);
        let parsed_json = JSON.parse(this.result._body);
        console.log("APP-STORE-INSTALL PARSED JSON: ", parsed_json);

        this.auth.user_bs.subscribe((user) => {
          if (user) {
            this.TOKEN = user.token
            this.URL = this.sanitizer.bypassSecurityTrustResourceUrl(parsed_json.installActionURL + '?project_id=' + params.projectid + '&token=' + this.TOKEN);
            console.log("APP-STORE-INSTALL - URL IFRAME: ", this.URL)
            this.getIframeHaLoaded()

          } else {
            console.log("APP-STORE-INSTALL - GET USER TOKEN: FAILED");
            this.showSpinner = false;
          }
        });

      })

      //this.app_title = params.apptitle;
      //console.log('APP-STORE-INSTALL - APP TITLE ',   this.app_title);

      //this.URL = this.sanitizer.bypassSecurityTrustResourceUrl(params.url);
      //console.log("URL IFRAME: ", this.URL)
    })
  }

  getIframeHaLoaded() {
    var self = this;
    var iframe = document.getElementById('i_frame') as HTMLIFrameElement;;
    console.log('APP-STORE-INSTALL GET iframe ', iframe)
    iframe.addEventListener("load", function () {
      console.log("APP-STORE-INSTALL GET - Finish");
      let spinnerElem = <HTMLElement>document.querySelector('.stretchspinner_in_app_install')
      // let spinnerElem = document.getElementsByClassName("stretchspinner_in_app_install")  as HTMLCollectionOf<HTMLElement>;
      console.log('APP-STORE-INSTALL GET iframeDoc readyState spinnerElem', spinnerElem)
      spinnerElem.classList.add("hide-stretchspinner")

    });
  }


  // _getIframeHaLoaded() {
  //   var self = this;
  //   var iframe = document.getElementById('i_frame') as HTMLIFrameElement;;
  //   console.log('APP-STORE-INSTALL GET iframe ', iframe)
  //   var iframeDoc = iframe.contentDocument;
  //   console.log('APP-STORE-INSTALL GET iframeDoc ', iframeDoc)

  //   // Check if loading is complete
  //   if (iframeDoc.readyState == 'complete') {
  //     console.log('APP-STORE-INSTALL GET iframeDoc readyState', iframeDoc.readyState)
  //     console.log('APP-STORE-INSTALL GET iframeDoc readyState  iframeDoc', iframeDoc)
  //     // this.ngZone.run( () => {
  //     self.showSpinner = false;
  //     let spinnerElem = <HTMLElement>document.querySelector('.stretchspinner_in_app_install')
  //     // let spinnerElem = document.getElementsByClassName("stretchspinner_in_app_install")  as HTMLCollectionOf<HTMLElement>;
  //     console.log('APP-STORE-INSTALL GET iframeDoc readyState spinnerElem', spinnerElem)
  //     spinnerElem.classList.add("hide-stretchspinner")
  //     // });
  //     console.log('APP-STORE-INSTALL GET iframeDoc readyState   this.showSpinner', self.showSpinner)
  //   } else {
  //     // If we are here, it is not loaded. Set things up so we check   the status again in 100 milliseconds
  //     window.setTimeout(this._getIframeHaLoaded, 100)
  //   }
  // }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    // this.newInnerWidth = event.target.innerWidth;
    this.newInnerHeight = event.target.innerHeight;
    console.log('NEW INNER HEIGHT ', this.newInnerHeight);
    // this.iframeHeight = this.newInnerHeight - this.navbarHeight;
    this.iframeHeight = this.newInnerHeight - this.navbarAndFooterHeight;
    console.log('ON RESIZE -> IFRAME HEIGHT (ACTUAL HEIGHT - NAVBAR HEIGHT) ', this.iframeHeight);

    return { 'height': this.iframeHeight += 'px' };
  }

  onInitframeHeight(): any {
    this.actualHeight = window.innerHeight;
    console.log('ACTUAL HEIGHT ', this.actualHeight);
    // this.iframeHeight = this.actualHeight += 'px';
    // this.iframeHeight = this.actualHeight - this.navbarHeight;
    this.iframeHeight = this.actualHeight - this.navbarAndFooterHeight;
    console.log('ON INIT -> IFRAME HEIGHT (ACTUAL HEIGHT - NAVBAR HEIGHT) ', this.iframeHeight);

    return { 'height': this.iframeHeight += 'px' };
  }

  goBack() {
    console.log("APP-STORE-INSTALL - goBack");
    this.location.back();
  }


}
