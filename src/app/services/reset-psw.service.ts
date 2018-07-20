import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { User } from '../models/user-model';

@Injectable()
export class ResetPswService {
  http: Http;

  REQUEST_RESET_PSW_URL = environment.mongoDbConfig.REQUEST_RESET_PSW;
  RESET_PSW_BASE_URL =  environment.mongoDbConfig.RESET_PSW;
  CHECK_PSW_RESET_KEY_BASE_URL = environment.mongoDbConfig.CHECK_PSW_RESET_KEY;
  constructor(
    http: Http,
  ) {
    this.http = http;
  }


  sendResetPswEmailAndUpdateUserWithResetPswRequestId(user_email: string): Observable<User[]> {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    const options = new RequestOptions({ headers });

    const url = this.REQUEST_RESET_PSW_URL;

    console.log('PSW RESET URL ', url)

    const body = { 'email': user_email };

    return this.http
      // .get(url, { headers })
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }


  getUserByResetPswRequestIdAndResetPsw(reset_psw_request_id: string, newpsw: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    const options = new RequestOptions({ headers });

    const url = this.RESET_PSW_BASE_URL + reset_psw_request_id;
    console.log('PSW RESET URL ', url)

    const body = { 'password': newpsw };

    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }



  // GETTING THE USER BY THE REQUEST ID IF THE USER NOT EXIST MEANS THAT THE USER HAS ALREADY USED THE LINK
  // THE LINK IS NO MORE VALID AND HAS PRESSEN ON THE BUTTON 'RESET PSW'
  // IN FACT resetpswrequestid IS RESET WHEN THE USER ON THE BUTTON 'RESET PSW'
  getUserByPswRequestId(reset_psw_request_id: string ) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');

    const url = this.CHECK_PSW_RESET_KEY_BASE_URL + reset_psw_request_id;
    console.log('GET USER BY PSW REQUEST ID ', url)
    return this.http
    .get(url, { headers })
    .map((response) => response.json());
  }


}
