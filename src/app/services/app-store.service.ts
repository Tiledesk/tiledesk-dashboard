import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../core/auth.service';
import { LoggerService } from '../services/logger/logger.service';
import { BehaviorSubject } from 'rxjs';
import { AppConfigService } from './app-config.service';
@Injectable()

export class AppStoreService {
  public requestHasChanged$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null)
  public hasOpenAppsSidebar$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null)
  // http: Http;
  TOKEN: string;
  TOKEN_NO_JWT_SUBSTRING: string;
  userID: string;
  // APPS_URL = "https://tiledesk-apps.herokuapp.com/api/apps?sort=score";
  // APPS_BASE_URL = "https://tiledesk-apps.herokuapp.com/"
  APPS_URL: string;
  APPS_BASE_URL: string;
  constructor(
    // http: Http,
    private _httpClient: HttpClient,
    public auth: AuthService,
    private logger: LoggerService,
    public appConfigService: AppConfigService
  ) {
    this.APPS_BASE_URL = this.appConfigService.getConfig().appsUrl;
    this.APPS_URL = this.APPS_BASE_URL + "api/apps?sort=score"
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

  hasOpenAppsSidebar(hasOpen) {
    // console.log('[APP-STORE-SERVICE] HAS OPEN APP SIDEABR');
    this.hasOpenAppsSidebar$.next(true)
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

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };
    return this._httpClient
      .get(url, httpOptions)
  }

  public getAppDetail(appId) {
    const url = this.APPS_BASE_URL + "api/apps/" + appId
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    return this._httpClient.get(url, httpOptions)
  }

  getInstallation(projectId) {
    let promise = new Promise((resolve, reject) => {

      let headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })

      this._httpClient.get(this.APPS_BASE_URL + 'api/installation/' + projectId, { headers: headers })
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

      this._httpClient.get(this.APPS_BASE_URL + 'api/installation/' + projectId + '?returnapp=true', { headers: headers })
        .toPromise().then((res) => {
          resolve(res);
        }).catch((err) => {
          reject(err);
        })
    })
    return promise;
  }

  public installAppVersionTwo(project_id: string, appId: string) {


    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN_NO_JWT_SUBSTRING
      })
    };

    const url = this.APPS_BASE_URL + "api/installation"
    this.logger.log('[APP-STORE-SERVICE] INSTALL V2 APP - url', url);

    const body = { project_id: project_id, app_id: appId, createdAt: Date.now() }

    this.logger.log('[APP-STORE-SERVICE] INSTALL V2 APP - body  ', body);

    return this._httpClient
      .post(url, body, httpOptions)

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

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN_NO_JWT_SUBSTRING
      })
    };

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

    return this._httpClient
      .post(url, body, httpOptions)
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

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN_NO_JWT_SUBSTRING
      })
    };

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

    return this._httpClient
      .put(url, body, httpOptions)
  }

  unistallNewApp(projectId: string, appId: string) {
    let url = this.APPS_BASE_URL + "api/installation/" + projectId + '/' + appId
    this.logger.log('[APP-STORE-SERVICE] UNINSTALL NEW APP URL ', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };
    return this._httpClient
      .delete(url, httpOptions)
  }

  deleteNewApp(appId: string) {
    let url = this.APPS_BASE_URL + "api/apps/" + appId
    this.logger.log('[APP-STORE-SERVICE] UNINSTALL NEW APP URL ', url);
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    return this._httpClient
      .delete(url, httpOptions)
  }



}
