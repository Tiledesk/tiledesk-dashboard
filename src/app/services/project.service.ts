// tslint:disable:max-line-length
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Project } from '../models/project-model';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/auth.service';

@Injectable()
export class ProjectService {

  http: Http;
  PROJECT_BASE_URL = environment.mongoDbConfig.PROJECTS_BASE_URL;
  PROJECT_USER_BASE_URL = environment.mongoDbConfig.PROJECT_USER_BASE_URL;
  // TOKEN = environment.mongoDbConfig.TOKEN;

  TOKEN: string;

  user: any;
  currentUserID: string;

  constructor(
    http: Http,
    public auth: AuthService
  ) {
    this.http = http;

    this.user = auth.user_bs.value
    this.checkUser()

    this.auth.user_bs.subscribe((user) => {
      this.user = user;
      this.checkUser()
    });

  }

  checkUser() {
    if (this.user) {
      // this.currentUserFireBaseUID = this.user.uid
      this.currentUserID = this.user._id
      this.TOKEN = this.user.token
      console.log('USER UID GET IN PROJECT SERV ', this.currentUserID);
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
  public getMongDbProjectById(id: string): Observable<Project[]> {
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
   * CREATE (POST)
   * @param name
   */
  public addMongoDbProject(name: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'name': `${name}` };

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
  public createUserProject(id_project: string) {

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'id_project': `${id_project}`, 'id_user': this.currentUserID, 'role': 'admin'};

    console.log('ADD PROJECT POST REQUEST BODY ', body);

    const url = this.PROJECT_USER_BASE_URL;

    return this.http
      .post(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }







  /**
   * UPDATE (PUT)
   * @param id
   * @param name
   */
  public updateMongoDbProject(id: string, name: string) {

  let url = this.PROJECT_BASE_URL;
  url = url += `${id}`;
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




}
