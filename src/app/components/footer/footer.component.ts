import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import brand from 'assets/brand/brand.json';
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
  company_name = brand.company_name;
  companySiteName = brand.company_site_name;
  companySiteUrl = brand.company_site_url;

  privacyPolicyLinkName = brand.privacy_policy_link_text
  privacyPolicyUrl = brand.privacy_policy_url

  displayTermsAndConditionsLink = brand.footer.display_terms_and_conditions_link
  termsAndConditionsUrl = brand.terms_and_conditions_url

  display_contact_us_email = brand.footer.display_contact_us_email;
  contactUsEmail = brand.contact_us_email;

  constructor() { }

  ngOnInit() {
    console.log('version (footer.component)  ', this.version);
    this.brandLog()
  }

  brandLog() {

    console.log('BRAND_JSON - FOOTER ', brand);
    console.log('BRAND_JSON - FOOTER companySiteName ', this.companySiteName);
    console.log('BRAND_JSON - FOOTER companySiteUrl ', this.companySiteUrl);
    console.log('BRAND_JSON - FOOTER companyContactUsEmail ', this.contactUsEmail);
    console.log('BRAND_JSON - FOOTER privacyPolicyLinkName ', this.privacyPolicyLinkName);
    console.log('BRAND_JSON - FOOTER privacyPolicyUrl ', this.privacyPolicyUrl);
    console.log('BRAND_JSON - FOOTER displayTermsAndConditionsLink ', this.displayTermsAndConditionsLink);
    console.log('BRAND_JSON - FOOTER termsAndConditionsUrl ', this.termsAndConditionsUrl);
    console.log('BRAND_JSON - FOOTER display_contact_us_email ', this.display_contact_us_email);
  }

}
