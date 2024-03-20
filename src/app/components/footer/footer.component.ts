import { Component, OnInit } from '@angular/core';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { environment } from '../../../environments/environment';
// import brand from 'assets/brand/brand.json';
import { BrandService } from './../../services/brand.service';
import { LoggerService } from './../../services/logger/logger.service';
import { AppConfigService } from 'app/services/app-config.service';
// declare var require: any;
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  test: Date = new Date();
  // public version: string = require( '../../../../package.json').version;
  public version: string = environment.VERSION;



  company_name: string;
  companySiteName: string;
  companySiteUrl: string;
  privacyPolicyLinkName: string;
  privacyPolicyUrl: string;
  displayTermsAndConditionsLink: boolean;
  termsAndConditionsUrl: string;
  display_contact_us_email: string;
  display_star_us_on_github: string;
  display_leave_us_a_feedback: string;
  display_followus_on_x: string;
  followus_on_x_URL: string;
  display_followus_on_fb: string;
  followus_on_fb_URL: string;
  display_followus_on_in: string;
  followus_on_in_URL: string;
  display_followus_on_instagram: string;
  followus_on_instagram_URL: string;
  display_followus_on_youtube: string;
  followus_on_youtube_URL: string;
  contactUsEmail: string;
  displayContactUs: boolean;

  public_Key: string;
  areActivePay: boolean;

  constructor(
    public brandService: BrandService,
    private logger: LoggerService,
    private prjctPlanService: ProjectPlanService,
    public appConfigService: AppConfigService
  ) {
    const brand = brandService.getBrand();
    this.company_name = brand['BRAND_NAME'];
    this.companySiteName = brand['COMPANY_SITE_NAME'];
    this.companySiteUrl = brand['COMPANY_SITE_URL'];
    this.privacyPolicyLinkName = brand['privacy_policy_link_text']
    this.privacyPolicyUrl = brand['privacy_policy_url']
    this.displayTermsAndConditionsLink = brand['footer']['display_terms_and_conditions_link']
    this.termsAndConditionsUrl = brand['terms_and_conditions_url']
    this.display_contact_us_email = brand['display_contact_us_email'];
    this.display_star_us_on_github = brand['footer']['display_star_us_on_github'];
    this.display_leave_us_a_feedback =  brand['footer']['display_leave_us_a_feedback'];
    this.display_followus_on_x = brand['footer']['display_followus_on_x'];
    this.followus_on_x_URL=  brand['footer']['followus_on_x_URL'];
    this.display_followus_on_fb = brand['footer']['display_followus_on_fb'];
    this.followus_on_fb_URL = brand['footer']['followus_on_fb_URL'];
    this.display_followus_on_in = brand['footer']['display_followus_on_in'];
    this.followus_on_in_URL = brand['footer']['followus_on_in_URL'];
    this.display_followus_on_instagram = brand['footer']['display_followus_on_instagram'];
    this.followus_on_instagram_URL = brand['footer']['followus_on_instagram_URL'];
    this.display_followus_on_youtube = brand['footer']['display_followus_on_youtube'];
    this.followus_on_youtube_URL = brand['footer']['followus_on_youtube_URL'];
    this.contactUsEmail = brand['CONTACT_US_EMAIL'];

  }

  ngOnInit() {
    this.logger.log('[FOOTER-COMP] version ', this.version);
    // this.brandLog()
    this.getOSCODE()
  }

  getOSCODE() {

    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[FOOTER-COMP] getAppConfig - public_Key', this.public_Key);
    let keys = this.public_Key.split("-");
    this.logger.log('[FOOTER-COMP] - keys', keys)
    keys.forEach(key => {

      if (key.includes("PAY")) {
        // this.logger.log('[FOOTER-COMP] PUBLIC-KEY - key', key);
        let psa = key.split(":");
        // this.logger.log('[FOOTER-COMP] PUBLIC-KEY - pay key&value', psa);
        if (psa[1] === "F") {
          this.areActivePay = false;
        } else {
          this.areActivePay = true;
        }
      }
    });

    if (!this.public_Key.includes("PAY")) {
      this.areActivePay = false;
    }

    this.getProjectPlan();
  }
  getProjectPlan() {
    this.prjctPlanService.projectPlan$.subscribe(
      (projectProfileData: any) => {
        // console.log('[FOOTER-COMP] - GET PROJECT PLAN - RES ', projectProfileData)
        if (projectProfileData) {


          if (projectProfileData.profile_type === 'free') {
            if (projectProfileData.trial_expired === false) {
              this.displayContactUs = true;
            } else {
              this.displayContactUs = false;
            }
          } else if (projectProfileData.profile_type === 'payment') {
            if (projectProfileData.subscription_is_active === true) {
              this.displayContactUs = true;

            } else if (projectProfileData.subscription_is_active === false) {
              this.displayContactUs = false;
            }
          }
        }
      },
      (err) => {
        this.logger.error('[USERS] GET PROJECT PROFILE - ERROR', err)
      },
      () => {
        this.logger.log('[USERS] GET PROJECT PROFILE * COMPLETE *')
      },
    )
  }




  brandLog() {

    // this.logger.log('BRAND_JSON - FOOTER ', this.brand);
    this.logger.log('[FOOTER-COMP] BRAND_JSON - companySiteName ', this.companySiteName);
    this.logger.log('[FOOTER-COMP] BRAND_JSON - companySiteUrl ', this.companySiteUrl);
    this.logger.log('[FOOTER-COMP] BRAND_JSON - companyContactUsEmail ', this.contactUsEmail);
    this.logger.log('[FOOTER-COMP] BRAND_JSON - privacyPolicyLinkName ', this.privacyPolicyLinkName);
    this.logger.log('[FOOTER-COMP] BRAND_JSON - privacyPolicyUrl ', this.privacyPolicyUrl);
    this.logger.log('[FOOTER-COMP] BRAND_JSON - displayTermsAndConditionsLink ', this.displayTermsAndConditionsLink);
    this.logger.log('[FOOTER-COMP] BRAND_JSON - termsAndConditionsUrl ', this.termsAndConditionsUrl);
    this.logger.log('[FOOTER-COMP] BRAND_JSON - display_contact_us_email ', this.display_contact_us_email);
  }


  goToTiledeskGithub() {
    const url = 'https://github.com/Tiledesk';
    window.open(url, '_blank');
  }
}
