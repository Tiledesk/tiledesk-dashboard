// tslint:disable:max-line-length
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Contact } from '../models/contact-model';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
// import { MongodbConfService } from '../utils/mongodb-conf.service';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/auth.service';

@Injectable()
export class ContactsService {

  // Contact: Contact[];
  http: Http;
  projectId: string;
  user: any;
  TOKEN: any;
  currentUserID: string;

  BASE_URL = environment.mongoDbConfig.BASE_URL;
  MONGODB_BASE_URL = environment.mongoDbConfig.CONTACTS_BASE_URL;


  constructor(
    http: Http,
    public auth: AuthService

  ) {

    this.http = http;
    // this.MONGODB_BASE_URL = mongodbConfService.MONGODB_CONTACTS_BASE_URL;
    // console.log('MONGODB_CONTACTS_BASE_URL ! ', mongodbConfService.MONGODB_CONTACTS_BASE_URL);
    // this.TOKEN = mongodbConfService.TOKEN;
    this.getCurrentProject();

    this.user = auth.user_bs.value
    this.checkUser()

    this.auth.user_bs.subscribe((user) => {

      this.user = user;
      this.checkUser()
    });
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      console.log('!!!! CONTACTS SERVICE: SUBSCRIBE TO THE PROJECT PUBLISHED BY AUTH SERVICE ', project)

      if (project) {
        this.projectId = project._id
      }
    })
  }


  checkUser() {
    if (this.user) {
      this.TOKEN = this.user.token

      this.currentUserID = this.user._id
      console.log('!!!! CONTACTS SERVICE - USER UID  ', this.currentUserID);

    } else {
      console.log('No user is signed in');
    }
  }


  // GET LEADS
  public getLeads(querystring, pagenumber): Observable<Contact[]> {

    let _querystring = '&' + querystring
    if (querystring === undefined || !querystring) {
      _querystring = ''
    }
    const url = this.BASE_URL + this.projectId + '/leads?page=' + pagenumber + _querystring;
    // use this to test
    // const url = 'https://api.tiledesk.com/v1/5ba35f0b9acdd40015d350b6/leads?page=' + pagenumber + _querystring;
    console.log('!!!! CONTACTS SERVICE - GET CONTACTS URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    // use this to test
    // headers.append('Authorization', 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnsiZW1haWwiOjEsImZpcnN0bmFtZSI6MSwibGFzdG5hbWUiOjEsInBhc3N3b3JkIjoxLCJlbWFpbHZlcmlmaWVkIjoxLCJpZCI6MX0sImdldHRlcnMiOnt9LCJfaWQiOiI1YWFhOTJmZjRjM2IxMTAwMTRiNDc4Y2IiLCJ3YXNQb3B1bGF0ZWQiOmZhbHNlLCJhY3RpdmVQYXRocyI6eyJwYXRocyI6eyJwYXNzd29yZCI6ImluaXQiLCJlbWFpbCI6ImluaXQiLCJsYXN0bmFtZSI6ImluaXQiLCJmaXJzdG5hbWUiOiJpbml0IiwiX2lkIjoiaW5pdCJ9LCJzdGF0ZXMiOnsiaWdub3JlIjp7fSwiZGVmYXVsdCI6e30sImluaXQiOnsibGFzdG5hbWUiOnRydWUsImZpcnN0bmFtZSI6dHJ1ZSwicGFzc3dvcmQiOnRydWUsImVtYWlsIjp0cnVlLCJfaWQiOnRydWV9LCJtb2RpZnkiOnt9LCJyZXF1aXJlIjp7fX0sInN0YXRlTmFtZXMiOlsicmVxdWlyZSIsIm1vZGlmeSIsImluaXQiLCJkZWZhdWx0IiwiaWdub3JlIl19LCJwYXRoc1RvU2NvcGVzIjp7fSwiZW1pdHRlciI6eyJkb21haW4iOm51bGwsIl9ldmVudHMiOnt9LCJfZXZlbnRzQ291bnQiOjAsIl9tYXhMaXN0ZW5lcnMiOjB9LCIkb3B0aW9ucyI6dHJ1ZX0sImlzTmV3IjpmYWxzZSwiX2RvYyI6eyJsYXN0bmFtZSI6IkxhbnppbG90dG8iLCJmaXJzdG5hbWUiOiJOaWNvbGEgNzQiLCJwYXNzd29yZCI6IiQyYSQxMCRwVWdocTVJclgxMzhTOXBEY1pkbG1lcnNjVTdVOXJiNlFKaVliMXlEckljOHJDMFh6c2hUcSIsImVtYWlsIjoibGFuemlsb3R0b25pY29sYTc0QGdtYWlsLmNvbSIsIl9pZCI6IjVhYWE5MmZmNGMzYjExMDAxNGI0NzhjYiJ9LCIkaW5pdCI6dHJ1ZSwiaWF0IjoxNTM4MTIzNTcyfQ.CYnxkLbg5XWk2JWAxQg1QNGDpNgNbZAzs5PEQpLCCnI');

    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  /**
   * READ (GET)
   */
  public getMongDbContacts(): Observable<Contact[]> {
    const url = this.MONGODB_BASE_URL;
    // const url = `http://localhost:3000/app1/contacts`;
    // const url = `http://api.chat21.org/app1/contacts`;
    console.log('MONGO DB CONTACTS URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    // headers.append('Authorization', 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnt9LCJnZXR0ZXJzIjp7fSwiX2lkIjoiNWE3MDQ0YzdjNzczNGQwZGU0ZGRlMmQ0Iiwid2FzUG9wdWxhdGVkIjpmYWxzZSwiYWN0aXZlUGF0aHMiOnsicGF0aHMiOnsicGFzc3dvcmQiOiJpbml0IiwidXNlcm5hbWUiOiJpbml0IiwiX192IjoiaW5pdCIsIl9pZCI6ImluaXQifSwic3RhdGVzIjp7Imlnbm9yZSI6e30sImRlZmF1bHQiOnt9LCJpbml0Ijp7Il9fdiI6dHJ1ZSwicGFzc3dvcmQiOnRydWUsInVzZXJuYW1lIjp0cnVlLCJfaWQiOnRydWV9LCJtb2RpZnkiOnt9LCJyZXF1aXJlIjp7fX0sInN0YXRlTmFtZXMiOlsicmVxdWlyZSIsIm1vZGlmeSIsImluaXQiLCJkZWZhdWx0IiwiaWdub3JlIl19LCJwYXRoc1RvU2NvcGVzIjp7fSwiZW1pdHRlciI6eyJkb21haW4iOm51bGwsIl9ldmVudHMiOnt9LCJfZXZlbnRzQ291bnQiOjAsIl9tYXhMaXN0ZW5lcnMiOjB9LCIkb3B0aW9ucyI6dHJ1ZX0sImlzTmV3IjpmYWxzZSwiX2RvYyI6eyJfX3YiOjAsInBhc3N3b3JkIjoiJDJhJDEwJGw3RnN1aS9FcDdONkEwTW10b1BNa2VjQnY0SzMzaFZwSlF3ckpGcHFSMVZSQ2JaUnkybHk2IiwidXNlcm5hbWUiOiJhbmRyZWEiLCJfaWQiOiI1YTcwNDRjN2M3NzM0ZDBkZTRkZGUyZDQifSwiJGluaXQiOnRydWUsImlhdCI6MTUxNzMwNzExM30.6kpeWLl_o5EgBzmzH3EGtJ_f3yhE7M9VMpx59ze_gbY');
    // headers.append('Authorization', 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnt9LCJnZXR0ZXJzIjp7fSwid2FzUG9wdWxhdGVkIjpmYWxzZSwiYWN0aXZlUGF0aHMiOnsicGF0aHMiOnsicGFzc3dvcmQiOiJpbml0IiwidXNlcm5hbWUiOiJpbml0IiwiX192IjoiaW5pdCIsIl9pZCI6ImluaXQifSwic3RhdGVzIjp7Imlnbm9yZSI6e30sImRlZmF1bHQiOnt9LCJpbml0Ijp7Il9fdiI6dHJ1ZSwicGFzc3dvcmQiOnRydWUsInVzZXJuYW1lIjp0cnVlLCJfaWQiOnRydWV9LCJtb2RpZnkiOnt9LCJyZXF1aXJlIjp7fX0sInN0YXRlTmFtZXMiOlsicmVxdWlyZSIsIm1vZGlmeSIsImluaXQiLCJkZWZhdWx0IiwiaWdub3JlIl19LCJlbWl0dGVyIjp7ImRvbWFpbiI6bnVsbCwiX2V2ZW50cyI6e30sIl9ldmVudHNDb3VudCI6MCwiX21heExpc3RlbmVycyI6MH19LCJpc05ldyI6ZmFsc2UsIl9kb2MiOnsiX192IjowLCJwYXNzd29yZCI6IiQyYSQxMCQ3WDBEOFY5T1dIYnNhZi91TTcuNml1ZUdCQjFUSWpoNGRnanFUS1dPOVk3UnQ1RjBwckVoTyIsInVzZXJuYW1lIjoiYW5kcmVhIiwiX2lkIjoiNWE2YWU1MjUwNmY2MmI2MDA3YTZkYzAwIn0sImlhdCI6MTUxNjk1NTA3Nn0.MHjEJFGmqqsEhm8sglvO6Hpt2bKBYs25VvGNP6W8JbI');
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  /**
   * CREATE (POST)
   * @param fullName
   */
  public addMongoDbContacts(fullName: string) {
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
    // .subscribe((data) => {
    //   console.log('POST DATA ', data);
    // },
    // (error) => {

    //   console.log('POST REQUEST ERROR ', error);

    // },
    // () => {
    //   console.log('POST REQUEST * COMPLETE *');
    // });
  }

  /**
   * DELETE (DELETE)
   * @param id
   */
  public deleteMongoDbContact(id: string) {

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
    // .subscribe((data) => {
    //   console.log('DELETE DATA ', data);
    // },
    // (error) => {

    //   console.log('DELETE REQUEST ERROR ', error);

    // },
    // () => {
    //   console.log('DELETE REQUEST * COMPLETE *');
    // });
  }

  /**
   * UPDATE (PUT)
   * @param id
   * @param fullName
   */
  public updateMongoDbContact(id: string, fullName: string) {

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
    // .subscribe((data) => {
    //   console.log('PUT DATA ', data);
    // },
    // (error) => {

    //   console.log('PUT REQUEST ERROR ', error);

    // },
    // () => {
    //   console.log('PUT REQUEST * COMPLETE *');
    // });

  }

}
