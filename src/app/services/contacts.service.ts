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
import { AppConfigService } from '../services/app-config.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { WebSocketJs } from "./websocket/websocket-js";
import 'rxjs/add/observable/forkJoin';

@Injectable()
export class ContactsService {

  // public wsRequesterStatus$: BehaviorSubject<any> = new BehaviorSubject<any>({});
  // Contact: Contact[];
  http: Http;
  projectId: string;
  user: any;
  TOKEN: any;
  currentUserID: string;

  // BASE_URL = environment.mongoDbConfig.BASE_URL; // replaced with SERVER_BASE_PATH
  // SERVER_BASE_PATH = environment.SERVER_BASE_URL; // now get from appconfig
  SERVER_BASE_PATH: string;

  constructor(
    http: Http,
    public auth: AuthService,
    public appConfigService: AppConfigService,
    public webSocketJs: WebSocketJs

  ) {

    this.http = http;
    this.getCurrentProject();

    this.user = auth.user_bs.value
    this.checkUser()

    this.auth.user_bs.subscribe((user) => {

      this.user = user;
      this.checkUser()
    });

    this.getAppConfig();
  }

  getAppConfig() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    console.log('AppConfigService getAppConfig (CONTACTS-SERV) SERVER_BASE_PATH', this.SERVER_BASE_PATH);
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

  // subscribeToWS_RequesterPresence(requesterid) {
  //   var self = this;
  //   console.log("wsRequesterPresence - HERE ");
  //   const path = '/' + this.projectId + '/project_users/users/' + requesterid;
  //   // const path = "/5f61efc28f90f300345edd75/project_users/5f623d5c56065e0034fce69c";
  //   console.log('wsRequesterPresence PATH ', path);
  //   this.webSocketJs.ref(path, 'subscribeToWS_RequesterPresence',
  //     function (data, notification) {
  //       console.log("wsRequesterPresence (contacts service) - CREATE - data ", data);
  //       // console.log("% WsMsgsService notification", notification);

  //       self.wsRequesterStatus$.next(data);

  //     }, function (data, notification) {

  //       console.log("wsRequesterPresence (contacts service) - UPDATE - data ", data);
  //       // console.log("% WsMsgsService notification", notification);
  //       self.wsRequesterStatus$.next(data);

  //     }, function (data, notification) {

  //       if (data) {
  //         console.log("wsRequesterPresence (contacts service) - ON-DATA - data", data);

  //       }
  //     }
  //   );
  // }

  // unsubscribeToWS_RequesterPresence(requesterid) {
  //   const path = '/' + this.projectId + '/project_users/users/' + requesterid;
  //   this.webSocketJs.unsubscribe(path);
  //   console.log("wsRequesterPresence UNSUBSCRIBE To WS Requester Presence (contacts service) ");

  // }


