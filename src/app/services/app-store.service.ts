import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { map } from 'rxjs/operators';
import { AuthService } from '../core/auth.service';
@Injectable()

export class AppStoreService {

  http: Http;
  TOKEN: string;
  APPS_URL = "https://tiledesk-apps.herokuapp.com/api/apps?sort=score";

  constructor(
    http: Http,
    public auth: AuthService,
  ) {
    this.http = http;

    this.getToken();
  }

  getToken() {
    this.auth.user_bs.subscribe((user) => {
      if (user) {
        this.TOKEN = user.token
      }
    });
  }



  // _getApps() {
  //   // const url = '/assets/mock-data/apps.json';
  //   // const url =  "https://lightgreymountainousscreenscraper--five-nine.repl.co/apps"
  //   const url = "https://tiledesk-apps.herokuapp.com/api/apps?sort=score"
  //   const headers = new Headers();
  //   headers.append('Content-Type', 'application/json');

  //   return this.http
  //     .get(url, { headers })
  //     .pipe(map((response: any) => {
  //       return response.json();
  //     }
  //     ));
  // }


  public getApps() {
    let url = this.APPS_URL;
  

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

}
