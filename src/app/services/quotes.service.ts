import { Injectable } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { LoggerService } from './logger/logger.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfigService } from './app-config.service';
import { PLANS_LIST, PLAN_NAME } from 'app/utils/util';

@Injectable({
  providedIn: 'root'
})
export class QuotesService {

  user: any;
  project_id: string;
  TOKEN: string;
  SERVER_BASE_PATH: string;

  constructor(
    public auth: AuthService,
    private logger: LoggerService,
    private http: HttpClient,
    public appConfigService: AppConfigService
  ) { 
    this.user = auth.user_bs.value
    this.checkIfUserExistAndGetToken()

    this.auth.user_bs.subscribe((user) => {
      this.user = user;
      this.checkIfUserExistAndGetToken()
    });
    this.getCurrentProject();
    this.getAppConfig();
  }

  checkIfUserExistAndGetToken() {
    if (this.user) {
      this.TOKEN = this.user.token
    } else {
      this.logger.log('[QUOTE-SERVICE] - No user signed in');
    }
  }

  getAppConfig() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      this.logger.log("[QUOTE-SERVICE] - getCurrentProject project: ", project);
      if (project) {
        this.logger.log("QUOTE-SERVICE] project._id: ", project._id);
        this.project_id = project._id
      }
    }, (error) => {
      this.logger.error('[QUOTE-SERVICE] - get current project ERROR: ', error);
    }, () => {
      this.logger.log('[QUOTE-SERVICE] - get current project *COMPLETE*');
    });
  }

  getAllQuotes(project_id) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };
    const url = this.SERVER_BASE_PATH + project_id + "/quotes";
    this.logger.log('[QUOTE-SERVICE] - GET ALL QUOTES URL', url);

    const data = {
      createdAt: new Date()
    }

    return this.http
      .post(url, data, httpOptions)
  }

  getProjectQuotes(project_id: string) {

    return new Promise((resolve, reject) => {
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': this.TOKEN
        })  
      }

      const url = this.SERVER_BASE_PATH + "projects/" + project_id;
      this.logger.log('[QUOTE-SERVICE] - GET ALL QUOTES URL', url);

      this.http.get(url, httpOptions)
          .toPromise().then( async (project: any) => {
            let limits = await this.getQuoteLimits(project);
            resolve(limits)
          }).catch((err) => {
            reject(false);
          })
    })

  }

  async getQuoteLimits(project) {
    let limits;

    if (project.profile.type === 'payment') {

      if (project.isActiveSubscription === false) {
        limits = PLANS_LIST.Sandbox;
        return limits;
      }

      let plan = project.profile.name;

      switch(plan) {
        case PLAN_NAME.A:
          plan = PLAN_NAME.D;
          break;
        case PLAN_NAME.B:
          plan = PLAN_NAME.E
          break;
        case PLAN_NAME.C:
          plan = PLAN_NAME.F
          break;
      }

      limits = PLANS_LIST[plan];

      if (project.profile.quotes) {
        let profile_quotes = project?.profile?.quotes;
        const merged_quotes = Object.assign({}, limits, profile_quotes);
        return merged_quotes;
      } else {
          return limits;
      }
    } else {

      if (project.trialExpired === true) {
        limits = PLANS_LIST.Sandbox;
        return limits;
      } else {
        limits = PLANS_LIST.FREE_TRIAL;
        return limits;
      }
    }
  }
  
}