  // GET LEADS
  public getLeadsActiveOrTrashed(querystring, pagenumber, hasclickedtrash): Observable<Contact[]> {
    let _querystring = '&' + querystring
    console.log('!!!! CONTACTS SERVICE - GET CONTACTS hasclickedtrashL', hasclickedtrash);

    if (querystring === undefined || !querystring) {
      _querystring = ''
    }

    let trashed_contacts = ''
    if (hasclickedtrash === true) {
      trashed_contacts = '&status=1000'
    }

    const url = this.SERVER_BASE_PATH + this.projectId + '/leads?page=' + pagenumber + _querystring + trashed_contacts;
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

  getLeadsTrashed(): Observable<Contact[]> {
    const url = this.SERVER_BASE_PATH + this.projectId + '/leads?page=0&status=1000';
    // use this to test
    // 5bcf51dbc375420015542b5f is the id og the project (in production ) progetto test 23 ott of the user lanzilottonicola74@gmail.com
    // const url = 'https://api.tiledesk.com/v1/5bcf51dbc375420015542b5f/leads?page=' + pagenumber + _querystring;
    console.log('!!!! CONTACTS SERVICE - GET TRASHED CONTACTS URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);

    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  getLeadsActive(): Observable<Contact[]> {
    // const url = this.SERVER_BASE_PATH + this.projectId + '/leads?page=0';
    const url = this.SERVER_BASE_PATH + this.projectId + '/leads';
    // use this to test
    // 5bcf51dbc375420015542b5f is the id og the project (in production ) progetto test 23 ott of the user lanzilottonicola74@gmail.com
    // const url = 'https://api.tiledesk.com/v1/5bcf51dbc375420015542b5f/leads?page=' + pagenumber + _querystring;
    console.log('!!!! CONTACTS SERVICE - GET ACIVE CONTACTS URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);

    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }


  // NoT USED
  getAllLeadsActive(pageNo): Observable<Contact[]> {
    // const url = this.SERVER_BASE_PATH + this.projectId + '/leads?page=0';
    const url = this.SERVER_BASE_PATH + this.projectId + '/leads/?page=' + pageNo;
    // use this to test
    // 5bcf51dbc375420015542b5f is the id og the project (in production ) progetto test 23 ott of the user lanzilottonicola74@gmail.com
    // const url = 'https://api.tiledesk.com/v1/5bcf51dbc375420015542b5f/leads?page=' + pagenumber + _querystring;
    console.log('!!!! CONTACTS SERVICE - GET ACIVE CONTACTS URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);

    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  getAllLeadsActiveWithLimit(limit): Observable<Contact[]> {
    // const url = this.SERVER_BASE_PATH + this.projectId + '/leads?page=0';
    const url = this.SERVER_BASE_PATH + this.projectId + '/leads?limit=' + limit + '&with_fullname=true';
    // use this to test
    // 5bcf51dbc375420015542b5f is the id og the project (in production ) progetto test 23 ott of the user lanzilottonicola74@gmail.com
    // const url = 'https://api.tiledesk.com/v1/5bcf51dbc375420015542b5f/leads?page=' + pagenumber + _querystring;
    console.log('!!!! CONTACTS SERVICE - GET ACIVE CONTACTS WITH LIMIT URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);

    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  public createNewProjectUserToGetNewLeadID() {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = {};
    const url = this.SERVER_BASE_PATH + this.projectId + '/project_users/'
    console.log('CREATE NEW PROJECT USER TO GET NEW LEAD ID url ', url);
    return this.http
      .post(url, body, options)
      .map((res) => res.json());

  }

  public createNewLead(leadid: string, fullname: string, leademail: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'lead_id': leadid, 'fullname': fullname, 'email': leademail };

    console.log('ADD BOT POST REQUEST BODY ', body);

    const url = this.SERVER_BASE_PATH + this.projectId + '/leads/'

    return this.http
      .post(url, JSON.stringify(body), options)
      .map((res) => res.json());

  }


  public exportLeadToCsv(querystring, pagenumber, hasclickedtrash) {
    let _querystring = '&' + querystring
    if (querystring === undefined || !querystring) {
      _querystring = ''
    }

    let trashed_contacts = ''
    if (hasclickedtrash === true) {
      trashed_contacts = '&status=1000'
    }
    // + trashed_contacts // IL SERVIZIO NON PRENDE I STATUS 1000
    const url = this.SERVER_BASE_PATH + this.projectId + '/leads/csv?page=' + pagenumber + _querystring;
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
    const url = this.SERVER_BASE_PATH + this.projectId + '/leads/' + id;

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
  public updateLead(
    id: string,
    fullName: string,
    lead_email: string,
    lead_company: string,
    lead_street_address: string,
    lead_city: string,
    lead_state: string,
    lead_postalcode: string,
    lead_country: string,
    lead_phone_number: string,
    lead_note: string
  ) {

    const url = this.SERVER_BASE_PATH + this.projectId + '/leads/' + id;

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

    const body = {
      'fullname': fullName,
      'email': lead_email,
      'company': lead_company,
      'streetAddress': lead_street_address,
      'city': lead_city,
      'region': lead_state,
      'zipcode': lead_postalcode,
      'country': lead_country,
      'phone': lead_phone_number,
      'note': lead_note
    };
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
    const url = this.SERVER_BASE_PATH + this.projectId + '/leads/' + id;

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
 * DELETE (DELETE)
 * @param id
 */
  public deleteLeadForever(id: string) {

    const url = this.SERVER_BASE_PATH + this.projectId + '/leads/' + id + '/physical';

    /****** use this to test *******/
    // const url = 'https://api.tiledesk.com/v1/5bcf51dbc375420015542b5f/leads/' + id;

    console.log('DELETE LEAD FOREVER URL ', url);

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

  public restoreContact(id: string) {
    const url = this.SERVER_BASE_PATH + this.projectId + '/leads/' + id;

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

    const body = { 'status': 100, };

    console.log('UPDATE CONTACT REQUEST BODY ', body);
    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());

  }

  public getNodeJsRequestsByRequesterId(requesterid: string, pagenumber: number) {
    /* *** USED TO TEST IN LOCALHOST (note: this service doen't work in localhost) *** */
    // const url = 'https://api.tiledesk.com/v1/' + '5ba35f0b9acdd40015d350b6' + '/requests?requester_id=' + requesterid + '&page=' + pagenumber;
    /* *** USED IN PRODUCTION *** */
    const url = this.SERVER_BASE_PATH + this.projectId + '/requests?lead=' + requesterid + '&page=' + pagenumber + '&status=all' + '&no_populate=true';

    console.log('!!!! CONTACT DETAILS - CONTACTS SERVICE URL ', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    /* *** USED TO TEST IN LOCALHOST (note: this service doesn't work in localhost) *** */
    // headers.append('Authorization', 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnsiZW1haWwiOjEsImZpcnN0bmFtZSI6MSwibGFzdG5hbWUiOjEsInBhc3N3b3JkIjoxLCJlbWFpbHZlcmlmaWVkIjoxLCJpZCI6MX0sImdldHRlcnMiOnt9LCJfaWQiOiI1YWFhOTJmZjRjM2IxMTAwMTRiNDc4Y2IiLCJ3YXNQb3B1bGF0ZWQiOmZhbHNlLCJhY3RpdmVQYXRocyI6eyJwYXRocyI6eyJwYXNzd29yZCI6ImluaXQiLCJlbWFpbCI6ImluaXQiLCJsYXN0bmFtZSI6ImluaXQiLCJmaXJzdG5hbWUiOiJpbml0IiwiX2lkIjoiaW5pdCJ9LCJzdGF0ZXMiOnsiaWdub3JlIjp7fSwiZGVmYXVsdCI6e30sImluaXQiOnsibGFzdG5hbWUiOnRydWUsImZpcnN0bmFtZSI6dHJ1ZSwicGFzc3dvcmQiOnRydWUsImVtYWlsIjp0cnVlLCJfaWQiOnRydWV9LCJtb2RpZnkiOnt9LCJyZXF1aXJlIjp7fX0sInN0YXRlTmFtZXMiOlsicmVxdWlyZSIsIm1vZGlmeSIsImluaXQiLCJkZWZhdWx0IiwiaWdub3JlIl19LCJwYXRoc1RvU2NvcGVzIjp7fSwiZW1pdHRlciI6eyJkb21haW4iOm51bGwsIl9ldmVudHMiOnt9LCJfZXZlbnRzQ291bnQiOjAsIl9tYXhMaXN0ZW5lcnMiOjB9LCIkb3B0aW9ucyI6dHJ1ZX0sImlzTmV3IjpmYWxzZSwiX2RvYyI6eyJsYXN0bmFtZSI6IkxhbnppbG90dG8iLCJmaXJzdG5hbWUiOiJOaWNvbGEgNzQiLCJwYXNzd29yZCI6IiQyYSQxMCRwVWdocTVJclgxMzhTOXBEY1pkbG1lcnNjVTdVOXJiNlFKaVliMXlEckljOHJDMFh6c2hUcSIsImVtYWlsIjoibGFuemlsb3R0b25pY29sYTc0QGdtYWlsLmNvbSIsIl9pZCI6IjVhYWE5MmZmNGMzYjExMDAxNGI0NzhjYiJ9LCIkaW5pdCI6dHJ1ZSwiaWF0IjoxNTM4MTIzNTcyfQ.CYnxkLbg5XWk2JWAxQg1QNGDpNgNbZAzs5PEQpLCCnI');
    /* *** USED IN PRODUCTION *** */
    headers.append('Authorization', this.TOKEN);

    return this.http
      .get(url, { headers })
      // .map((response) => response.json());
      .map(
        (response) => {
          const data = response.json();
          // Does something on data.data
          console.log('!!!! CONTACT DETAILS  - CONTACTS SERVICE * DATA * ', data);

          if (data.requests) {

            data.requests.forEach(request => {


              // ----------------------------------
              // @ Department
              // ----------------------------------
              if (request.snapshot && request.snapshot.department) {
                console.log("!!! CONTACT DETAILS  - CONTACTS SERVICE snapshot department", request.snapshot.department);
                request.department = request['snapshot']["department"]

              } else if (request.department) {
                request.department = request.department
              }

            })
          }

          return data;
        })
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
