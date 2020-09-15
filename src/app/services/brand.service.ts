import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { environment } from '../../environments/environment';
import brand from 'assets/brand/brand.json';

@Injectable()
export class BrandService {

  // "brandSrc":"https://tiledeskbrand.nicolan74.repl.co/mybrand",

  public brand: any;
  // public brand = brand
  local_url = '/assets/brand/brand.json';

  http: Http;
  constructor(
    http: Http
  ) {
    this.http = http;
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

      console.log('BrandService loadBrand - remoteConfig is true - remoteConfigUrl ');

      const res = await this.http.get(environment['remoteConfigUrl']).toPromise();
      // console.log('BrandService loadBrand remoteConfig -> true get remoteConfig response ', res);

      const remoteConfigData = JSON.parse(res['_body'])
      console.log('BrandService loadBrand - remoteConfig is true - get remoteConfigData  res ', remoteConfigData);

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
      console.log('BrandService setBrand error : ', err);
    }


  }

  //   async setBrand(url) {

  // }





  getBrand() {
    console.log('BrandService getBrand has been called - brand: ', this.brand);
    return this.brand;
  }


}
