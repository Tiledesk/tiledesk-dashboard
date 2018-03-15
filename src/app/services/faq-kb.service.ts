import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { FaqKb } from '../models/faq_kb-model';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { environment } from '../../environments/environment';


@Injectable()
export class FaqKbService {

  http: Http;
  MONGODB_BASE_URL = environment.mongoDbConfig.FAQKB_BASE_URL;
  TOKEN = environment.mongoDbConfig.TOKEN;

  constructor(
    http: Http,
  ) {
    this.http = http;
  }

  /**
   * READ (GET)
   */
  public getMongDbFaqKb(): Observable<FaqKb[]> {
    const url = this.MONGODB_BASE_URL;
    console.log('MONGO DB FAQ-KB URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }
  /**
   * READ DETAIL (GET BY ID)
   */
  public getMongDbFaqKbById(id: string): Observable<FaqKb[]> {
    let url = this.MONGODB_BASE_URL;
    url += `${id}`;
    console.log('MONGO DB GET BY ID FAQ-KB URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  /**
   * CREATE (POST)
   * @param fullName
   */
  public addMongoDbFaqKb(name: string, urlfaqkb: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'name': `${name}`, 'url': `${urlfaqkb}` };

    console.log('POST REQUEST BODY ', body);

    const url = this.MONGODB_BASE_URL;

    return this.http
      .post(url, JSON.stringify(body), options)
      .map((res) => res.json());

  }

  /**
   * DELETE (DELETE)
   * @param id
   */
  public deleteMongoDbFaqKb(id: string) {

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
   * UPDATE (PUT)
   * @param id
   * @param fullName
   */
  public updateMongoDbFaqKb(id: string, name: string, urlfaqkb: string) {

    let url = this.MONGODB_BASE_URL;
    url = url += `${id}`;
    console.log('PUT URL ', url);

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'name': `${name}`, 'url': `${urlfaqkb}` };

    console.log('PUT REQUEST BODY ', body);

    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());

  }


}
