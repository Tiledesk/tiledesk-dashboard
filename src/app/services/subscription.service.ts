import { Injectable } from '@angular/core';

import { Http, Headers, RequestOptions } from '@angular/http';
@Injectable()

export class SubscriptionService {
  http: Http;
  projectID: string;
  constructor(
    http: Http,

  ) {
    this.http = http;

  }


}
