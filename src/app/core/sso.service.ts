import { Injectable } from '@angular/core';
import { AppConfigService } from '../services/app-config.service';
import { LoggerService } from '../services/logger/logger.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class SsoService {


  CREATE_CUSTOM_TOKEN_URL: string;
  SERVER_BASE_PATH: string;
  GET_CURRENT_AUTHENTICATED_USER: string;

  constructor(
    public appConfigService: AppConfigService,
    private logger: LoggerService,
    public _httpclient: HttpClient
  ) {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    this.CREATE_CUSTOM_TOKEN_URL = this.SERVER_BASE_PATH + 'chat21/firebase/auth/createCustomToken';
    this.GET_CURRENT_AUTHENTICATED_USER = this.SERVER_BASE_PATH + 'users'

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



}
