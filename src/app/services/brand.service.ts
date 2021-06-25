import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { environment } from '../../environments/environment';
import brand from 'assets/brand/brand.json';
import { TranslateService } from '@ngx-translate/core';
// import { NotifyService } from './../core/notify.service';
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
    // private notify: NotifyService
  ) {
    this.http = http;
    this.getTranslations()
  }

  getTranslations() {
       this.translate.get('Warning')
      .subscribe((text: string) => {
        // this.deleteContact_msg = text;
        // console.log('+ + + BrandService translation text: ', text)

        this.warning = text;
    
      });

      this.translate.get('RelatedKnowledgeBase')
      .subscribe((text: string) => {
        // this.deleteContact_msg = text;
        // console.log('+ + + BrandService translation text: ', text)

        this.loadBrandError = text;
    
      });


      
  }


  isEmpty(url: string) {
    return (url === undefined || url == null || url.length <= 0) ? true : false;
  }

  async loadBrand() {

    let url = ''
    if (environment.remoteConfig === false) {
      console.log('BrandService loadBrand remoteConfig is false ');

      if (environment.hasOwnProperty("brandSrc")) {

        console.log('BrandService loadBrand remoteConfig is false - env has Property brandSrc');
        const remoteBrandUrl = this.isEmpty(environment['brandSrc']);

        if (!remoteBrandUrl) {

          console.log('BrandService loadBrand remoteConfig is false - env brandSrc is empty ? ', remoteBrandUrl);
          url = environment['brandSrc']
          // this.setBrand(url)
        } else {
          console.log('BrandService loadBrand remoteConfig is false - env brandSrc is empty ? ', remoteBrandUrl, ' -> load from assets');
          // url = this.local_url
          this.brand = brand;
          // this.setBrand(this.local_url)
        }
      } else {
        console.log('BrandService loadBrand remoteConfig is false - env NOT has Property brandSrc -> load from assets');

        // url = this.local_url
        this.brand = brand;
        // this.setBrand(this.local_url)
      }

    } else {

      // console.log('BrandService loadBrand - remoteConfig is true - remoteConfigUrl ');

      const res = await this.http.get(environment['remoteConfigUrl']).toPromise();
      // console.log('BrandService loadBrand remoteConfig -> true get remoteConfig response ', res);

      const remoteConfigData = JSON.parse(res['_body'])
      // console.log('BrandService loadBrand - remoteConfig is true - get remoteConfigData  res ', remoteConfigData);

      if (remoteConfigData.hasOwnProperty("brandSrc")) {
        console.log('BrandService loadBrand remoteConfig is true - remoteConfigData has Property brandSrc');

        const remoteBrandUrl = this.isEmpty(remoteConfigData.brandSrc);


        if (!remoteBrandUrl) {

          console.log('BrandService loadBrand remoteConfig is true - remoteConfigData brandSrc is empty ?', remoteBrandUrl);
          url = remoteConfigData.brandSrc

          // this.setBrand(url)

        } else {
          console.log('BrandService loadBrand remoteConfig is true - remoteConfigData brandSrc is empty ?', remoteBrandUrl, ' -> load from assets');
          // this.setBrand(this.local_url)
          // url = this.local_url
          this.brand = brand;
        }

      } else {
        console.log('BrandService loadBrand remoteConfig is true - remoteConfigData NOT has Property brandSrc -> load from assets');
        // this.setBrand(this.local_url)
        // url = this.local_url
        this.brand = brand;

      }
    }

    try {
      if (url) {
        const data = await this.http.get(url).toPromise();

        console.log('BrandService **** GET BRAND FROM URL ****', url);

        this.brand = JSON.parse(data['_body'])

        console.log('BrandService loadBrand - brand: ', this.brand);
      }

    } catch (err) {
      console.log('BrandService loadBrand error : ', err);

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

  //   async setBrand(url) {

  // }





  getBrand() {
    // console.log('BrandService getBrand has been called - brand: ', this.brand);
    return this.brand;
  }


}
