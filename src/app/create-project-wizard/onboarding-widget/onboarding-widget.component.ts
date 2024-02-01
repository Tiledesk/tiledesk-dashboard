import { LoggerService } from 'app/services/logger/logger.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { BrandService } from 'app/services/brand.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/core/auth.service';
import { User } from 'app/models/user-model';

@Component({
  selector: 'appdashboard-onboarding-widget',
  templateUrl: './onboarding-widget.component.html',
  styleUrls: ['./onboarding-widget.component.scss']
})
export class OnboardingWidgetComponent implements OnInit {

  @ViewChild('widgetIframe', {static:true}) widgetIframe:ElementRef;
  
  CLOSE_BTN_IS_HIDDEN = true
  companyLogo: string;
  navigationBaseUrl: string;
  projectId: string;
  user: User;

  constructor(
    private route: ActivatedRoute,
    public location: Location,
    public brandService: BrandService,
    public translate: TranslateService,
    private auth: AuthService,
    private logger: LoggerService
  ) {
    // super(translate);
    const brand = brandService.getBrand();
    this.projectId = this.route.snapshot.params['projectid'];
    this.companyLogo = brand['BASE_LOGO'];
  }

  ngOnInit(): void {
    this.getLoggedUser()
  }

  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      // console.log('[WIZARD - CREATE-PRJCT] - USER ', user)
      if (user) {
        this.user = user;
      }
    });
  }

  getNavigationBaseUrl() {
    const href = window.location.href;
    this.logger.log('[BOTS-LIST] href ', href)
    const hrefArray = href.split('/#/');
    this.navigationBaseUrl = hrefArray[0];
  }

  goBack() {
    this.location.back();
  }

  onLoaded(event){
    this.widgetIframe.nativeElement.contentWindow.postMessage({
        onBoardingProjectId: this.projectId, 
        token: this.user.token,
        baseUrl: this.navigationBaseUrl
      }, '*')
  }
}
