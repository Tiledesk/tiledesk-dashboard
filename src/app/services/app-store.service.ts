import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { AuthService } from '../core/auth.service';
import { map } from 'rxjs/operators';

@Injectable()

export class AppStoreService {

  http: Http;
  TOKEN: string;
  TOKEN_NO_JWT_SUBSTRING: string;
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
        const TOKEN_NO_SPACES = user.token.replace(/ /g, '')
        // console.log('TOKEN_NO_SPACES ', TOKEN_NO_SPACES) 
        this.TOKEN_NO_JWT_SUBSTRING = TOKEN_NO_SPACES.replace('JWT', '');
        // console.log('TOKEN_NO_JWT_SUBSTRING ', this.TOKEN_NO_JWT_SUBSTRING) 
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

    return this.http.get(this.APPS_BASE_URL + "/api/apps/" + appId)
    // return this.http.get("https://tiledesk-apps.herokuapp.com/api/apps/" + appId)
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

  // where: selectedClient,
  public createNewApp(
    app_icon_url: string,
    app_name: string,
    app_description: string,
    install_action_type: string,
    app_installation_url: string,
    app_learn_more_url: string,
    app_status: string,
    user_id: string,
    selectedClient: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN_NO_JWT_SUBSTRING);
    const options = new RequestOptions({ headers });
    const url = this.APPS_BASE_URL + "api/apps"
    console.log('[APP-STORE-SERVICE] CREATE NEW APP URL ', url);

    const body = {
      logo: app_icon_url,
      title: app_name,
      description: app_description,
      installActionType: install_action_type,
      installActionURL: app_installation_url,
      learnmore: app_learn_more_url,
      status: app_status,
      visibleForUserIds: [user_id],
      createdBy: "test",
      updatedBy: "test"
    };

    console.log('[APP-STORE-SERVICE] CREATE NEW APP BODY ', body);



    return this.http
      .post(url, body, options)
      .map((res) => res.json());

  }



  // where: selectedClient,
  public _createNewApp(
    app_icon_url: string,
    app_name: string,
    app_description: string,
    install_action_type: string,
    app_installation_url: string,
    app_learn_more_url: string,
    app_status: string,
    user_id: string,
    selectedClient: string) {
    const url = this.APPS_BASE_URL + "api/apps"
    console.log('[TILEDESK-SERVICE] - CREATE NEW APP - URL ', url);
    const headers = { 'Authorization': this.TOKEN, 'Content-Type': 'application/json' };


    const body = {
      logo: app_icon_url,
      title: app_name,
      description: app_description,
      installActionType: install_action_type,
      installActionURL: app_installation_url,
      learnmore: app_learn_more_url,
      status: app_status,
      visibleForUserIds: [user_id],
      where: selectedClient,
      createdBy: "test",
      updatedBy: "test"
    };
    console.log('[TILEDESK-SERVICE] - CREATE NEW APP - body ', body);
    return this.httpClient
      .post(url, body, { headers })
      .pipe(map((res: any) => {
        console.log('[TILEDESK-SERVICE] - CREATE NEW PROJECT USER TO GET NEW LEAD ID url ', res);
        return res
      }))
  }

}
