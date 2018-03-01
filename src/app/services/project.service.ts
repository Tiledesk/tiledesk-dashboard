// tslint:disable:max-line-length
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Project } from '../models/project-model';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { environment } from '../../environments/environment';

@Injectable()
export class ProjectService {

  http: Http;
  MONGODB_BASE_URL = environment.mongoDbConfig.MONGODB_PROJECTS_BASE_URL;
  TOKEN = environment.mongoDbConfig.TOKEN;

  constructor(
    http: Http,
  ) {
    this.http = http;
  }

  /**
   * READ (GET)
   */
  public getMongDbProjects(): Observable<Project[]> {
    const url = this.MONGODB_BASE_URL;
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

    let url = this.MONGODB_BASE_URL;
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
    let url = this.MONGODB_BASE_URL;
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

    const url = this.MONGODB_BASE_URL;

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

    let url = this.MONGODB_BASE_URL;
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
