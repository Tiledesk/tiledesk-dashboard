// tslint:disable:max-line-length
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Project } from '../models/project-model';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/auth.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class ProjectService {

  http: Http;
  PROJECT_BASE_URL = environment.mongoDbConfig.PROJECTS_BASE_URL;
  UPDATE_OPERATING_HOURS_URL: any;
  // PROJECT_USER_BASE_URL = environment.mongoDbConfig.PROJECT_USER_BASE_URL;
  // TOKEN = environment.mongoDbConfig.TOKEN;

  TOKEN: string;

  user: any;
  currentUserID: string;
  projectID: string;

  constructor(
    http: Http,
    public auth: AuthService
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
        console.log('-- -- >>>> 00 -> PROJECT SERVICE project ID from AUTH service subscription ')
        this.projectID = project._id;
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

  /**
   * READ (GET)
   */
  public getMongDbProjects(): Observable<Project[]> {
    const url = this.PROJECT_BASE_URL;
    console.log('MONGO DB PROJECTS URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

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
    console.log('MONGO DB GET PROJECT BY PEOJECT ID URL', url);

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
