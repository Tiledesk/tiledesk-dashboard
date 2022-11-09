import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../core/auth.service';
import { AppConfigService } from '../services/app-config.service';
import { LoggerService } from '../services/logger/logger.service';
@Injectable()
export class CannedResponsesService {

  projectId: string;
  TOKEN: any;
  SERVER_BASE_PATH: string;

  constructor(
    private httpClient: HttpClient,
    public auth: AuthService,
    public appConfigService: AppConfigService,
    private logger: LoggerService
  ) {
    this.getAppConfig();
    this.getCurrentProject();
    this.getToken()
  }

  getAppConfig() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    this.logger.log('[CANNED-RES.SERV] getAppConfig SERVER_BASE_PATH', this.SERVER_BASE_PATH);
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      // this.logger.log('[CANNED-RES.SERV] SUBSCRIBE TO THE PROJECT PUBLISHED BY AUTH SERVICE ', project)

      if (project) {
        this.projectId = project._id
      }
    })
  }

  getToken() {
    this.auth.user_bs.subscribe((user) => {
      if (user) {
        this.TOKEN = user.token
      }
    });
  }

  // -------------------------------------------------------------------------------------
  // @ Read - Get canned responses
  // -------------------------------------------------------------------------------------
  public getCannedResponses(): Observable<[any]> {
    // https://tiledesk-server-pre.herokuapp.com/5e20a68e7c2e640017f2f40f/canned/  // example
    const url = this.SERVER_BASE_PATH + this.projectId + '/canned/'
    this.logger.log('[CANNED-RES.SERV] - GET CANNED-RES URL', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    return this.httpClient
      .get<[any]>(url, httpOptions)
  }

  // -------------------------------------------------------------------------------------
  // @ Read - Get canned response by id
  // -------------------------------------------------------------------------------------
  public getCannedResponseById(cannedResponseId: string): Observable<[any]> {
    const url = this.SERVER_BASE_PATH + this.projectId + '/canned/' + cannedResponseId
    this.logger.log('[CANNED-RES.SERV] - GET CANNED-RES URL', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    return this.httpClient
      .get<[any]>(url, httpOptions)
  }


  // -------------------------------------------------------------------------------------
  // @ Create - Save (POST) new canned response
  // -------------------------------------------------------------------------------------
  public createCannedResponse(message: string, title?: string) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.SERVER_BASE_PATH + this.projectId + '/canned/'

    const body = { 'text': message, 'title': title };

    this.logger.log('[CANNED-RES.SERV] CREATE CANNED-RES BODY ', body);
    this.logger.log('[CANNED-RES.SERV] - CREATE CANNED-RES URL', url);
    this.logger.log('[CANNED-RES.SERV] - CREATE CANNED-RES TOKEN', this.TOKEN);
    return this.httpClient
      .post(url, JSON.stringify(body), httpOptions)
  }

  // -------------------------------------------------------------------------------------
  // @ Update - update (PUT) canned response
  // -------------------------------------------------------------------------------------
  public updateCannedResponse(message: string, cannedresid: string, title?: string) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const body = { 'text': message, 'title': title };

    const url = this.SERVER_BASE_PATH + this.projectId + '/canned/' + cannedresid;

    this.logger.log('[CANNED-RES.SERV] UPDATE CANNED-RES URL ', url);
    this.logger.log('[CANNED-RES.SERV] UPDATE CANNED-RES REQUEST BODY ', body);
    return this.httpClient
      .put(url, JSON.stringify(body), httpOptions)
  }

  // -------------------------------------------------------------------------------------
  // @ Delete - delete (DELETE) canned response
  // -------------------------------------------------------------------------------------
  public deleteCannedResponse(cannedresid: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.SERVER_BASE_PATH + this.projectId + '/canned/' + cannedresid;
    this.logger.log('[CANNED-RES.SERV] DELETE CANNED-RES URL ', url);

    return this.httpClient
      .delete(url, httpOptions)
  }

}
