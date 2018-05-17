import { Injectable, group } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Group } from '../models/group-model';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/auth.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class GroupService {
  http: Http;

  BASE_URL = environment.mongoDbConfig.BASE_URL;
  MONGODB_BASE_URL: any;

  TOKEN: string;

  project_id: any;
  user: any;

  constructor(
    http: Http,
    private auth: AuthService
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

    this.getCurrentProject();
  }

  getCurrentProject() {
    console.log('GROUP-SERV - SUBSCRIBE TO CURRENT PROJ ')

    this.auth.project_bs.subscribe((project) => {


      if (project) {
        this.project_id = project._id;
        console.log('00 -> GROUP-SERV project ID from AUTH service subscription  ', this.project_id)
        this.MONGODB_BASE_URL = this.BASE_URL + this.project_id + '/groups/'
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
    const url = this.MONGODB_BASE_URL;
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

    const url = this.MONGODB_BASE_URL;
    // let url = `http://localhost:3000/${project_id}/faq_kb/`;

    return this.http
      .post(url, JSON.stringify(body), options)
      .map((res) => res.json());

  }

  // UPDATE GROUP
  public updateGroup(id_group, users_selected_array) {
    console.log('ARRAY OF USERS SELECTED FOR THE GROUP', users_selected_array);
    const url = this.MONGODB_BASE_URL + id_group;

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





}
