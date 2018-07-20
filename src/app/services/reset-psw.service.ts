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


  getUserByResetpswrequestidAndResetPsw(reset_psw_request_id: string, newpsw: string) {
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
}
