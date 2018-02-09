import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Faq } from '../models/faq-model';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class MongodbFaqService {

  http: Http;
  MONGODB_BASE_URL = environment.mongoDbConfig.MONGODB_FAQ_BASE_URL;
  TOKEN =  environment.mongoDbConfig.TOKEN;

  constructor(
    http: Http,
   ) {

    this.http = http;
  }

  /**
   * READ (GET)
   */
  public getMongDbFaq(): Observable<Faq[]> {
    const url = this.MONGODB_BASE_URL;

    console.log('MONGO DB FAQ URL', url);
    // console.log('MONGO DB TOKEN', this.TOKEN);

    console.log('NEW DATE (FOR THE UPDATE) ', new Date().getTime());

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
  public getMongDbFaqById(id: string): Observable<Faq[]> {
    let url = this.MONGODB_BASE_URL;
    url += `${id}`;
    console.log('MONGO DB GET BY ID FAQ URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  /**
   * CREATE (POST)
   * @param question
   */
  public addMongoDbFaq(question: string, answer: string, id_faq_kb: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'question': `${question}`, 'answer': `${answer}`, 'id_faq_kb': `${id_faq_kb}` };

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
  public deleteMongoDbFaq(id: string) {

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
   * @param question
   * @param answer
   */
  public updateMongoDbFaq(id: string, question: string, answer: string) {
    console.log('ID IN FAQ SERVICE ', id);
    let url = this.MONGODB_BASE_URL;
    url = url += `${id}`;
    console.log('PUT URL ', url);


    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'question': `${question}`, 'answer': `${answer}`};

    console.log('PUT REQUEST BODY ', body);

    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());

  }

}
