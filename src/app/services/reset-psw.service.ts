import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { User } from '../models/user-model';
import { AppConfigService } from '../services/app-config.service';
import { LoggerService } from '../services/logger/logger.service';
@Injectable()
export class ResetPswService {
  http: Http;

  // REQUEST_RESET_PSW_URL = environment.mongoDbConfig.REQUEST_RESET_PSW; // moved
  // RESET_PSW_BASE_URL =  environment.mongoDbConfig.RESET_PSW; // moved
  // CHECK_PSW_RESET_KEY_BASE_URL = environment.mongoDbConfig.CHECK_PSW_RESET_KEY; // moved


  // SERVER_BASE_PATH = environment.SERVER_BASE_URL;  // now get from appconfig
  // REQUEST_RESET_PSW_URL = this.SERVER_BASE_PATH + 'auth/requestresetpsw'; // now built after get SERVER_BASE_PATH
  // RESET_PSW_BASE_URL =  this.SERVER_BASE_PATH + 'auth/resetpsw/'; // now built after get SERVER_BASE_PATH
  // CHECK_PSW_RESET_KEY_BASE_URL = this.SERVER_BASE_PATH + 'auth/checkpswresetkey/'; // now built after get SERVER_BASE_PATH

  SERVER_BASE_PATH: string;
  REQUEST_RESET_PSW_URL: string;
  RESET_PSW_BASE_URL: string;
  CHECK_PSW_RESET_KEY_BASE_URL: string;

  constructor(
    http: Http,
    public appConfigService: AppConfigService,
    private logger: LoggerService
  ) {
    this.http = http;
    this.getAppConfigAndBuildUrls();
  }

  getAppConfigAndBuildUrls() {

    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    this.logger.log('[RESET-PSW.SERV] - SERVER_BASE_PATH ', this.SERVER_BASE_PATH);


    this.REQUEST_RESET_PSW_URL = this.SERVER_BASE_PATH + 'auth/requestresetpsw';
    this.RESET_PSW_BASE_URL = this.SERVER_BASE_PATH + 'auth/resetpsw/';
    this.CHECK_PSW_RESET_KEY_BASE_URL = this.SERVER_BASE_PATH + 'auth/checkpswresetkey/';
    this.logger.log('[RESET-PSW.SERV] - REQUEST_RESET_PSW_URL ', this.REQUEST_RESET_PSW_URL);
    this.logger.log('[RESET-PSW.SERV] - RESET_PSW_BASE_URL ', this.RESET_PSW_BASE_URL);
    this.logger.log('[RESET-PSW.SERV] - CHECK_PSW_RESET_KEY_BASE_URL ', this.CHECK_PSW_RESET_KEY_BASE_URL);
  }

  /**
   * SEND RESET PSW EMAIL AND UPDATE USER WITH RESET PSW REQUEST ID
   * @param user_email 
   * @returns 
   */
  sendResetPswEmailAndUpdateUserWithResetPswRequestId(user_email: string): Observable<User[]> {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    const options = new RequestOptions({ headers });

    const url = this.REQUEST_RESET_PSW_URL;
    this.logger.log('[RESET-PSW.SERV] - SEND RESET PSW EMAIL AND UPDATE USER WITH RESET PSW REQUEST ID - PUT URL ', url)

    const body = { 'email': user_email };
    this.logger.log('[RESET-PSW.SERV] - SEND RESET PSW EMAIL AND UPDATE USER WITH RESET PSW REQUEST ID - PUT BODY ', body)
    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }

  /**
   * GET USER BY RESET PSW REQUEST ID AND RESET PSW
   * @param reset_psw_request_id 
   * @param newpsw 
   * @returns 
   */
  getUserByResetPswRequestIdAndResetPsw(reset_psw_request_id: string, newpsw: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    const options = new RequestOptions({ headers });

    const url = this.RESET_PSW_BASE_URL + reset_psw_request_id;
    this.logger.log('[RESET-PSW.SERV] - GET USER BY RESET PSW REQUEST ID AND RESET PSW - PUT URL ', url)

    const body = { 'password': newpsw };
    this.logger.log('[RESET-PSW.SERV] - GET USER BY RESET PSW REQUEST ID AND RESET PSW - PUT BODY ', body)
    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }


  // ------------------------------------------------------------------------------------------------------------------------
  // GETTING THE USER BY THE REQUEST ID - IF THE RESET PSW REQUEST ID NOT EXIST MEANS THAT THE USER HAS ALREADY USED THE LINK
  // THE LINK IS NO MORE VALID AND HAS PRESSED ON THE BUTTON 'RESET PSW'
  // IN FACT resetpswrequestid IS RESET WHEN THE USER  CLICK ON THE BUTTON 'RESET PSW'
  // ------------------------------------------------------------------------------------------------------------------------
  /**
   * GET USER BY PSW REQUEST ID
   * @param reset_psw_request_id 
   * @returns 
   */
  getUserByPswRequestId(reset_psw_request_id: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');

    const url = this.CHECK_PSW_RESET_KEY_BASE_URL + reset_psw_request_id;
    this.logger.log('[RESET-PSW.SERV] - GET USER BY PSW REQUEST ID ', url)
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }


}
