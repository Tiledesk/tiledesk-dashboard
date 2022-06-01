import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { AuthService } from '../core/auth.service';
import { map } from 'rxjs/operators';
import { LoggerService } from '../services/logger/logger.service';
import { BehaviorSubject } from 'rxjs';
@Injectable()

export class AppStoreService {
  public requestHasChanged$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null)
  http: Http;
  TOKEN: string;
  TOKEN_NO_JWT_SUBSTRING: string;
  userID: string;
  APPS_URL = "https://tiledesk-apps.herokuapp.com/api/apps?sort=score";
  APPS_BASE_URL = "https://tiledesk-apps.herokuapp.com/"
  constructor(
    http: Http,
    private httpClient: HttpClient,
    public auth: AuthService,
    private logger: LoggerService
    
  ) {
    this.http = http;

    this.getToken();
  }


  requestObjctHasChanged() {
    // console.log('[APP-STORE-SERVICE] requestObjctHasChanged');
    this.requestHasChanged$.next(true)
  }

  setRequestHaChangedToNull() {
    // console.log('[APP-STORE-SERVICE] HAS CLOSED APP SIDEABR');
    this.requestHasChanged$.next(null)
  }


  getToken() {
    this.auth.user_bs.subscribe((user) => {
      if (user) {
        this.TOKEN = user.token
        const TOKEN_NO_SPACES = user.token.replace(/ /g, '')
        // console.log('TOKEN_NO_SPACES ', TOKEN_NO_SPACES) 
        this.TOKEN_NO_JWT_SUBSTRING = TOKEN_NO_SPACES.replace('JWT', '');
        // console.log('TOKEN_NO_JWT_SUBSTRING ', this.TOKEN_NO_JWT_SUBSTRING) 
        this.userID = user._id
        // console.log('[APP-STORE-SERVICE] userID ', this.userID)
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

    return this.http.get(this.APPS_BASE_URL + "api/apps/" + appId)
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

  getInstallationWithApp(projectId) {
    let promise = new Promise((resolve, reject) => {

      let headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })

      this.httpClient.get(this.APPS_BASE_URL + 'api/installation/' + projectId + '?returnapp=true', { headers: headers })
        .toPromise().then((res) => {
          resolve(res);
        }).catch((err) => {
          reject(err);
        })
    })
    return promise;
  }

  public installAppVersionTwo(project_id: string, appId: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN_NO_JWT_SUBSTRING);
    const options = new RequestOptions({ headers });

    const url = this.APPS_BASE_URL + "api/installation"
    this.logger.log('[APP-STORE-SERVICE] INSTALL V2 APP - url', url);

    const body = { project_id: project_id, app_id: appId, createdAt: Date.now(), }

    this.logger.log('[APP-STORE-SERVICE] INSTALL V2 APP - body  ', body);

    return this.http
      .post(url, body, options)
      .map((res) => res.json());
  }

  // 
  public createNewApp(
    app_icon_url: string,
    app_name: string,
    app_description: string,
    install_action_type: string,
    app_installation_url: string,
    app_run_url: string,
    app_learn_more_url: string,
    app_status: string,
    user_id: string,
    clients: any) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN_NO_JWT_SUBSTRING);
    const options = new RequestOptions({ headers });

    const url = this.APPS_BASE_URL + "api/apps"
    this.logger.log('[APP-STORE-SERVICE] CREATE NEW APP URL ', url);

    const body = {
      logo: app_icon_url,
      title: app_name,
      description: app_description,
      installActionType: install_action_type,
      installActionURL: app_installation_url,
      runURL: app_run_url,
      learnMore: app_learn_more_url,
      status: app_status,
      visibleForUserIds: [user_id],
      where: clients,
      version: 'v2'
    };

    this.logger.log('[APP-STORE-SERVICE] CREATE NEW APP BODY ', body);

    return this.http
      .post(url, body, options)
      .map((res) => res.json());
  }


  public updateNewApp(
    app_id: string,
    app_icon_url: string,
    app_name: string,
    app_description: string,
    install_action_type: string,
    app_installation_url: string,
    app_run_url: string,
    app_learn_more_url: string,
    app_status: string,
    user_id: string,
    clients: any) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN_NO_JWT_SUBSTRING);
    const options = new RequestOptions({ headers });

    const url = this.APPS_BASE_URL + "api/apps/" + app_id
    this.logger.log('[APP-STORE-SERVICE] UPDATE NEW APP URL ', url);

    const body = {
      logo: app_icon_url,
      title: app_name,
      description: app_description,
      installActionType: install_action_type,
      installActionURL: app_installation_url,
      runURL: app_run_url,
      learnMore: app_learn_more_url,
      status: app_status,
      visibleForUserIds: [user_id],
      where: clients,
      version: 'v2'
    };

    this.logger.log('[APP-STORE-SERVICE] UPDATE NEW APP BODY ', body);

    return this.http
      .put(url, body, options)
      .map((res) => res.json());
  }


  unistallNewApp(projectId: string, appId: string) {
    let url = this.APPS_BASE_URL + "api/installation/" + projectId + '/' + appId
    this.logger.log('[APP-STORE-SERVICE] UNINSTALL NEW APP URL ', url);


    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });
    return this.http
      .delete(url, options)
      .map((res) => res.json());
  }

  deleteNewApp(appId: string) {
    let url = this.APPS_BASE_URL + "api/apps/" + appId
    this.logger.log('[APP-STORE-SERVICE] UNINSTALL NEW APP URL ', url);


    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });
    return this.http
      .delete(url, options)
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
  this.logger.log('[TILEDESK-SERVICE] - CREATE NEW APP - URL ', url);
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
  this.logger.log('[TILEDESK-SERVICE] - CREATE NEW APP - body ', body);
  return this.httpClient
    .post(url, body, { headers })
    .pipe(map((res: any) => {
      this.logger.log('[TILEDESK-SERVICE] - CREATE NEW PROJECT USER TO GET NEW LEAD ID url ', res);
      return res
    }))
}

}
