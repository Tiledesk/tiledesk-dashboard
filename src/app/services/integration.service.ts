import { Injectable } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from './app-config.service';
import { LoggerService } from './logger/logger.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class IntegrationService {

  user: any;
  project_id: any;
  TOKEN: string;
  SERVER_BASE_PATH: string;

  constructor(
    private auth: AuthService,
    public appConfigService: AppConfigService,
    private logger: LoggerService,
    private http: HttpClient
  ) {
    
    // SUBSCRIBE TO USER BS
    this.user = auth.user_bs.value
    this.checkIfExistUserAndGetToken()

    this.auth.user_bs.subscribe((user) => {
      this.user = user;
      this.checkIfExistUserAndGetToken()
    }); 
    this.getCurrentProject();
    this.getAppConfig();
   }

   getAppConfig() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    this.logger.log('AppConfigService getAppConfig (FAQ-KB SERV.) SERVER_BASE_PATH ', this.SERVER_BASE_PATH);
  }

  getCurrentProject() {

    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.project_id = project._id;
      }
    }, (error) => {
      this.logger.error('[INTEGRATION.SERV] - get current project ERROR: ', error);
    }, () => {
      this.logger.debug('[INTEGRATION.SERV] - get current project *COMPLETE*');
    });
  }

  checkIfExistUserAndGetToken() {
    if (this.user) {
      this.TOKEN = this.user.token
      this.logger.log('[INTEGRATION.SERV] user is signed in');
    } else {
      this.logger.log('[INTEGRATION.SERV] No user is signed in');
    }
  }

  getAllIntegrations() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }

    const url = this.SERVER_BASE_PATH + this.project_id + "/integration";
    this.logger.debug('[INTEGRATION.SERV] - get integration URL: ', url);

    return this.http.get(url, httpOptions);
  }

  getIntegrationDetail(integration_id: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }

    const url = this.SERVER_BASE_PATH + this.project_id + "/integration/" + integration_id;
    this.logger.debug('[INTEGRATION.SERV] - get integration URL: ', url);

    return this.http.get(url, httpOptions);
  }

  saveIntegration(integration: any) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }

    const url = this.SERVER_BASE_PATH + this.project_id + "/integration/";
    this.logger.debug('[INTEGRATION.SERV] - save integration URL: ', url);

    return this.http.post(url, integration, httpOptions);
  }

  deleteIntegration(integration_id: string) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }

    const url = this.SERVER_BASE_PATH + this.project_id + "/integration/" + integration_id;
    this.logger.debug('[INTEGRATION.SERV] - save integration URL: ', url);

    return this.http.delete(url, httpOptions);
  }

  checkIntegrationKeyValidity(url: string, key?: string) {
    
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    if (key) {
      headers = headers.append('Authorization', key)
    }

    const httpOptions = {
      headers: headers
    }

    return this.http.get(url, httpOptions);
  }

}
