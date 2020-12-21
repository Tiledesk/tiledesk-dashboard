import { Observable } from 'rxjs';
import { AppConfigService } from './app-config.service';
import { AuthService } from './../core/auth.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class WebhookService {
  
  SERVER_BASE_PATH: string;
  user: any;
  projectID: string;
  TOKEN: string;

  constructor(
    private http: HttpClient,
    public auth: AuthService,
    public appConfigService: AppConfigService
  ) {

    this.getToken()
    this.getCurrentProject();
    this.getAppConfig();
  }

  getToken() {
    this.auth.user_bs.subscribe((user) => {
      if (user) {
        this.TOKEN = user.token;
        console.log("WebhookService: User is signed in")
      } else {
        console.log("WebhookService: No user is signed in");
      }
    })
  }

  getCurrentProject() {
    console.log('============ PROJECT SERVICE - SUBSCRIBE TO CURRENT PROJ ============');

    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.projectID = project._id;
        console.log('WebhookService: ID PROJECT ', this.projectID)
      } else {
        console.log('WebhookService: NO PROJECT SELECTED')
      }
    })
  }

  getAppConfig() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    console.log('AppConfigService getAppConfig (WEBHOOK-SERV) SERVER_BASE_PATH ', this.SERVER_BASE_PATH);
  }

  // GET ALL SUBSCRIPTION FOR PROJECT ID
  getAllSubscriptions(): Observable<[]> {
    console.log('GET ALL SUBSCRIPTION FOR PROJECT ID: ', this.projectID);
    console.log('AUTH TOKEN: ', this.TOKEN);
    let headers = new HttpHeaders({
      'Authorization': this.TOKEN
    })

    return this.http.get<[]>(this.SERVER_BASE_PATH + this.projectID + '/subscriptions', {headers: headers});
  }

  // GET SUBSCRIPTION BY ID
  getSubscritionById(subscriptionID): Observable<[]> {
    console.log('GET SUBSCRIPTION WITH ID: ', subscriptionID, ' FOR PROJECT ID: ', this.projectID);
    console.log('AUTH TOKEN: ', this.TOKEN);

    let headers = new HttpHeaders({
      'Authorization': this.TOKEN
    })

    return this.http.get<[]>(this.SERVER_BASE_PATH + this.projectID + '/subscriptions/' + subscriptionID, {headers: headers})
  }

  // CREATE NEW SUBSCRIPTION
  createNewSubscription(target, event): Observable<[]> {
    console.log('ADD NEW SUBSCRIPTION FOR PROJECT ID: ', this.projectID);
    console.log('AUTH TOKEN: ', this.TOKEN);

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    })
    
    let data = {
      target: target,
      event: event
    }

    return this.http.post<[]>(this.SERVER_BASE_PATH + this.projectID + '/subscriptions', JSON.stringify(data), {headers: headers});            
  }

  updateSubscription(subscriptionID, target, event): Observable<[]> {
    console.log('UPDATE SUBSCRIPTION WITH ID: ', subscriptionID, ' FOR PROJECT ID: ', this.projectID);
    console.log('AUTH TOKEN: ', this.TOKEN);

    let headers = new HttpHeaders({
      'Content-type': 'application/json',
      'Authorization': this.TOKEN,
    })

    let data = {
      target: target,
      event: event
    }

    return this.http.put<[]>(this.SERVER_BASE_PATH + this.projectID + '/subscriptions/' + subscriptionID, data, {headers: headers});
  }

  // DELETE SUBSCRIPTION
  deleteSubscription(subscriptionID): Observable<[]> {
    console.log('DELETE SUBSCRIPTION WITH ID: ', subscriptionID, ' FOR PROJECT ID: ', this.projectID);
    console.log('AUTH TOKEN: ', this.TOKEN);

    let headers = new HttpHeaders({
      'Authorization': this.TOKEN
    })

    return this.http.delete<[]>(this.SERVER_BASE_PATH + this.projectID + '/subscriptions/' + subscriptionID, {headers: headers});
  }

  
}
