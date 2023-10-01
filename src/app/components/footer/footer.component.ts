import { Component, OnInit } from '@angular/core';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { environment } from '../../../environments/environment';
// import brand from 'assets/brand/brand.json';
import { BrandService } from './../../services/brand.service';
import { LoggerService } from './../../services/logger/logger.service';
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

  // company_name = brand.company_name;
  // companySiteName = brand.company_site_name;
  // companySiteUrl = brand.company_site_url;
  // privacyPolicyLinkName = brand.privacy_policy_link_text
  // privacyPolicyUrl = brand.privacy_policy_url
  // displayTermsAndConditionsLink = brand.footer.display_terms_and_conditions_link
  // termsAndConditionsUrl = brand.terms_and_conditions_url
  // display_contact_us_email = brand.footer.display_contact_us_email;
  // contactUsEmail = brand.contact_us_email;

  company_name: string;
  companySiteName: string;
  companySiteUrl: string;
  privacyPolicyLinkName: string;
  privacyPolicyUrl: string;
  displayTermsAndConditionsLink: boolean;
  termsAndConditionsUrl: string;
  display_contact_us_email: string;
  contactUsEmail: string;
  displayContactUs: boolean;

  constructor(
    public brandService: BrandService,
    private logger: LoggerService,
    private prjctPlanService: ProjectPlanService,
  ) {
    const brand = brandService.getBrand();
    this.company_name = brand['company_name'];
    this.companySiteName = brand['company_site_name'];
    this.companySiteUrl = brand['company_site_url'];
    this.privacyPolicyLinkName = brand['privacy_policy_link_text']
    this.privacyPolicyUrl = brand['privacy_policy_url']
    this.displayTermsAndConditionsLink = brand['footer']['display_terms_and_conditions_link']
    this.termsAndConditionsUrl = brand['terms_and_conditions_url']
    this.display_contact_us_email = brand['footer']['display_contact_us_email'];
    this.contactUsEmail = brand['contact_us_email'];

  }

  ngOnInit() {
    this.logger.log('[FOOTER-COMP] version ', this.version);
    // this.brandLog()
    this.getProjectPlan()
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
