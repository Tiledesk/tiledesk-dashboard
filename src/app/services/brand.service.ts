import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { environment } from '../../environments/environment';
import brand from 'assets/brand/brand.json';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '../services/logger/logger.service';
import { AppConfigService } from '../services/app-config.service';
const swal = require('sweetalert');

@Injectable()
export class BrandService {

  // "brandSrc":"https://tiledeskbrand.nicolan74.repl.co/mybrand",

  public brand: any;
  // public brand = brand
  local_url = '/assets/brand/brand.json';

  http: Http;

  warning: string;
  loadBrandError: string;

  constructor(
    http: Http,
    private translate: TranslateService,
    private logger: LoggerService,
    private configService : AppConfigService
  ) {
    this.http = http;
    this.getTranslations()

  //  let loggerLevel  = new LoggerService(configService)
  //  console.log('[BRAND-SERV]  loggerLevel ', loggerLevel.getLoglevel()) 
  }

  getTranslations() {
       this.translate.get('Warning')
      .subscribe((text: string) => {
        // this.deleteContact_msg = text;
        // this.logger.log('+ + + BrandService translation text: ', text)

        this.warning = text;
    
      });

      this.translate.get('RelatedKnowledgeBase')
      .subscribe((text: string) => {
        // this.deleteContact_msg = text;
        // this.logger.log('+ + + BrandService translation text: ', text)

        this.loadBrandError = text;
    
      });


      
  }


  isEmpty(url: string) {
    return (url === undefined || url == null || url.length <= 0) ? true : false;
  }

  async loadBrand() {

    let url = ''
    if (environment.remoteConfig === false) {
      // this.logger.log('[BRAND-SERV] loadBrand remoteConfig is false ');

      if (environment.hasOwnProperty("brandSrc")) {

        this.logger.log('[BRAND-SERV] loadBrand remoteConfig is false - env has Property brandSrc');
        const remoteBrandUrl = this.isEmpty(environment['brandSrc']);

        if (!remoteBrandUrl) {

          this.logger.log('[BRAND-SERV] loadBrand remoteConfig is false - env brandSrc is empty ? ', remoteBrandUrl);
          url = environment['brandSrc']
          // this.setBrand(url)
        } else {
          this.logger.log('[BRAND-SERV] loadBrand remoteConfig is false - env brandSrc is empty ? ', remoteBrandUrl, ' -> load from assets');
          // url = this.local_url
          this.brand = brand;
          // this.setBrand(this.local_url)
        }
      } else {
        this.logger.log('[BRAND-SERV] loadBrand remoteConfig is false - env NOT has Property brandSrc -> load from assets');

        // url = this.local_url
        this.brand = brand;
        // this.setBrand(this.local_url)
      }

    } else {

      // this.logger.log('[BRAND-SERV] loadBrand - remoteConfig is true ');

      const res = await this.http.get(environment['remoteConfigUrl']).toPromise();
      this.logger.log('[BRAND-SERV] loadBrand - remoteConfig -> true get remoteConfig response ', res);

      const remoteConfigData = JSON.parse(res['_body'])
      // this.logger.log('BrandService loadBrand - remoteConfig is true - get remoteConfigData  res ', remoteConfigData);

      if (remoteConfigData.hasOwnProperty("brandSrc")) {
        this.logger.log('[BRAND-SERV] loadBrand remoteConfig is true - remoteConfigData has Property brandSrc');

        const remoteBrandUrl = this.isEmpty(remoteConfigData.brandSrc);
        if (!remoteBrandUrl) {
          this.logger.log('[BRAND-SERV] loadBrand remoteConfig is true - remoteConfigData brandSrc is empty ?', remoteBrandUrl);
          
          url = remoteConfigData.brandSrc

          // this.setBrand(url)

        } else {
          this.logger.log('[BRAND-SERV] loadBrand remoteConfig is true - remoteConfigData brandSrc is empty ?', remoteBrandUrl, ' -> load from assets');
          // this.setBrand(this.local_url)
          // url = this.local_url
          this.brand = brand;
        }

      } else {
        this.logger.log('[BRAND-SERV] loadBrand remoteConfig is true - remoteConfigData NOT has Property brandSrc -> load from assets');
        // this.setBrand(this.local_url)
        // url = this.local_url
        this.brand = brand;

      }
    }

    try {
      if (url) {
        const data = await this.http.get(url).toPromise();

        this.logger.log('[BRAND-SERV] **** GET BRAND FROM URL ****', url);

        this.brand = JSON.parse(data['_body'])

        this.logger.log('[BRAND-SERV] loadBrand - brand: ', this.brand);
      }

    } catch (err) {
      this.logger.error('[BRAND-SERV] loadBrand error : ', err);

      this.brand = brand;
      // this.notify.showNotificationChangeProject('ops', 2, 'done');
      this.displaySwalAlert(err)
    }


  }

  displaySwalAlert(err) {
  swal({
    title: this.warning,
    text: 'An error occurred while uploading your brand. Error code: ' + err.status ,
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
