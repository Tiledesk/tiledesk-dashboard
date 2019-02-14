// tslint:disable:max-line-length
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Project } from '../models/project-model';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/auth.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class ProjectService {

  http: Http;
  PROJECT_BASE_URL = environment.mongoDbConfig.PROJECTS_BASE_URL;
  BASE_URL = environment.mongoDbConfig.BASE_URL;
  UPDATE_OPERATING_HOURS_URL: any;
  // PROJECT_USER_BASE_URL = environment.mongoDbConfig.PROJECT_USER_BASE_URL;
  // TOKEN = environment.mongoDbConfig.TOKEN;

  TOKEN: string;

  user: any;
  currentUserID: string;
  projectID: string;

  constructor(
    http: Http,
    public auth: AuthService,
    public http_client: HttpClient,
  ) {
    console.log('HELLO PROJECT SERVICE !!!!')

    this.http = http;

    this.user = auth.user_bs.value
    this.checkUser()

    this.auth.user_bs.subscribe((user) => {
      this.user = user;
      this.checkUser()
    });

    this.getCurrentProject();

  }

  getCurrentProject() {
    console.log('============ PROJECT SERVICE - SUBSCRIBE TO CURRENT PROJ ============');
    // tslint:disable-next-line:no-debugger
    // debugger
    this.auth.project_bs.subscribe((project) => {

      if (project) {

        this.projectID = project._id;
        console.log('-- -- >>>> 00 -> PROJECT SERVICE project ID from AUTH service subscription ', this.projectID);
        this.UPDATE_OPERATING_HOURS_URL = this.PROJECT_BASE_URL + this.projectID;

        // PROJECT-USER BY PROJECT ID AND CURRENT USER ID
        // this.PROJECT_USER_URL = this.BASE_URL + this.project._id + '/project_users/'
      }
    });
  }

  checkUser() {
    if (this.user) {
      // this.currentUserFireBaseUID = this.user.uid
      this.currentUserID = this.user._id
      this.TOKEN = this.user.token
      console.log('!!! USER UID GET IN PROJECT SERV ', this.currentUserID);
      // this.getToken();
    } else {
      console.log('No user is signed in');
    }
  }

  /** ********************************************** HTTP VERSION *********************************************** */
  /* READ (GET ALL PROJECTS) */
  public getProjects(): Observable<Project[]> {
    const url = this.PROJECT_BASE_URL;
    console.log('MONGO DB PROJECTS URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  /** ******************************************** HTTP CLIENT VERSION ******************************************** */
  /* READ (GET ALL PROJECTS) */
  // public getProjects(): Observable<Project[]> {
  //   const url = this.PROJECT_BASE_URL;
  //   console.log('MONGO DB PROJECTS URL', url);
  //   const headers = new HttpHeaders({ 'Content-Type': 'application/json' }).set('Authorization', this.TOKEN)
  //   return this.http_client
  //     .get<Project[]>(url, { headers })
  // }

  /**
   * DELETE (DELETE)
   * @param id
   */
  public deleteMongoDbProject(id: string) {

    let url = this.PROJECT_BASE_URL;
    url += `${id}# chat21-api-nodejs`;
    console.log('DELETE URL ', url);

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });
    return this.http
      .delete(url, options)
      .map((res) => res.json());

  }

  /**
   * READ DETAIL (GET PROJECT BY PROJECT ID)
   * @param id
   */
  public getProjectById(id: string): Observable<Project[]> {
    let url = this.PROJECT_BASE_URL;
    url += `${id}`;
    console.log('!!! GET PROJECT BY ID URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  /**
   * CREATE (POST) THE PROJECT AND AT THE SAME TIME CREATE THE PROJECT-USER IN THE RELATIONAL TABLE
   * @param name
   * @param id_user
   */
  public addMongoDbProject(name: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    // , 'id_user': this.currentUserID
    const body = { 'name': name };

    console.log('ADD PROJECT POST REQUEST BODY ', body);

    const url = this.PROJECT_BASE_URL;

    return this.http
      .post(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }

  /**
   * CREATE USER-PROJECT RELATION
   * @param id_project
   */
  // public createUserProject(id_project: string) {

  //   const headers = new Headers();
  //   headers.append('Accept', 'application/json');
  //   headers.append('Content-type', 'application/json');
  //   headers.append('Authorization', this.TOKEN);
  //   const options = new RequestOptions({ headers });

  //   const body = { 'id_project': `${id_project}`, 'id_user': this.currentUserID, 'role': 'admin'};

  //   console.log('ADD PROJECT POST REQUEST BODY ', body);

  //   const url = this.PROJECT_USER_BASE_URL;

  //   return this.http
  //     .post(url, JSON.stringify(body), options)
  //     .map((res) => res.json());
  // }

  /**
   * UPDATE (PUT)
   * @param id
   * @param name
   */
  public updateMongoDbProject(id: string, name: string) {

    let url = this.PROJECT_BASE_URL;
    url += id;
    console.log('PUT URL ', url);

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'name': `${name}` };

    console.log('PUT REQUEST BODY ', body);

    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());

  }

  /// ================ UPDATE WIDGET PROJECT ====================== ///
  public updateWidgetProject(widget_settings: any) {

    let url = this.PROJECT_BASE_URL;
    url += this.projectID;
    console.log('UPDATE WIDGET PROJECT - URL ', url);

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'widget': widget_settings };

    console.log('UPDATE WIDGET PROJECT - BODY ', body);

    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }

 /// ================ UPDATE GETTING STARTED ====================== ///
 public updateGettingStartedProject(getting_started: any) {

  let url = this.PROJECT_BASE_URL;
  url += this.projectID;
  console.log('UPDATE GETTING-STARTED - URL ', url);

  const headers = new Headers();
  headers.append('Accept', 'application/json');
  headers.append('Content-type', 'application/json');
  headers.append('Authorization', this.TOKEN);
  const options = new RequestOptions({ headers });

  const body = { 'gettingStarted': getting_started };

  console.log('UPDATE GETTING-STARTED - BODY ', body);

  return this.http
    .put(url, JSON.stringify(body), options)
    .map((res) => res.json());
}


  /// ================ UPDATE PROJECT SETTINGS > AUTO SEND TRANSCRIPT TO REQUESTER ====================== ///
  public updateAutoSendTranscriptToRequester(autosend: boolean) {

    let url = this.PROJECT_BASE_URL;
    url += this.projectID;
    console.log('UPDATE WIDGET PROJECT - URL ', url);

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    // const body = { 'settings': { 'email': { 'autoSendTranscriptToRequester': autosend } } };
    // settings.email.autoSendTranscriptToRequester":true

    const body = { 'settings.email.autoSendTranscriptToRequester': autosend }

    console.log('UPDATE WIDGET PROJECT - BODY ', body);

    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }

  /// ================ GENERATE SHARED SECRET ====================== ///
  // https://api.tiledesk.com/v1/PROJECTID/keys/generate
  public generateSharedSecret() {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');

    headers.append('Authorization', this.TOKEN);
    const url = this.BASE_URL + this.projectID + '/keys/generate';

    /** ********* FOR TEST  ********* **/
    // headers.append('Authorization', 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnsiZW1haWwiOjEsImZpcnN0bmFtZSI6MSwibGFzdG5hbWUiOjEsInBhc3N3b3JkIjoxLCJlbWFpbHZlcmlmaWVkIjoxLCJpZCI6MX0sImdldHRlcnMiOnt9LCJfaWQiOiI1YWM3NTIxNzg3ZjZiNTAwMTRlMGI1OTIiLCJ3YXNQb3B1bGF0ZWQiOmZhbHNlLCJhY3RpdmVQYXRocyI6eyJwYXRocyI6eyJwYXNzd29yZCI6ImluaXQiLCJlbWFpbCI6ImluaXQiLCJlbWFpbHZlcmlmaWVkIjoiaW5pdCIsImxhc3RuYW1lIjoiaW5pdCIsImZpcnN0bmFtZSI6ImluaXQiLCJfaWQiOiJpbml0In0sInN0YXRlcyI6eyJpZ25vcmUiOnt9LCJkZWZhdWx0Ijp7fSwiaW5pdCI6eyJlbWFpbHZlcmlmaWVkIjp0cnVlLCJsYXN0bmFtZSI6dHJ1ZSwiZmlyc3RuYW1lIjp0cnVlLCJwYXNzd29yZCI6dHJ1ZSwiZW1haWwiOnRydWUsIl9pZCI6dHJ1ZX0sIm1vZGlmeSI6e30sInJlcXVpcmUiOnt9fSwic3RhdGVOYW1lcyI6WyJyZXF1aXJlIiwibW9kaWZ5IiwiaW5pdCIsImRlZmF1bHQiLCJpZ25vcmUiXX0sInBhdGhzVG9TY29wZXMiOnt9LCJlbWl0dGVyIjp7ImRvbWFpbiI6bnVsbCwiX2V2ZW50cyI6e30sIl9ldmVudHNDb3VudCI6MCwiX21heExpc3RlbmVycyI6MH0sIiRvcHRpb25zIjp0cnVlfSwiaXNOZXciOmZhbHNlLCJfZG9jIjp7ImVtYWlsdmVyaWZpZWQiOnRydWUsImxhc3RuYW1lIjoiTGFuemlsb3R0byIsImZpcnN0bmFtZSI6Ik5pY29sYSIsInBhc3N3b3JkIjoiJDJhJDEwJDEzZlROSnA3OUx5RVYvdzh6NXRrbmVrc3pYRUtuaWFxZm83TnR2aTZpSHdaQ2ZLRUZKd1kuIiwiZW1haWwiOiJuaWNvbGEubGFuemlsb3R0b0Bmcm9udGllcmUyMS5pdCIsIl9pZCI6IjVhYzc1MjE3ODdmNmI1MDAxNGUwYjU5MiJ9LCIkaW5pdCI6dHJ1ZSwiaWF0IjoxNTQwODE5MTUzfQ.af5nAtSYVmmWzmdgGummY6fQnt2dFTR0lCnrfP0vr6I');
    // const url = 'https://api.tiledesk.com/v1/5b55e806c93dde00143163dd/keys/generate'

    console.log('GENERATE SHARED SECRET URL ', url);
    const body = {};
    const options = new RequestOptions({ headers });
    return this.http
      .post(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }

  /// ================ UPDATE OPERATING HOURS ====================== ///
  public updateProjectOperatingHours(_activeOperatingHours: boolean, _operatingHours: any): Observable<Project[]> {

    const url = this.UPDATE_OPERATING_HOURS_URL;
    console.log('»»»» »»»» UPDATE PROJECT OPERATING HOURS ', url);
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);

    const options = new RequestOptions({ headers });

    const body = { 'activeOperatingHours': _activeOperatingHours, 'operatingHours': _operatingHours };

    console.log('UPDATE PROJECT OPERATING HOURS PUT REQUEST BODY ', body);


    return this.http
      .put(url, JSON.stringify(body), options)
      .map((response) => response.json());
  }
  /// UPDATE TIMETABLE AND GET AVAILABLE PROJECT USER


}
