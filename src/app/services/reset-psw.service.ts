import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { User } from '../models/user-model';

@Injectable()
export class ResetPswService {
  http: Http;

  PSW_RESET_REQUEST_URL = environment.mongoDbConfig.PSW_RESET_REQUEST;
  constructor(
    http: Http,
  ) {
    this.http = http;
  }


  resetPswRequest(user_email: string): Observable<User[]> {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    const options = new RequestOptions({ headers });

    const url = this.PSW_RESET_REQUEST_URL;

    console.log('PSW RESET URL ', url)

    const body = { 'email': user_email };

    return this.http
      // .get(url, { headers })
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }
}
