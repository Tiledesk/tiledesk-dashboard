import { forwardRef, Inject, Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { environment } from '../../environments/environment';

@Injectable()
export class AppConfigService {

  http: Http;
  private appConfig: any;

  constructor(
    http: Http,
  ) {
    // console.log('AppConfigService HELLO !!!!');
    this.http = http;
    this.appConfig = environment;
  }


  async loadAppConfig() {
    // return this.http.get(this.appConfig.apiUrl + 'settings')
    try {
      const data = await this.http.get(this.appConfig.remoteConfigUrl)
        .toPromise();
      // console.log('AppConfigService loadAppConfig data: ', data['_body']['firebase']);
      // console.log('[APP-CONFIG-SERVICE] loadAppConfig data: ', data);

      const dataObject = JSON.parse(data['_body'])

      const allconfig = dataObject
      // console.log('[APP-CONFIG-SERVICE] - loadAppConfig allconfig: ', allconfig);

      if (allconfig.hasOwnProperty('wsUrlRel')) {

        // console.log('[APP-CONFIG-SERVICE] - loadAppConfig allconfig !!!! exist wsUrlRel ->: ',  allconfig.wsUrlRel);
        var wsUrlRelIsEmpty = this.isEmpty(allconfig.wsUrlRel)
        // console.log('[APP-CONFIG-SERVICE] - loadAppConfig allconfig !!!! exist wsUrlRel -> wsUrlRelIsEmpty ?', wsUrlRelIsEmpty);

        if (wsUrlRelIsEmpty === false) {
          // console.log('[APP-CONFIG-SERVICE]- loadAppConfig allconfig !!!! exist - SERVER_BASE_URL', allconfig.SERVER_BASE_URL);


          if (allconfig.SERVER_BASE_URL.indexOf("http://") !== -1) {

            const ws_url = allconfig.SERVER_BASE_URL.replace("http://", "ws://").slice(0, -1) + allconfig.wsUrlRel;
            // console.log('AppConfigService loadAppConfig allconfig !!!! exist - SERVER_BASE_URL protocol is HTTP - wsUrl', ws_url);

            allconfig.wsUrl = ws_url

          } else if (allconfig.SERVER_BASE_URL.indexOf("https://") !== -1) {

            const ws_url = allconfig.SERVER_BASE_URL.replace("https://", "wss://").slice(0, -1) + allconfig.wsUrlRel;

            allconfig.wsUrl = ws_url

            // console.log('AppConfigService loadAppConfig allconfig !!!! exist - SERVER_BASE_URL protocol is HTTPS - wsUrl', ws_url);
          } else {
            // console.log('AppConfigService loadAppConfig allconfig !!!! exist - SERVER_BASE_URL !!! IS RELATIVE - window.location ', window.location);

            // console.log(window.location)

            // if (window.location.protocol === 'http:') {
            //   allconfig.wsUrl = 'ws://' + window.location.hostname + '/ws/'

            // } else if (window.location.protocol === 'https:') {

            //   allconfig.wsUrl = 'wss://' + window.location.hostname + '/ws/'
            // } else {

            //   allconfig.wsUrl = 'ws://' + window.location.hostname + '/ws/'
            // }

            if (window.location.protocol === 'http:') {
              allconfig.wsUrl = 'ws://' + window.location.hostname + ':' + window.location.port + allconfig.wsUrlRel

            } else if (window.location.protocol === 'https:') {

              allconfig.wsUrl = 'wss://' + window.location.hostname + ':' + window.location.port + allconfig.wsUrlRel
            } else {

              allconfig.wsUrl = 'ws://' + window.location.hostname + ':' + window.location.port + allconfig.wsUrlRel
            }
          }

        } else {
          // console.log('[APP-CONFIG-SERVICE] loadAppConfig allconfig !!!! exist wsUrlRel but IS EMPTY');
        }

      } else {

        // console.log('[APP-CONFIG-SERVICE] loadAppConfig allconfig !!!! does not exist wsUrlRel');
      }

      this.appConfig = allconfig;
      // console.log('[APP-CONFIG-SERVICE] - loadAppConfig allconfig !!!! does not exist wsUrlRel');
      // return this.appConfig;

    } catch (err) {
      // console.error('[APP-CONFIG-SERVICE] - loadAppConfig error : ', err);
    }
  }

  isEmpty(wsUrlRel: string) {
    return (wsUrlRel === undefined || wsUrlRel == null || wsUrlRel.length <= 0) ? true : false;
  }


  getConfig() {
    // console.log('AppConfigService getConfig ', this.appConfig);
    return this.appConfig;
  }
}
