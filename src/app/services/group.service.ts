import { Injectable, group } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Group } from '../models/group-model';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/auth.service';
import { Observable } from 'rxjs/Observable';
import { AppConfigService } from '../services/app-config.service';

@Injectable()
export class GroupService {
  http: Http;

  // BASE_URL = environment.mongoDbConfig.BASE_URL; // replaced with SERVER_BASE_PATH
  // SERVER_BASE_PATH = environment.SERVER_BASE_URL; // now get from appconfig
  // MONGODB_BASE_URL: any; // replaced with GROUPS_URL

  SERVER_BASE_PATH: string;
  GROUPS_URL: string;

  TOKEN: string;

  project_id: any;
  user: any;

  constructor(
    http: Http,
    private auth: AuthService,
    public appConfigService: AppConfigService
  ) {
    console.log('HELLO GROUP SERVICE! ')
    this.http = http;

    // SUBSCRIBE TO USER BS
    this.user = auth.user_bs.value
    this.checkUser()

    this.auth.user_bs.subscribe((user) => {
      // // tslint:disable-next-line:no-debugger
      // debugger
      this.user = user;
      this.checkUser()
    });

    this.getAppConfig();
    this.getCurrentProject();
  }

  getAppConfig() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    console.log('AppConfigService getAppConfig (GROUP SERV.) SERVER_BASE_PATH ', this.SERVER_BASE_PATH);
  }

  getCurrentProject() {
    console.log('GROUP-SERV - SUBSCRIBE TO CURRENT PROJ ')

    this.auth.project_bs.subscribe((project) => {


      if (project) {
        this.project_id = project._id;
        console.log('00 -> GROUP-SERV project ID from AUTH service subscription  ', this.project_id);
        this.GROUPS_URL = this.SERVER_BASE_PATH + this.project_id + '/groups/';
        console.log('AppConfigService getAppConfig (GROUP SERV.) GROUPS_URL (built with SERVER_BASE_PATH) ', this.GROUPS_URL);
      }
    });
  }

  checkUser() {
    if (this.user) {
      this.TOKEN = this.user.token
      // this.getToken();
      console.log('GROUP-SERV user is signed in');
    } else {
      console.log('GROUP-SERV No user is signed in');
    }
  }

  /*
   * ============ GET ALL GROUPS OF THE CURRENT PROJECT ============
   * NOTE: chat21-api-node.js READ THE CURRENT PROJECT ID FROM THE URL SO IT SO NO
   * LONGER NECESSARY TO PASS THE PROJECT ID AS PARAMETER
   */
  public getGroupsByProjectId(): Observable<Group[]> {
    const url = this.GROUPS_URL;
    console.log('GET GROUP BY PROJECT ID URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  /**
   * CREATE (POST)
   * @param name
   */
  public createGroup(name: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    // , 'id_project': this.project_id
    const body = { 'name': name };

    console.log('POST REQUEST BODY ', body);

    const url = this.GROUPS_URL;
    // let url = `http://localhost:3000/${project_id}/faq_kb/`;

    return this.http
      .post(url, JSON.stringify(body), options)
      .map((res) => res.json());

  }

  // UPDATE GROUP MEMBERS
  public updateGroup(id_group: string, users_selected_array: any) {
    console.log('ARRAY OF USERS SELECTED FOR THE GROUP', users_selected_array);
    const url = this.GROUPS_URL + id_group;

    console.log('GROUPS UPDATE - PUT URL ', url);


    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'members': users_selected_array };

    console.log('PUT REQUEST BODY ', body);

    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());

  }

  // UPDATE GROUP NAME
  public updateGroupName(id_group: string, group_name: string) {
    console.log('NEW GROUP NAME', group_name);
    const url = this.GROUPS_URL + id_group;

    console.log('GROUPS UPDATE - PUT URL ', url);


    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'name': group_name };

    console.log('PUT REQUEST BODY ', body);

    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }

  // UPDATE THE GROUP WITH TRASHED = TRUE
  public setTrashedToTheGroup(id_group: string) {

    const url = this.GROUPS_URL + id_group;

    console.log('GROUPS UPDATE - PUT URL ', url);


    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'trashed': true };

    console.log('PUT REQUEST BODY ', body);

    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }

/**
 * READ DETAIL (GET BY ID)
 */
  public getGroupById(id_group: string): Observable<Group[]> {
    const url = this.GROUPS_URL + id_group;
    // url += `${id}`;
    console.log('GET GROUP BY ID URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }




}
