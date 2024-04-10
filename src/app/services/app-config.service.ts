import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AppConfigService {
  private appConfig: any;

  constructor(
    private _httpClient: HttpClient
  ) {
    // console.log('AppConfigService HELLO !!!!');
    this.appConfig = environment;
  }


  async loadAppConfig() {

    try {
      const data = await this._httpClient.get(this.appConfig.remoteConfigUrl)
        .toPromise();
      // console.log('AppConfigService loadAppConfig data: ', data['_body']['firebase']);
      // console.log('[APP-CONFIG-SERVICE] loadAppConfig data: ', data);

      // const dataObject = JSON.parse(data['_body'])
      const allconfig = data
      // console.log('[APP-CONFIG-SERVICE] - loadAppConfig allconfig: ', allconfig);
      if (allconfig.hasOwnProperty('wsUrlRel')) {

        // console.log('[APP-CONFIG-SERVICE] - loadAppConfig allconfig !!!! exist wsUrlRel ->: ',  allconfig.wsUrlRel);
        var wsUrlRelIsEmpty = this.isEmpty(allconfig['wsUrlRel'])
        // console.log('[APP-CONFIG-SERVICE] - loadAppConfig allconfig !!!! exist wsUrlRel -> wsUrlRelIsEmpty ?', wsUrlRelIsEmpty);

        if (wsUrlRelIsEmpty === false) {
          //   console.log('[APP-CONFIG-SERVICE]- loadAppConfig allconfig !!!! exist - allconfig ', allconfig);
          //   if (allconfig['SERVER_BASE_URL'].indexOf("http://") !== -1) {
          //     const ws_url = allconfig['SERVER_BASE_URL'].replace("http://", "ws://").slice(0, -1) + allconfig['wsUrlRel'];
          //     console.log('AppConfigService loadAppConfig allconfig !!!! exist - SERVER_BASE_URL protocol is HTTP - wsUrl (1)', ws_url);

          //     allconfig['wsUrl'] = ws_url
          //   } else if (allconfig['SERVER_BASE_URL'].indexOf("https://") !== -1) {

          //     const ws_url = allconfig['SERVER_BASE_URL'].replace("https://", "wss://").slice(0, -1) + allconfig['wsUrlRel'];
          //     allconfig['wsUrl'] = ws_url
          //     console.log('AppConfigService loadAppConfig allconfig !!!! exist - SERVER_BASE_URL protocol is HTTPS - wsUrl (2)', ws_url);
          //   } else {

          //     if (window.location.protocol === 'http:') {
          //       allconfig['wsUrl'] = 'ws://' + window.location.hostname + ':' + window.location.port + allconfig['wsUrlRel']
          //       console.log('[APP-CONFIG-SERVICE] wsUrl (3)',  allconfig['wsUrl'] )

          //     } else if (window.location.protocol === 'https:') {

          //       allconfig['wsUrl'] = 'wss://' + window.location.hostname + ':' + window.location.port + allconfig['wsUrlRel']
          //       console.log('[APP-CONFIG-SERVICE] wsUrl (4)',  allconfig['wsUrl'] )
          //     } else {

          //       allconfig['wsUrl'] = 'ws://' + window.location.hostname + ':' + window.location.port + allconfig['wsUrlRel']
          //       console.log('[APP-CONFIG-SERVICE] wsUrl (4)',  allconfig['wsUrl'] )
          //     }
          //   }


          if (window.location.protocol === 'http:') {
            allconfig['wsUrl'] = 'ws://' + window.location.hostname + ':' + window.location.port + allconfig['wsUrlRel']
            // console.log('[APP-CONFIG-SERVICE] wsUrl (1)', allconfig['wsUrl'])

          } else if (window.location.protocol === 'https:') {

            allconfig['wsUrl'] = 'wss://' + window.location.hostname + ':' + window.location.port + allconfig['wsUrlRel']
            // console.log('[APP-CONFIG-SERVICE] wsUrl (2)', allconfig['wsUrl'])
          } else {

            allconfig['wsUrl'] = 'ws://' + window.location.hostname + ':' + window.location.port + allconfig['wsUrlRel']
            // console.log('[APP-CONFIG-SERVICE] wsUrl (3)', allconfig['wsUrl'])
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
      console.error('[APP-CONFIG-SERVICE] - loadAppConfig error : ', err);
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
