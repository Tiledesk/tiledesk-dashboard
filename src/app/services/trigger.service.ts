import { DepartmentService } from './department.service';
import { Trigger } from './../models/trigger-model';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from '../services/app-config.service';
import { LoggerService } from '../services/logger/logger.service';

@Injectable()
export class TriggerService {

  SERVER_BASE_PATH: string;
  projectID: string;
  user: any;
  TOKEN: string;

  constructor(
    private _httpClient: HttpClient,
    public auth: AuthService,
    public departmentService: DepartmentService,
    public appConfigService: AppConfigService,
    private logger: LoggerService
  ) {

    this.user = auth.user_bs.value
    this.getToken()

    this.auth.user_bs.subscribe((user) => {
      this.user = user;
      this.getToken()
    });

    this.getAppConfigAndBuildUrl();
    this.getCurrentProject()
  }

  getAppConfigAndBuildUrl() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    // this.logger.log('[TRIGGER-SERV] - SERVER BASE PATH ', this.SERVER_BASE_PATH);
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      // this.logger.log('[TRIGGER-SERV] - GET CURRENT PROJECT - project', project)
      if (project) {
        this.projectID = project._id;
        this.logger.log('[TRIGGER-SERV] GET CURRENT PROJECT - ID PROJECT ', this.projectID);
      }
    });
  }


  getToken() {
    if (this.user) {
      this.TOKEN = this.user.token

      // this.logger.log('[TRIGGER-SERV] user is signed in');
    } else {
      this.logger.log('[TRIGGER-SERV] No user is signed in');
    }
  }


  // --------------------------------------------------------------
  // @ GET ALL TRIGGERS
  // --------------------------------------------------------------
  getAllTrigger(): Observable<[any]> {

    const url = this.SERVER_BASE_PATH + this.projectID + '/modules/triggers'
    this.logger.log('[TRIGGER-SERV] - GET ALL TRIGGERS - URL ', url);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN,
    });

    return this._httpClient
      .get<[any]>(url, { headers: headers })
  }

  /**
   * GET TRIGGER BY ID
   * @param triggerId 
   * @returns 
   */
  getTriggerById(triggerId: string): Observable<[Trigger]> {

    const url = this.SERVER_BASE_PATH + this.projectID + '/modules/triggers/' + triggerId
    this.logger.log('[TRIGGER-SERV] - GET TRIGGER BY ID - URL ', url);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN,
    });

    return this._httpClient.get<[Trigger]>(url, { headers: headers })


  }

  /**
   * CREATE TRIGGER
   * @param trigger 
   * @returns 
   */
  postTrigger(trigger: Trigger): Observable<[any]> {
    const url = this.SERVER_BASE_PATH + this.projectID + '/modules/triggers';
    this.logger.log('[TRIGGER-SERV] - POST TRIGGER - URL ', url);

    const body = trigger;
    this.logger.log('[TRIGGER-SERV] - POST TRIGGER - BODY ', body);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN,
    });

    return this._httpClient
      .post<[any]>(url, JSON.stringify(body), { headers: headers });

  }

  /**
   * UPDATE TRIGGER
   * @param trigger 
   * @returns 
   */
  updateTrigger(trigger: Trigger): Observable<[any]> {
    const url = this.SERVER_BASE_PATH + this.projectID + '/modules/triggers/' + trigger._id
    this.logger.log('[TRIGGER-SERV] - UPDATE TRIGGER - PUT URL ', url);

    const body = trigger
    this.logger.log('[TRIGGER-SERV] - UPDATE TRIGGER - BODY ', body);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN,
    });

    return this._httpClient
      .put<[any]>(url, JSON.stringify(body), { headers: headers });

  }


  /**
   * DELETE TRIGGER
   * @param triggerID 
   * @returns 
   */
  deleteTrigger(triggerID: string): Observable<[any]> {
    const url = this.SERVER_BASE_PATH + this.projectID + '/modules/triggers/' + triggerID
    this.logger.log('[TRIGGER-SERV] - DELETE TRIGGER - DELETE URL ', url);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN,
    });

    return this._httpClient
      .delete<[any]>(url, { headers: headers });
  }

  /**
   * RESET PRE BUILT TRIGGER TO DEFAULT
   * @param triggercode 
   * @returns 
   */
  resetPreBuiltTriggerToDefault(triggercode: any): Observable<[any]> {
    const url = this.SERVER_BASE_PATH + this.projectID + '/modules/triggers/' + triggercode + '/reset'
    this.logger.log('[TRIGGER-SERV] - RESET PRE BUILT TRIGGER TO DEFAULT - PUT URL: ', url)

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN,
    });

    return this._httpClient
      .put<[any]>(url, null, { headers: headers });
  }

}
