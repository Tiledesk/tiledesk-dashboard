import { DepartmentService } from './../services/mongodb-department.service';
import { Trigger } from './../models/trigger-model';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from '../services/app-config.service';

@Injectable()
export class TriggerService {


  // BASE_URL = 'https://tiledesk-server-pre.herokuapp.com/'
  // BASE_URL = environment.mongoDbConfig.BASE_URL;  // replaced with SERVER_BASE_PATH
  // SERVER_BASE_PATH = environment.SERVER_BASE_URL; // now get from appconfig
  SERVER_BASE_PATH: string;

  projectID: string;
  user: any;
  TOKEN: string;


  constructor(
    private http: HttpClient,
    public auth: AuthService,
    public departmentService: DepartmentService,
    public appConfigService: AppConfigService
  ) {


    this.user = auth.user_bs.value
    this.checkUser()

    this.auth.user_bs.subscribe((user) => {
      this.user = user;
      this.checkUser()
    });

    this.getAppConfig();
    this.getCurrentProject()
  }

  getAppConfig() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    console.log('AppConfigService getAppConfig (TRIGGER SERV.) SERVER_BASE_PATH ', this.SERVER_BASE_PATH);
  }

  getCurrentProject() {
    console.log('============ PROJECT SERVICE - SUBSCRIBE TO CURRENT PROJ ============');
    // tslint:disable-next-line:no-debugger
    // debugger
    this.auth.project_bs.subscribe((project) => {
      console.log('AnalyticsService  project', project)
      if (project) {

        this.projectID = project._id;
        console.log('AnalyticsService ID PROJECT ', this.projectID);

      }
    });
  }


  checkUser() {
    if (this.user) {
      this.TOKEN = this.user.token
      // this.getToken();
      console.log('AnalyticsService user is signed in');
    } else {
      console.log('AnalyticsService No user is signed in');
    }
  }

  getAllTrigger(): Observable<[]> {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN,
      // 'Authorization': 'Basic ' + btoa('aaa22@aaa22.it:123456')
    });

    // return this.http.get<[]>(this.SERVER_BASE_PATH + this.projectID + '/modules/triggers' ,{ headers:headers})
    return this.http.get<[]>(this.SERVER_BASE_PATH + this.projectID + '/modules/triggers', { headers: headers })

  }

  getTriggerById(triggerId: string): Observable<[Trigger]> {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN,
    });

    return this.http.get<[Trigger]>(this.SERVER_BASE_PATH + this.projectID + '/modules/triggers/' + triggerId, { headers: headers })


  }

  postTrigger(trigger: Trigger): Observable<[]> {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN,
    });

    return this.http.post<[]>(this.SERVER_BASE_PATH + this.projectID + '/modules/triggers', JSON.stringify(trigger), { headers: headers });

  }

  updateTrigger(trigger: Trigger): Observable<[]> {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN,
    });

    return this.http.put<[]>(this.SERVER_BASE_PATH + this.projectID + '/modules/triggers/' + trigger._id, JSON.stringify(trigger), { headers: headers });

  }


  deleteTrigger(triggerID: string): Observable<[]> {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN,
    });

    return this.http.delete<[]>(this.SERVER_BASE_PATH + this.projectID + '/modules/triggers/' + triggerID, { headers: headers });
  }

  resetPreBuiltTriggerToDefault(triggercode: any): Observable<[]> {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN,
    });

    const url = this.SERVER_BASE_PATH + this.projectID + '/modules/triggers/' + triggercode + '/reset'
    console.log('RESET TRIGGER TO DEFAULT URL: ', url)
    return this.http.put<[]>(url, null, { headers: headers });

  }





}
