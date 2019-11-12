import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { environment } from '../../environments/environment';
@Injectable()
export class AppConfigService {

  http: Http;
  private appConfig: any;

  constructor(
    http: Http,
  ) {
    this.http = http;
    this.appConfig = environment;
  }


  async loadAppConfig() {
    // return this.http.get(this.appConfig.apiUrl + 'settings')
    try {
      const data = await this.http.get(this.appConfig.remoteConfigUrl)
        .toPromise();
      // console.log('AppConfigService loadAppConfig data: ', data['_body']);
      this.appConfig.firebase = JSON.parse(data['_body']);
    } catch (err) {
      console.log('AppConfigService loadAppConfig error : ', err);
    }
  }

  getConfig() {
    // console.log('AppConfigService getConfig ', this.appConfig);
    return this.appConfig;
  }
}
