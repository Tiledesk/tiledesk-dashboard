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
  companySiteName = brand.company_site_name;
  companySiteUrl = brand.company_site_url;
  companyContactUsEmail = brand.company_contact_us_email;

  privacyPolicyLinkName = brand.footer.privacy_policy_link_name
  privacyPolicyUrl = brand.footer.privacy_policy_url
  displayTermsAndConditionsLink = brand.footer.display_terms_and_conditions_link
  termsAndConditionsUrl = brand.footer.terms_and_conditions_url


  constructor() { }

  ngOnInit() {
    console.log('version (footer.component)  ', this.version);
    this.brandLog()
  }

  brandLog() {

    console.log('BRAND_JSON - FOOTER ', brand);
    console.log('BRAND_JSON - FOOTER companySiteName ', this.companySiteName);
    console.log('BRAND_JSON - FOOTER companySiteUrl ', this.companySiteUrl);
    console.log('BRAND_JSON - FOOTER companyContactUsEmail ', this.companyContactUsEmail);
    console.log('BRAND_JSON - FOOTER privacyPolicyLinkName ', this.privacyPolicyLinkName);
    console.log('BRAND_JSON - FOOTER privacyPolicyUrl ', this.privacyPolicyUrl);
    console.log('BRAND_JSON - FOOTER displayTermsAndConditionsLink ', this.displayTermsAndConditionsLink);
    console.log('BRAND_JSON - FOOTER termsAndConditionsUrl ', this.termsAndConditionsUrl);
  }

}
