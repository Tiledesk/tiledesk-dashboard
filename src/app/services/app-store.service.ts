import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { map } from 'rxjs/operators';

@Injectable()

export class AppStoreService {

  http: Http;

  constructor(
    http: Http

  ) {
    this.http = http;

  }



  getApps() {
    // const url = '/assets/mock-data/apps.json';
    // const url =  "https://lightgreymountainousscreenscraper--five-nine.repl.co/apps"
    const url =  "https://tiledesk-apps.herokuapp.com/api/apps?sort=score"
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    return this.http
      .get(url, { headers })
      .pipe(map((response: any) => {
        return response.json();
      }
      ));
  }

}
