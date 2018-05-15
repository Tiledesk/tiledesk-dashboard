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

  project: any;
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
      this.project = project

      if (this.project) {
        console.log('00 -> GROUP-SERV project ID from AUTH service subscription  ', this.project._id)
        this.MONGODB_BASE_URL = this.BASE_URL + this.project._id + '/groups/'
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




}
