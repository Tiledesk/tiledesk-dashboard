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
    // 5bcf51dbc375420015542b5f is the id og the project (in production ) progetto test 23 ott of the user lanzilottonicola74@gmail.com
    // const url = 'https://api.tiledesk.com/v1/5bcf51dbc375420015542b5f/leads?page=' + pagenumber + _querystring;
    console.log('!!!! CONTACTS SERVICE - GET CONTACTS URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);

    /****** use this to test *******/
    // headers.append('Authorization', 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnsiZW1haWwiOjEsImZpcnN0bmFtZSI6MSwibGFzdG5hbWUiOjEsInBhc3N3b3JkIjoxLCJlbWFpbHZlcmlmaWVkIjoxLCJpZCI6MX0sImdldHRlcnMiOnt9LCJfaWQiOiI1YWFhOTJmZjRjM2IxMTAwMTRiNDc4Y2IiLCJ3YXNQb3B1bGF0ZWQiOmZhbHNlLCJhY3RpdmVQYXRocyI6eyJwYXRocyI6eyJwYXNzd29yZCI6ImluaXQiLCJlbWFpbCI6ImluaXQiLCJlbWFpbHZlcmlmaWVkIjoiaW5pdCIsImxhc3RuYW1lIjoiaW5pdCIsImZpcnN0bmFtZSI6ImluaXQiLCJfaWQiOiJpbml0In0sInN0YXRlcyI6eyJpZ25vcmUiOnt9LCJkZWZhdWx0Ijp7fSwiaW5pdCI6eyJlbWFpbHZlcmlmaWVkIjp0cnVlLCJsYXN0bmFtZSI6dHJ1ZSwiZmlyc3RuYW1lIjp0cnVlLCJwYXNzd29yZCI6dHJ1ZSwiZW1haWwiOnRydWUsIl9pZCI6dHJ1ZX0sIm1vZGlmeSI6e30sInJlcXVpcmUiOnt9fSwic3RhdGVOYW1lcyI6WyJyZXF1aXJlIiwibW9kaWZ5IiwiaW5pdCIsImRlZmF1bHQiLCJpZ25vcmUiXX0sInBhdGhzVG9TY29wZXMiOnt9LCJlbWl0dGVyIjp7ImRvbWFpbiI6bnVsbCwiX2V2ZW50cyI6e30sIl9ldmVudHNDb3VudCI6MCwiX21heExpc3RlbmVycyI6MH0sIiRvcHRpb25zIjp0cnVlfSwiaXNOZXciOmZhbHNlLCJfZG9jIjp7ImVtYWlsdmVyaWZpZWQiOnRydWUsImxhc3RuYW1lIjoiTGFuemlsb3R0byIsImZpcnN0bmFtZSI6Ik5pY29sYTc0IiwicGFzc3dvcmQiOiIkMmEkMTAkcFVnaHE1SXJYMTM4UzlwRGNaZGxtZXJzY1U3VTlyYjZRSmlZYjF5RHJJYzhyQzBYenNoVHEiLCJlbWFpbCI6ImxhbnppbG90dG9uaWNvbGE3NEBnbWFpbC5jb20iLCJfaWQiOiI1YWFhOTJmZjRjM2IxMTAwMTRiNDc4Y2IifSwiJGluaXQiOnRydWUsImlhdCI6MTU0MDMxMzUzN30.LLjXOB21KFL1DFXCrulh5HmzMS40LETqyLrJlwtwYvQ');

    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  // GET LEADS
  public exportLeadToCsv(querystring, pagenumber) {
    let _querystring = '&' + querystring
    if (querystring === undefined || !querystring) {
      _querystring = ''
    }
    const url = this.BASE_URL + this.projectId + '/leads/csv?page=' + pagenumber + _querystring;
    // use this to test
    // 5bcf51dbc375420015542b5f is the id og the project (in production ) progetto test 23 ott of the user lanzilottonicola74@gmail.com
    // const url = 'https://api.tiledesk.com/v1/5bcf51dbc375420015542b5f/leads?page=' + pagenumber + _querystring;
    console.log('!!!! CONTACTS SERVICE - GET CONTACTS URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/csv');
    headers.append('Authorization', this.TOKEN);

    /****** use this to test *******/
    // headers.append('Authorization', 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnsiZW1haWwiOjEsImZpcnN0bmFtZSI6MSwibGFzdG5hbWUiOjEsInBhc3N3b3JkIjoxLCJlbWFpbHZlcmlmaWVkIjoxLCJpZCI6MX0sImdldHRlcnMiOnt9LCJfaWQiOiI1YWFhOTJmZjRjM2IxMTAwMTRiNDc4Y2IiLCJ3YXNQb3B1bGF0ZWQiOmZhbHNlLCJhY3RpdmVQYXRocyI6eyJwYXRocyI6eyJwYXNzd29yZCI6ImluaXQiLCJlbWFpbCI6ImluaXQiLCJlbWFpbHZlcmlmaWVkIjoiaW5pdCIsImxhc3RuYW1lIjoiaW5pdCIsImZpcnN0bmFtZSI6ImluaXQiLCJfaWQiOiJpbml0In0sInN0YXRlcyI6eyJpZ25vcmUiOnt9LCJkZWZhdWx0Ijp7fSwiaW5pdCI6eyJlbWFpbHZlcmlmaWVkIjp0cnVlLCJsYXN0bmFtZSI6dHJ1ZSwiZmlyc3RuYW1lIjp0cnVlLCJwYXNzd29yZCI6dHJ1ZSwiZW1haWwiOnRydWUsIl9pZCI6dHJ1ZX0sIm1vZGlmeSI6e30sInJlcXVpcmUiOnt9fSwic3RhdGVOYW1lcyI6WyJyZXF1aXJlIiwibW9kaWZ5IiwiaW5pdCIsImRlZmF1bHQiLCJpZ25vcmUiXX0sInBhdGhzVG9TY29wZXMiOnt9LCJlbWl0dGVyIjp7ImRvbWFpbiI6bnVsbCwiX2V2ZW50cyI6e30sIl9ldmVudHNDb3VudCI6MCwiX21heExpc3RlbmVycyI6MH0sIiRvcHRpb25zIjp0cnVlfSwiaXNOZXciOmZhbHNlLCJfZG9jIjp7ImVtYWlsdmVyaWZpZWQiOnRydWUsImxhc3RuYW1lIjoiTGFuemlsb3R0byIsImZpcnN0bmFtZSI6Ik5pY29sYTc0IiwicGFzc3dvcmQiOiIkMmEkMTAkcFVnaHE1SXJYMTM4UzlwRGNaZGxtZXJzY1U3VTlyYjZRSmlZYjF5RHJJYzhyQzBYenNoVHEiLCJlbWFpbCI6ImxhbnppbG90dG9uaWNvbGE3NEBnbWFpbC5jb20iLCJfaWQiOiI1YWFhOTJmZjRjM2IxMTAwMTRiNDc4Y2IifSwiJGluaXQiOnRydWUsImlhdCI6MTU0MDMxMzUzN30.LLjXOB21KFL1DFXCrulh5HmzMS40LETqyLrJlwtwYvQ');

    return this.http
      .get(url, { headers })
      .map((response) => response.text());
  }



  // GET LEAD BY ID
  public getLeadById(id: string): Observable<Contact[]> {
    const url = this.BASE_URL + this.projectId + '/leads/' + id;

    /****** use this to test *******/
    // const url = 'https://api.tiledesk.com/v1/5bcf51dbc375420015542b5f/leads/' + id;
    console.log('!!!! CONTACTS SERVICE - GET CONTACT BY ID URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);

    /****** use this to test *******/
    // headers.append('Authorization', 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnsiZW1haWwiOjEsImZpcnN0bmFtZSI6MSwibGFzdG5hbWUiOjEsInBhc3N3b3JkIjoxLCJlbWFpbHZlcmlmaWVkIjoxLCJpZCI6MX0sImdldHRlcnMiOnt9LCJfaWQiOiI1YWFhOTJmZjRjM2IxMTAwMTRiNDc4Y2IiLCJ3YXNQb3B1bGF0ZWQiOmZhbHNlLCJhY3RpdmVQYXRocyI6eyJwYXRocyI6eyJwYXNzd29yZCI6ImluaXQiLCJlbWFpbCI6ImluaXQiLCJlbWFpbHZlcmlmaWVkIjoiaW5pdCIsImxhc3RuYW1lIjoiaW5pdCIsImZpcnN0bmFtZSI6ImluaXQiLCJfaWQiOiJpbml0In0sInN0YXRlcyI6eyJpZ25vcmUiOnt9LCJkZWZhdWx0Ijp7fSwiaW5pdCI6eyJlbWFpbHZlcmlmaWVkIjp0cnVlLCJsYXN0bmFtZSI6dHJ1ZSwiZmlyc3RuYW1lIjp0cnVlLCJwYXNzd29yZCI6dHJ1ZSwiZW1haWwiOnRydWUsIl9pZCI6dHJ1ZX0sIm1vZGlmeSI6e30sInJlcXVpcmUiOnt9fSwic3RhdGVOYW1lcyI6WyJyZXF1aXJlIiwibW9kaWZ5IiwiaW5pdCIsImRlZmF1bHQiLCJpZ25vcmUiXX0sInBhdGhzVG9TY29wZXMiOnt9LCJlbWl0dGVyIjp7ImRvbWFpbiI6bnVsbCwiX2V2ZW50cyI6e30sIl9ldmVudHNDb3VudCI6MCwiX21heExpc3RlbmVycyI6MH0sIiRvcHRpb25zIjp0cnVlfSwiaXNOZXciOmZhbHNlLCJfZG9jIjp7ImVtYWlsdmVyaWZpZWQiOnRydWUsImxhc3RuYW1lIjoiTGFuemlsb3R0byIsImZpcnN0bmFtZSI6Ik5pY29sYTc0IiwicGFzc3dvcmQiOiIkMmEkMTAkcFVnaHE1SXJYMTM4UzlwRGNaZGxtZXJzY1U3VTlyYjZRSmlZYjF5RHJJYzhyQzBYenNoVHEiLCJlbWFpbCI6ImxhbnppbG90dG9uaWNvbGE3NEBnbWFpbC5jb20iLCJfaWQiOiI1YWFhOTJmZjRjM2IxMTAwMTRiNDc4Y2IifSwiJGluaXQiOnRydWUsImlhdCI6MTU0MDMxMzUzN30.LLjXOB21KFL1DFXCrulh5HmzMS40LETqyLrJlwtwYvQ');

    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  /**
   * UPDATE (PUT)
   * @param id
   * @param fullName
   */
  public updateLead(id: string, fullName: string, _email: string) {

    const url = this.BASE_URL + this.projectId + '/leads/' + id;

    /****** use this to test *******/
    // const url = 'https://api.tiledesk.com/v1/5bcf51dbc375420015542b5f/leads/' + id;
    console.log('UPDATE CONTACT URL ', url);

    const headers = new Headers();

    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);

    /****** use this to test *******/
    // headers.append('Authorization', 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnsiZW1haWwiOjEsImZpcnN0bmFtZSI6MSwibGFzdG5hbWUiOjEsInBhc3N3b3JkIjoxLCJlbWFpbHZlcmlmaWVkIjoxLCJpZCI6MX0sImdldHRlcnMiOnt9LCJfaWQiOiI1YWFhOTJmZjRjM2IxMTAwMTRiNDc4Y2IiLCJ3YXNQb3B1bGF0ZWQiOmZhbHNlLCJhY3RpdmVQYXRocyI6eyJwYXRocyI6eyJwYXNzd29yZCI6ImluaXQiLCJlbWFpbCI6ImluaXQiLCJlbWFpbHZlcmlmaWVkIjoiaW5pdCIsImxhc3RuYW1lIjoiaW5pdCIsImZpcnN0bmFtZSI6ImluaXQiLCJfaWQiOiJpbml0In0sInN0YXRlcyI6eyJpZ25vcmUiOnt9LCJkZWZhdWx0Ijp7fSwiaW5pdCI6eyJlbWFpbHZlcmlmaWVkIjp0cnVlLCJsYXN0bmFtZSI6dHJ1ZSwiZmlyc3RuYW1lIjp0cnVlLCJwYXNzd29yZCI6dHJ1ZSwiZW1haWwiOnRydWUsIl9pZCI6dHJ1ZX0sIm1vZGlmeSI6e30sInJlcXVpcmUiOnt9fSwic3RhdGVOYW1lcyI6WyJyZXF1aXJlIiwibW9kaWZ5IiwiaW5pdCIsImRlZmF1bHQiLCJpZ25vcmUiXX0sInBhdGhzVG9TY29wZXMiOnt9LCJlbWl0dGVyIjp7ImRvbWFpbiI6bnVsbCwiX2V2ZW50cyI6e30sIl9ldmVudHNDb3VudCI6MCwiX21heExpc3RlbmVycyI6MH0sIiRvcHRpb25zIjp0cnVlfSwiaXNOZXciOmZhbHNlLCJfZG9jIjp7ImVtYWlsdmVyaWZpZWQiOnRydWUsImxhc3RuYW1lIjoiTGFuemlsb3R0byIsImZpcnN0bmFtZSI6Ik5pY29sYTc0IiwicGFzc3dvcmQiOiIkMmEkMTAkcFVnaHE1SXJYMTM4UzlwRGNaZGxtZXJzY1U3VTlyYjZRSmlZYjF5RHJJYzhyQzBYenNoVHEiLCJlbWFpbCI6ImxhbnppbG90dG9uaWNvbGE3NEBnbWFpbC5jb20iLCJfaWQiOiI1YWFhOTJmZjRjM2IxMTAwMTRiNDc4Y2IifSwiJGluaXQiOnRydWUsImlhdCI6MTU0MDMxMzUzN30.LLjXOB21KFL1DFXCrulh5HmzMS40LETqyLrJlwtwYvQ');

    const options = new RequestOptions({ headers });

    const body = { 'fullname': fullName, 'email': _email };
    // const body = {};
    // if (fullName) {
    //   body['fullname'] = fullName
    // }
    // if (email) {
    //   body['email'] = email
    // }

    console.log('UPDATE CONTACT REQUEST BODY ', body);
    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }

  /**
   * DELETE (DELETE)
   * @param id
   */
  public deleteLead(id: string) {

    const url = this.BASE_URL + this.projectId + '/leads/' + id;

    /****** use this to test *******/
    // const url = 'https://api.tiledesk.com/v1/5bcf51dbc375420015542b5f/leads/' + id;

    console.log('DELETE URL ', url);

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);

    /****** use this to test *******/
    // headers.append('Authorization', 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnsiZW1haWwiOjEsImZpcnN0bmFtZSI6MSwibGFzdG5hbWUiOjEsInBhc3N3b3JkIjoxLCJlbWFpbHZlcmlmaWVkIjoxLCJpZCI6MX0sImdldHRlcnMiOnt9LCJfaWQiOiI1YWFhOTJmZjRjM2IxMTAwMTRiNDc4Y2IiLCJ3YXNQb3B1bGF0ZWQiOmZhbHNlLCJhY3RpdmVQYXRocyI6eyJwYXRocyI6eyJwYXNzd29yZCI6ImluaXQiLCJlbWFpbCI6ImluaXQiLCJlbWFpbHZlcmlmaWVkIjoiaW5pdCIsImxhc3RuYW1lIjoiaW5pdCIsImZpcnN0bmFtZSI6ImluaXQiLCJfaWQiOiJpbml0In0sInN0YXRlcyI6eyJpZ25vcmUiOnt9LCJkZWZhdWx0Ijp7fSwiaW5pdCI6eyJlbWFpbHZlcmlmaWVkIjp0cnVlLCJsYXN0bmFtZSI6dHJ1ZSwiZmlyc3RuYW1lIjp0cnVlLCJwYXNzd29yZCI6dHJ1ZSwiZW1haWwiOnRydWUsIl9pZCI6dHJ1ZX0sIm1vZGlmeSI6e30sInJlcXVpcmUiOnt9fSwic3RhdGVOYW1lcyI6WyJyZXF1aXJlIiwibW9kaWZ5IiwiaW5pdCIsImRlZmF1bHQiLCJpZ25vcmUiXX0sInBhdGhzVG9TY29wZXMiOnt9LCJlbWl0dGVyIjp7ImRvbWFpbiI6bnVsbCwiX2V2ZW50cyI6e30sIl9ldmVudHNDb3VudCI6MCwiX21heExpc3RlbmVycyI6MH0sIiRvcHRpb25zIjp0cnVlfSwiaXNOZXciOmZhbHNlLCJfZG9jIjp7ImVtYWlsdmVyaWZpZWQiOnRydWUsImxhc3RuYW1lIjoiTGFuemlsb3R0byIsImZpcnN0bmFtZSI6Ik5pY29sYTc0IiwicGFzc3dvcmQiOiIkMmEkMTAkcFVnaHE1SXJYMTM4UzlwRGNaZGxtZXJzY1U3VTlyYjZRSmlZYjF5RHJJYzhyQzBYenNoVHEiLCJlbWFpbCI6ImxhbnppbG90dG9uaWNvbGE3NEBnbWFpbC5jb20iLCJfaWQiOiI1YWFhOTJmZjRjM2IxMTAwMTRiNDc4Y2IifSwiJGluaXQiOnRydWUsImlhdCI6MTU0MDMxMzUzN30.LLjXOB21KFL1DFXCrulh5HmzMS40LETqyLrJlwtwYvQ');
    const options = new RequestOptions({ headers });
    return this.http
      .delete(url, options)
      .map((res) => res.json());

  }

  /**
   * CREATE (POST)
   * @param fullName
   */
  // public addMongoDbContacts(fullName: string) {
  //   const headers = new Headers();
  //   headers.append('Accept', 'application/json');
  //   headers.append('Content-type', 'application/json');
  //   headers.append('Authorization', this.TOKEN);
  //   const options = new RequestOptions({ headers });

  //   const body = { 'fullname': `${fullName}` };

  //   console.log('POST REQUEST BODY ', body);

  //   const url = this.MONGODB_BASE_URL;

  //   return this.http
  //     .post(url, JSON.stringify(body), options)
  //     .map((res) => res.json());
  // }





}
