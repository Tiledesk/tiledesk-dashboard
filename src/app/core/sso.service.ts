import { Injectable } from '@angular/core';
import { AppConfigService } from '../services/app-config.service';
import { LoggerService } from '../services/logger/logger.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class SsoService {


  CREATE_CUSTOM_TOKEN_URL: string;
  SERVER_BASE_PATH: string;
  GET_CURRENT_AUTHENTICATED_USER: string;
  URL_TILEDESK_SIGNIN_WITH_CUSTOM_TOKEN: string;


  constructor(
    public appConfigService: AppConfigService,
    private logger: LoggerService,
    public _httpclient: HttpClient
  ) {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    this.CREATE_CUSTOM_TOKEN_URL = this.SERVER_BASE_PATH + 'chat21/firebase/auth/createCustomToken';
    this.GET_CURRENT_AUTHENTICATED_USER = this.SERVER_BASE_PATH + 'users'
    this.URL_TILEDESK_SIGNIN_WITH_CUSTOM_TOKEN = this.SERVER_BASE_PATH + 'auth/signinWithCustomToken';
  }


  chat21CreateFirebaseCustomToken(JWT_token: any) {
    this.logger.log('[SSO-SERV] - chat21CreateFirebaseCustomToken JWT_token ', JWT_token)

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': JWT_token
      }),
      responseType: 'text' as 'json'
    };

    const url = this.CREATE_CUSTOM_TOKEN_URL;

    this.logger.log('[SSO-SERV] - chat21CreateFirebaseCustomToken ', url)

    return this._httpclient
      .post(url, null, httpOptions)
  }

  getCurrentAuthenticatedUser(JWT_token) {
    this.logger.log('[SSO-SERV] - getCurrentAuthenticatedUser JWT_token ', JWT_token)

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': JWT_token
      })
    };

    const url = this.GET_CURRENT_AUTHENTICATED_USER;
    this.logger.log('[SSO-SERV] - getCurrentAuthenticatedUser ', url)

    return this._httpclient
      .get(url, httpOptions)
  };

  signInWithCustomToken(JWT_token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': JWT_token
      })
    };
  
    const url = this.URL_TILEDESK_SIGNIN_WITH_CUSTOM_TOKEN
    return this._httpclient
    .post(url, null, httpOptions)
  
  }


  // signInWithCustomToken(tiledeskToken: string): Promise<any> {
  //   const headers = new HttpHeaders({
  //     'Content-type': 'application/json',
  //     Authorization: tiledeskToken
  //   });
  //   const requestOptions = { headers: headers };
  //   const that = this;
  //   return new Promise((resolve, reject) => {
  //     this.http.post(this.URL_TILEDESK_SIGNIN_WITH_CUSTOM_TOKEN, null, requestOptions).subscribe((data) => {
  //       if (data['success'] && data['token']) {
  //         that.tiledeskToken = data['token'];
  //         that.createCompleteUser(data['user']);
  //         this.checkAndSetInStorageTiledeskToken(that.tiledeskToken)
  //         this.BS_IsONLINE.next(true)
  //         resolve(data)
  //       }
  //     }, (error) => {
  //       reject(error)
  //     });
  //   });
  // }




}
