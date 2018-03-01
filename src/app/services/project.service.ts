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




}
