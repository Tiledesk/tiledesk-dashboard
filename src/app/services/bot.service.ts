// tslint:disable:max-line-length
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Bot } from '../models/bot-model';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { environment } from '../../environments/environment';

@Injectable()
export class BotService {

  http: Http;
  MONGODB_BASE_URL = environment.mongoDbConfig.MONGODB_BOTS_BASE_URL;
  TOKEN = environment.mongoDbConfig.TOKEN;

  constructor(
    http: Http,
  ) {
    this.http = http;
  }

  /**
   * READ (GET)
   */
  public getMongDbBots(): Observable<Bot[]> {
    const url = this.MONGODB_BASE_URL;
    console.log('MONGO DB BOT URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  /**
   *
   */

/**
 * READ DETAIL (GET BOT BY BOT ID)
 * @param id
 */
  public getMongDbBotById(id: string): Observable<Bot[]> {
    let url = this.MONGODB_BASE_URL;
    url += `${id}`;
    console.log('MONGO DB GET BOT BY BOT ID URL', url);

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
  public addMongoDbBots(fullName: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'fullname': `${fullName}` };

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
  public deleteMongoDbBot(id: string) {

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
  public updateMongoDbBot(id: string, fullName: string) {

    let url = this.MONGODB_BASE_URL;
    url = url += `${id}`;
    console.log('PUT URL ', url);

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'fullname': `${fullName}` };

    console.log('PUT REQUEST BODY ', body);

    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());

  }

}
