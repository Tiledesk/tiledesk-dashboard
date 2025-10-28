import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

// import  brand  from "../../assets/brand/brand.json";
// import * as brand from 'assets/brand/brand.json';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '../services/logger/logger.service';

const swal = require('sweetalert');

@Injectable()
export class BrandService {



  // "brandSrc":"https://tiledeskbrand.nicolan74.repl.co/mybrand",

  public brand: any;

  _brand = {
    DASHBOARD: {
      META_TITLE: "Tiledesk Design Studio",
      // FAVICON_URL: "https://tiledesk.com/wp-content/uploads/2022/07/tiledesk_v13-300x300.png",
      FAVICON_URL: "assets/img/logos/favicon.ico",
      CUSTOM_COMPANY_HOME_LOGO: false,
      COMPANY_LOGO_PLANET: "assets/img/logos/tiledesk_planet.svg",
      "privacy_policy_link_text": "Privacy Policy",
      "privacy_policy_url": "https://www.tiledesk.com/privacy.html",
      "display_terms_and_conditions_link": true,
      "terms_and_conditions_url": "https://www.tiledesk.com/termsofservice.html",
      "display_dpa_link": true,
      "dpa_url": "https://tiledesk.com/dpa/",
      "contact_us_email": "support@tiledesk.com",
      "display-news-and-documentation": true,
      "display_google_auth_btn": true,
      "display_forgot_pwd": true,
      "display_help_in_installation": true,
      "display_invite_teammate_btn": true,
      "display_contact_us_email": true,
      "custom_redirect_after_logout": false,
      "after_logout_redirect_URL": "",
      "display_chatbots_community": true,
      "display_templates_category": true,
      "display_change_pwd": true,
      "EXTREME_MEASURES": true,
      "SUPPORT_MENU": true,
      // "widget_logo_URL":"https://tiledesk.com/tiledesk-logo-white.png",
      // "widget_default_footer" :"<a tabindex='-1' target='_blank href='http://www.tiledesk.com/?utm_source=widget'><img src='https://panel.tiledesk.com/v3/dashboard/assets/img/logos/tiledesk-solo_logo_new_gray.svg'/><span> Powered by Tiledesk</span></a>",
      // "widget_launcher_button_placeholder": "assets/img/logos/custom-launcher-button-placeholder_v2.svg",
      "footer": {
        "display_terms_and_conditions_link": true,
        "display_star_us_on_github": true,
        "display_leave_us_a_feedback": true,
        "display_followus_on_x": true,
        "followus_on_x_URL": "https://twitter.com/tiledesk",
        "display_followus_on_fb": true,
        "followus_on_fb_URL": "https://www.facebook.com/tiledesk",
        "display_followus_on_in": true,
        "followus_on_in_URL": "https://www.linkedin.com/company/tiledesk",
        "display_followus_on_instagram": true,
        "followus_on_instagram_URL": "https://www.instagram.com/tiledesk/",
        "display_followus_on_youtube": true,
        "followus_on_youtube_URL": "https://www.youtube.com/@tiledesk"
      },
      "recent_project_page": {
        "company_logo_width": "130px",
        "company_logo_height": "30px"
      },
      "signup_page": {
        "display_terms_and_conditions_link": true,
        "display_social_proof_container":  true
      },
      "handle_invitation_page": {
        "company_logo_45x45": "assets/img/logos/tiledesk-solo-logo.png"
      },
    },
    WIDGET: {
      "LOGO_CHAT": "https://tiledesk.com/tiledesk-logo-white.png",
      "POWERED_BY": "<a tabindex='-1' target='_blank href='https://www.tiledesk.com/?utm_source=widget'><img src='https://panel.tiledesk.com/v3/dashboard/assets/img/logos/tiledesk-solo_logo_new_gray.svg'/><span> Powered by Tiledesk</span></a>"
    },
    CHAT: {

    },
    CDS: {
      META_TITLE: "Design Studio",
      FAVICON_URL: "https://tiledesk.com/wp-content/uploads/2022/07/tiledesk_v13-300x300.png",
      INFO_MENU_ITEMS: [
        { key: 'FEEDBACK', icon: "", src: "", status: "inactive" },
        { key: 'CHANGELOG', icon: "", src: "", status: "inactive" },
      ]
    },
    COMMON: {
      COMPANY_LOGO: "assets/img/logos/tiledesk_logo.svg",
      COMPANY_LOGO_NO_TEXT: "assets/img/logos/tiledesk_logo_no_text.svg",
      BASE_LOGO: "assets/img/logos/tiledesk_logo.svg",
      BASE_LOGO_NO_TEXT: "assets/img/logos/tiledesk_logo_no_text.svg",
      COMPANY_NAME: "Tiledesk",
      BRAND_NAME: "Tiledesk",
      COMPANY_SITE_NAME: "tiledesk.com",
      COMPANY_SITE_URL: "https://www.tiledesk.com",
      CONTACT_US_EMAIL: "support@tiledesk.com",
      CONTACT_SALES_EMAIL: "sales@tiledesk.com",
      BRAND_PRIMARY_COLOR: "#f0806f",
      BRAND_SECONDARY_COLOR: "#f0806f",
      DOCS: true,
      LOGOUT_ENABLED: true
    }
  }

