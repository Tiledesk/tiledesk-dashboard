import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { AuthService } from '../core/auth.service';
@Injectable()

export class AppStoreService {

  http: Http;
  TOKEN: string;
  APPS_URL = "https://tiledesk-apps.herokuapp.com/api/apps?sort=score";
  APPS_BASE_URL = "https://tiledesk-apps.herokuapp.com/"
  constructor(
    http: Http,
    private httpClient: HttpClient,
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

  public getApps() {
    let url = this.APPS_URL;
  

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  public getAppDetail(appId) {

    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    })

    return this.http.get("https://tiledesk-apps.herokuapp.com/api/apps/" + appId)
  }

  getInstallation(projectId) {
    let promise = new Promise((resolve, reject) => {
      
      let headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })

      this.httpClient.get(this.APPS_BASE_URL + 'api/installation/' + projectId, { headers: headers })
          .toPromise().then((res) => {
            resolve(res);
          }).catch((err) => {
            reject(err);
          })
    })
    return promise;
  }


}
