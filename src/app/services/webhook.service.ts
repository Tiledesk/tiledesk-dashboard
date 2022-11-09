import { Observable } from 'rxjs';
import { AppConfigService } from './app-config.service';
import { AuthService } from './../core/auth.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoggerService } from '../services/logger/logger.service';
@Injectable()
export class WebhookService {

  SERVER_BASE_PATH: string;
  user: any;
  projectID: string;
  TOKEN: string;

  constructor(
    private http: HttpClient,
    public auth: AuthService,
    public appConfigService: AppConfigService,
    private logger: LoggerService
  ) {
    this.getToken()
    this.getCurrentProject();
    this.getAppConfigAndBuildUrl();
  }

  getToken() {
    this.auth.user_bs.subscribe((user) => {
      if (user) {
        this.TOKEN = user.token;
        this.logger.log("[WEBHOOK-SERV] User is signed in")
      } else {
        // this.logger.log("[WEBHOOK-SERV] No user is signed in");
      }
    })
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.projectID = project._id;
        this.logger.log('[WEBHOOK-SERV] ID PROJECT ', this.projectID)
      } else {
        // this.logger.log('[WEBHOOK-SERV]: NO PROJECT SELECTED')
      }
    })
  }

  getAppConfigAndBuildUrl() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    this.logger.log('[WEBHOOK-SERV] - SERVER_BASE_PATH ', this.SERVER_BASE_PATH);
  }

  // --------------------------------------------
  // GET ALL VEBHOOK SUBSCRIPTIONS FOR PROJECT ID
  // --------------------------------------------
  getAllSubscriptions(): Observable<[any]> {
    this.logger.log('[WEBHOOK-SERV] - GET ALL SUBSCRIPTION FOR PROJECT ID: ', this.projectID);

    const url = this.SERVER_BASE_PATH + this.projectID + '/subscriptions';
    this.logger.log('[WEBHOOK-SERV] - GET ALL SUBSCRIPTION FOR PROJECT ID URL: ', url);

    let headers = new HttpHeaders({
      'Authorization': this.TOKEN
    })

    return this.http
      .get<[any]>(url, { headers: headers });
  }


  /**
   * GET WEBHOOK SUBSCRIPTION BY ID
   * @param subscriptionID 
   * @returns 
   */
  getWHSubscritionById(subscriptionID): Observable<[any]> {
    this.logger.log('[WEBHOOK-SERV] - GET SUBSCRIPTION BY ID - subscriptionID: ', subscriptionID, ' - PROJECT ID: ', this.projectID);

    const url = this.SERVER_BASE_PATH + this.projectID + '/subscriptions/' + subscriptionID;
    this.logger.log('[WEBHOOK-SERV] - GET SUBSCRIPTION BY ID URL: ', url);

    let headers = new HttpHeaders({
      'Authorization': this.TOKEN
    })

    return this.http
      .get<[any]>(url, { headers: headers })
  }

  /**
   * CREATE NEW WEBHOOK SUBSCRIPTION
   * @param target 
   * @param event 
   * @returns 
   */
  createNewSubscription(target, event): Observable<[any]> {
    this.logger.log('[WEBHOOK-SERV] - ADD NEW SUBSCRIPTION FOR PROJECT ID: ', this.projectID);

    const url = this.SERVER_BASE_PATH + this.projectID + '/subscriptions';
    this.logger.log('[WEBHOOK-SERV] - ADD NEW SUBSCRIPTION - URL: ', url);

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    })

    let data = { target: target, event: event }
    this.logger.log('[WEBHOOK-SERV] - ADD NEW SUBSCRIPTION - BODY: ', data);

    return this.http
      .post<[any]>(url, JSON.stringify(data), { headers: headers });
  }

  /**
   * UPDATE WEBHOOK SUBSCRIPTION
   * @param subscriptionID 
   * @param target 
   * @param event 
   * @returns 
   */
  updateSubscription(subscriptionID, target, event): Observable<[any]> {
    this.logger.log('[WEBHOOK-SERV] - UPDATE SUBSCRIPTION WITH ID: ', subscriptionID, ' FOR PROJECT ID: ', this.projectID);

    const url = this.SERVER_BASE_PATH + this.projectID + '/subscriptions/' + subscriptionID;
    this.logger.log('[WEBHOOK-SERV] - UPDATE SUBSCRIPTION PUT URL: ', url);

    let headers = new HttpHeaders({
      'Content-type': 'application/json',
      'Authorization': this.TOKEN,
    })

    let data = { target: target, event: event }
    this.logger.log('[WEBHOOK-SERV] - UPDATE SUBSCRIPTION BODY: ', data);

    return this.http
      .put<[any]>(url, data, { headers: headers });
  }


  /**
   * DELETE SUBSCRIPTION
   * @param subscriptionID 
   * @returns 
   */
  deleteSubscription(subscriptionID): Observable<[any]> {
    this.logger.log('[WEBHOOK-SERV] - DELETE SUBSCRIPTION WITH ID: ', subscriptionID, ' FOR PROJECT ID: ', this.projectID);

    const url = this.SERVER_BASE_PATH + this.projectID + '/subscriptions/' + subscriptionID
    this.logger.log('[WEBHOOK-SERV] - DELETE SUBSCRIPTION URL: ', url);

    let headers = new HttpHeaders({
      'Authorization': this.TOKEN
    })

    return this.http
      .delete<[any]>(url, { headers: headers });
  }


}
