import { AuthService } from './../../core/auth.service';
import { Component, OnInit, HostListener } from '@angular/core';
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

  constructor(
    public route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    public location: Location,
    private appStoreService: AppStoreService,
    private auth: AuthService
  ) {

    this.getRouteParams();

  }

  ngOnInit() {

    this.onInitframeHeight();
  }

  getRouteParams() {
    this.route.params.subscribe((params) => {

      console.log('APP-STORE-INSTALL - PARAMS ', params);

      this.appStoreService.getAppDetail(params.appid).subscribe((res) => {
        console.log("APP-STORE-INSTALL - GET APP DETAIL RESULT: ", res);
        this.result = res;
        //console.log(this.result._body);
        let parsed_json = JSON.parse(this.result._body); 
        console.log("PARSED JSON: ", parsed_json);

        this.auth.user_bs.subscribe((user) => {
          if (user) {
            this.TOKEN = user.token
            this.URL = this.sanitizer.bypassSecurityTrustResourceUrl(parsed_json.installActionURL + '?project_id=' + params.projectid + '&token=' + this.TOKEN);
            console.log("URL IFRAME: ", this.URL)
          } else {
            console.log("GET USER TOKEN: FAILED");
          }
        });
        
      })

      //this.app_title = params.apptitle;
      //console.log('APP-STORE-INSTALL - APP TITLE ',   this.app_title);

      //this.URL = this.sanitizer.bypassSecurityTrustResourceUrl(params.url);
      //console.log("URL IFRAME: ", this.URL)
    })
  }

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
    this.location.back();
  }


}