  public assetBrand: any;
  // public brand = brand
  // local_url = '/assets/brand/brand.json';
  warning: string;
  loadBrandError: string;

  constructor(
    private httpClient: HttpClient,
    private translate: TranslateService,
    private logger: LoggerService
  ) {
    this.getTranslations()
    // console.log('[BRAND-SERV] HELLO !!!!!!! ');
  }

  getTranslations() {
    this.translate.get('Warning')
      .subscribe((text: string) => {
        this.warning = text;
      });

    this.translate.get('RelatedKnowledgeBase')
      .subscribe((text: string) => {
        this.loadBrandError = text;
      });
  }

  isEmpty(url: string) {
    return (url === undefined || url == null || url.length <= 0) ? true : false;
  }

  // getData() {
  //   return this.httpClient.get('/assets/brand/brand.json');
  // }


  async loadBrand() {

    // this.getData()
    //   .subscribe(data => {
    //     this.assetBrand = data
    //     this.logger.log('[BRAND-SERV] BRAND RETIEVED FROM ASSET assetBrand ', this.assetBrand);
    //   });

    let url = ''
    if (environment.remoteConfig === false) {

      if (environment.hasOwnProperty("brandSrc")) {

      //  console.log('[BRAND-SERV] loadBrand remoteConfig is false - env has Property brandSrc');
        const remoteBrandUrl = this.isEmpty(environment['brandSrc']);

        if (!remoteBrandUrl) {
          this.logger.log('[BRAND-SERV] loadBrand remoteConfig is false - env brandSrc is empty ? ', remoteBrandUrl);
          url = environment['brandSrc']
        } else {
          this.logger.log('[BRAND-SERV] loadBrand remoteConfig is false - env brandSrc is empty ? ', remoteBrandUrl, ' -> load from assets')
          this.brand = this._brand;
        }
      } else {
        this.logger.log('[BRAND-SERV] loadBrand remoteConfig is false - env NOT has Property brandSrc -> load from assets');
        this.brand = this._brand;
      }
    } else {
      const res = await this.httpClient.get(environment['remoteConfigUrl']).toPromise();
      // console.log('[BRAND-SERV] loadBrand - remoteConfig -> true get remoteConfig response ', res);


      const remoteConfigData = res
      // this.logger.log('BrandService loadBrand - remoteConfig is true - get remoteConfigData  res ', remoteConfigData);

      if (remoteConfigData.hasOwnProperty("brandSrc")) {
        this.logger.log('[BRAND-SERV] loadBrand remoteConfig is true - remoteConfigData has Property brandSrc');

        const remoteBrandUrl = this.isEmpty(remoteConfigData['brandSrc']);
        if (!remoteBrandUrl) {
          this.logger.log('[BRAND-SERV] loadBrand remoteConfig is true - remoteConfigData brandSrc is empty ?', remoteBrandUrl);

          url = remoteConfigData['brandSrc']


        } else {
          // console.log('[BRAND-SERV] loadBrand remoteConfig is true - remoteConfigData brandSrc is empty ?', remoteBrandUrl, ' -> load from assets');

          this.brand = this._brand;
          // console.log('[BRAND-SERV] this.brand', this.brand )
        }

      } else {
        this.logger.log('[BRAND-SERV] loadBrand remoteConfig is true - remoteConfigData NOT has Property brandSrc -> load from assets');
        // this.setBrand(this.local_url)
        // url = this.local_url
        this.brand = this._brand;
      }
    }

    try {
      if (url) {
        const data = await this.httpClient.get(url).toPromise();

        this.logger.log('[BRAND-SERV] **** GET BRAND FROM URL ****', url);

        // this.brand = JSON.parse(data['_body'])
        this.brand = data

        this.logger.log('[BRAND-SERV] loadBrand - brand: ', this.brand);
      }
    } catch (err) {
      this.logger.error('[BRAND-SERV] loadBrand error : ', err);

      this.brand = this._brand;
      // this.notify.showNotificationChangeProject('ops', 2, 'done');
      this.displaySwalAlert(err)
    }
  }

  displaySwalAlert(err) {
    swal({
      title: this.warning,
      text: 'An error occurred while uploading your brand. Error code: ' + err.status,
      icon: "warning",
      button: true,
      dangerMode: false,
    })
  }

  // getBrand() {
  //   // this.logger.log('BrandService getBrand has been called - brand: ', this.brand);
  //   return this.brand;
  // }
  getBrand() {
    this.logger.log('BrandService getBrand has been called - brand: ', this.brand);
    return { ...this.brand['DASHBOARD'], ...this.brand['COMMON'], ...{WIDGET: this.brand['WIDGET']} };

  }


}
