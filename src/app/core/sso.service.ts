import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { AppConfigService } from '../services/app-config.service';
import { LoggerService } from '../services/logger/logger.service';

@Injectable()
export class SsoService {

  http: Http;
  CREATE_CUSTOM_TOKEN_URL: string;
  SERVER_BASE_PATH: string;
  GET_CURRENT_AUTHENTICATED_USER: string;

  constructor(
    http: Http,
    public appConfigService: AppConfigService,
    private logger: LoggerService
  ) {
    this.http = http;
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    this.CREATE_CUSTOM_TOKEN_URL = this.SERVER_BASE_PATH + 'chat21/firebase/auth/createCustomToken';
    this.GET_CURRENT_AUTHENTICATED_USER = this.SERVER_BASE_PATH + 'users'

  }


  chat21CreateFirebaseCustomToken(JWT_token: any) {
    this.logger.log('[SSO-SERV] - chat21CreateFirebaseCustomToken JWT_token ', JWT_token)
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', JWT_token);
    const options = new RequestOptions({ headers });

    const url = this.CREATE_CUSTOM_TOKEN_URL;

    this.logger.log('[SSO-SERV] - chat21CreateFirebaseCustomToken ', url)

    return this.http
      .post(url, null, options)
      .map((res) => {
  
        this.logger.log('[SSO-SERV] - chat21CreateFirebaseCustomToken RES: ', res)
       
        return res.text()
      });
  }

  getCurrentAuthenticatedUser(JWT_token) {
    this.logger.log('[SSO-SERV] - getCurrentAuthenticatedUser JWT_token ', JWT_token)
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', JWT_token);

    const url = this.GET_CURRENT_AUTHENTICATED_USER;

    this.logger.log('[SSO-SERV] - getCurrentAuthenticatedUser ', url)

    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  };



}
