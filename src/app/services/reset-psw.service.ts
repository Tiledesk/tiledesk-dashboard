import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user-model';
import { AppConfigService } from '../services/app-config.service';
import { LoggerService } from '../services/logger/logger.service';

@Injectable()
export class ResetPswService {

  SERVER_BASE_PATH: string;
  REQUEST_RESET_PSW_URL: string;
  RESET_PSW_BASE_URL: string;
  CHECK_PSW_RESET_KEY_BASE_URL: string;

  constructor(
    public appConfigService: AppConfigService,
    private logger: LoggerService,
    public _httpclient: HttpClient
  ) {
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
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      })
    };

    const url = this.REQUEST_RESET_PSW_URL;
    this.logger.log('[RESET-PSW.SERV] - SEND RESET PSW EMAIL AND UPDATE USER WITH RESET PSW REQUEST ID - PUT URL ', url)

    const body = { 'email': user_email };
    this.logger.log('[RESET-PSW.SERV] - SEND RESET PSW EMAIL AND UPDATE USER WITH RESET PSW REQUEST ID - PUT BODY ', body)
   
    return this._httpclient
      .put<User[]>(url, JSON.stringify(body), httpOptions)
  }

  /**
   * GET USER BY RESET PSW REQUEST ID AND RESET PSW
   * @param reset_psw_request_id 
   * @param newpsw 
   * @returns 
   */
  getUserByResetPswRequestIdAndResetPsw(reset_psw_request_id: string, newpsw: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      })
    };

    const url = this.RESET_PSW_BASE_URL + reset_psw_request_id;
    this.logger.log('[RESET-PSW.SERV] - GET USER BY RESET PSW REQUEST ID AND RESET PSW - PUT URL ', url)

    const body = { 'password': newpsw };
    this.logger.log('[RESET-PSW.SERV] - GET USER BY RESET PSW REQUEST ID AND RESET PSW - PUT BODY ', body)
    return this._httpclient
      .put(url, JSON.stringify(body), httpOptions)
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
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      })
    };

    const url = this.CHECK_PSW_RESET_KEY_BASE_URL + reset_psw_request_id;
    this.logger.log('[RESET-PSW.SERV] - GET USER BY PSW REQUEST ID ', url)
    return this._httpclient
      .get(url, httpOptions)
  }

}
