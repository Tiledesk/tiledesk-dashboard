import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { FaqKb } from '../models/faq_kb-model';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/auth.service';


@Injectable()
export class FaqKbService {

  http: Http;
  MONGODB_BASE_URL = environment.mongoDbConfig.FAQKB_BASE_URL;
  // TOKEN = environment.mongoDbConfig.TOKEN;
  TOKEN: string
  user: any;

  constructor(
    http: Http,
    private auth: AuthService
  ) {
    this.http = http;

    // SUBSCRIBE TO USER BS
    this.user = auth.user_bs.value
    this.checkUser()

    this.auth.user_bs.subscribe((user) => {
      this.user = user;
      this.checkUser()
    });

  }

  checkUser() {
    if (this.user) {
      this.TOKEN = this.user.token
      // this.getToken();
    } else {
      console.log('No user is signed in');
    }
  }

  /**
   * READ (GET)
   * USED IN bot-edit-add.component.ts
   * !!! NO MORE USED
   *     * IN FAQ COMPONENT THE FAQ-KB LIST IS CURRENTLY OBTAINED BY FILTERING
   *     ALL THE FAQ-KB FOR THE ID OF THE CURRENT PROJECT (see BELOW getFaqKbByProjectId)
   *     getMongDbFaqKb() was also used in bot-edit-add.component.ts ma currently THE BOTs ARE NO LONGER USED
   *     (in the view the menu item FAQ (alias faq-kb) have been renamed in BOT)
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
   * READ (GET ALL FAQKB WITH THE CURRENT PROJECT ID)
   */
  public getFaqKbByProjectId(id_project: string): Observable<FaqKb[]> {
    let url = this.MONGODB_BASE_URL;
    url += '?id_project=' + `${id_project}`;

    console.log('GET FAQ-KB BY PROJECT ID URL', url);

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
  public addMongoDbFaqKb(name: string, urlfaqkb: string, project_id: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'name': name, 'url': urlfaqkb, 'id_project': project_id };

    console.log('POST REQUEST BODY ', body);

    const url = this.MONGODB_BASE_URL;

    return this.http
      .post(url, JSON.stringify(body), options)
      .map((res) => res.json());

  }

  /**
   * CREATE KBKEY
   * AFTER THAT A NEW FAQKB WAS CREATED RUN A CALLBACK VS qna_kbmanagement/create
   * THAT RETURN THE kbkey THEN USED TO RUN ANOTHER CALLBACK WHEN A NEW FAQ WAS CREATED
   */

  // {
  //   "username": "frontiere21",
  //   "password": "password",
  //   "language": "italian"
  // }
  // public createFaqKbKey() {
  //   const headers = new Headers();
  //   headers.append('Accept', 'application/json');
  //   headers.append('Content-type', 'application/json');
  //   headers.append('Authorization', 'Basic YWRtaW46YWRtaW5wNHNzdzByZA==');
  //   const options = new RequestOptions({ headers });

  //   const body = { 'username': 'frontiere21', 'password': 'password', 'language': 'italian' };

  //   console.log('CREATE FAQKB KEY - POST REQUEST BODY ', body);

  //   const url = 'http://ec2-52-47-168-118.eu-west-3.compute.amazonaws.com/qna_kbmanagement/create';

  //   return this.http
  //     .post(url, JSON.stringify(body), options)
  //     .map((res) => res.json());

  // }

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
