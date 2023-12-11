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
  // "company_logo_black__url": "assets/img/logos/tiledesk_3.0_logo_black_v2_no_version.svg",
   _brand = {
    "metaTitle": "Tiledesk Design Studio",
    "favicon__url": "https://tiledesk.com/wp-content/uploads/2022/07/tiledesk_v13-300x300.png",
    "company_name": "Tiledesk",
    "company_site_name": "tiledesk.com",
    "company_site_url": "https://www.tiledesk.com",
    "company_logo_white__url": "assets/img/logos/tiledesk-logo_white_orange.svg",
    "company_logo_black__url": "assets/img/logos/tiledesk_4.0_logo_black_text.svg",
    "company_logo_allwhite__url": "assets/img/logos/tiledesk_3.0_logo_all_white_v2_no_version.svg",
    "company_logo_no_text__url": "assets/img/logos/tiledesk-solo-logo.png",
    "privacy_policy_link_text": "Privacy Policy",
    "privacy_policy_url": "https://www.tiledesk.com/privacy.html",
    "display_terms_and_conditions_link": true,
    "terms_and_conditions_url": "https://www.tiledesk.com/termsofservice.html",
    "contact_us_email": "support@tiledesk.com",
    "footer": {
        "display_terms_and_conditions_link": true,
        "display_contact_us_email": true
    },
    "recent_project_page": {
        "company_logo_black__width": "130px"
    },
    "signup_page": {
        "display_terms_and_conditions_link": true
    },
    "handle_invitation_page": {
        "company_logo_45x45": "assets/img/logos/tiledesk-solo-logo.png"
    },
    "wizard_create_project_page": {
        "logo_x_rocket": "assets/img/logos/logo_x_rocket4x4.svg"
    },
    "wizard_install_widget_page": {
        "logo_on_rocket": "assets/img/logos/tiledesk-solo-logo.png"
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
    //     console.log('[BRAND-SERV] BRAND RETIEVED FROM ASSET assetBrand ', this.assetBrand);
    //   });

    let url = ''
    if (environment.remoteConfig === false) {

      if (environment.hasOwnProperty("brandSrc")) {

        this.logger.log('[BRAND-SERV] loadBrand remoteConfig is false - env has Property brandSrc');
        const remoteBrandUrl = this.isEmpty(environment['brandSrc']);

        if (!remoteBrandUrl) {
          this.logger.log('[BRAND-SERV] loadBrand remoteConfig is false - env brandSrc is empty ? ', remoteBrandUrl);
          url = environment['brandSrc']
        } else {
          this.logger.log('[BRAND-SERV] loadBrand remoteConfig is false - env brandSrc is empty ? ', remoteBrandUrl, ' -> load from assets')
          this.brand =  this._brand;
        }
      } else {
        this.logger.log('[BRAND-SERV] loadBrand remoteConfig is false - env NOT has Property brandSrc -> load from assets');
        this.brand = this._brand;
      }
    } else {
      const res = await this.httpClient.get(environment['remoteConfigUrl']).toPromise();
      this.logger.log('[BRAND-SERV] loadBrand - remoteConfig -> true get remoteConfig response ', res);

      // const remoteConfigData = JSON.parse(res['_body'])
      const remoteConfigData = res
      // this.logger.log('BrandService loadBrand - remoteConfig is true - get remoteConfigData  res ', remoteConfigData);

      if (remoteConfigData.hasOwnProperty("brandSrc")) {
        this.logger.log('[BRAND-SERV] loadBrand remoteConfig is true - remoteConfigData has Property brandSrc');

        const remoteBrandUrl = this.isEmpty(remoteConfigData['brandSrc']);
        if (!remoteBrandUrl) {
          this.logger.log('[BRAND-SERV] loadBrand remoteConfig is true - remoteConfigData brandSrc is empty ?', remoteBrandUrl);

          url = remoteConfigData['brandSrc']


        } else {
          this.logger.log('[BRAND-SERV] loadBrand remoteConfig is true - remoteConfigData brandSrc is empty ?', remoteBrandUrl, ' -> load from assets');

          this.brand = this._brand;
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

        this.brand = JSON.parse(data['_body'])

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

  getBrand() {
    // this.logger.log('BrandService getBrand has been called - brand: ', this.brand);
    return this.brand;
    
  }


}
