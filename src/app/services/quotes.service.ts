import { Injectable } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { LoggerService } from './logger/logger.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfigService } from './app-config.service';
import { PLANS_LIST, PLAN_NAME } from 'app/utils/util';
import { BehaviorSubject, Subject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class QuotesService {
  public hasOpenNavbarQuotasMenu$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public hasReachedQuotasLimitInHome$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);


  // private projectLimitsSubject = new BehaviorSubject<any>(null);
  // projectLimits$ = this.projectLimitsSubject.asObservable();

  // private allQuotasSubject = new BehaviorSubject<any>(null);
  // allQuotes$ = this.allQuotasSubject.asObservable();




  // setProjectLimits(limits: any) {
  //   this.projectLimitsSubject.next(limits);
  // }

  // getProjectLimits() {
  //   return this.projectLimitsSubject.value;
  // }

  // setAllQuotas(quotes: any) {
  //   this.allQuotasSubject.next(quotes);
  // }

  // getAllQuotas() {
  //   return this.allQuotasSubject.value;
  // }


  private quotasDataSubject = new BehaviorSubject<{ projectLimits: any; allQuotes: any } | null>(null);
  quotesData$ = this.quotasDataSubject.asObservable().pipe(shareReplay(1)); // Expose as Observable

  private requestQuotesSubject = new Subject<void>();
  requestQuotes$ = this.requestQuotesSubject.asObservable();

  private hasFetchedData = false; // Flag to track if data has been fetched

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

  /** Called by NavbarComponent to update the stored quotes */
  updateQuotasData(data: { projectLimits: any; allQuotes: any }) {
    console.log('[QUOTA-DEBUG][QUOTE-SERVICE] - PUBLISH QUOTAS DATA (Called by NavbarComponent to update the quotas)');
    this.quotasDataSubject.next(data);
    this.hasFetchedData = true; // Mark data as fetched
  }

  /** Called by HomeComponent to request Navbar to fetch quotas */
  requestQuotasUpdate() {
    // if (!this.hasFetchedData) {
      console.log('[QUOTA-DEBUG][QUOTE-SERVICE] -  Home Notify Navbar to fetch quotas data');
      this.requestQuotesSubject.next(); // Notify Navbar to fetch data
    // }
  }

  /** Resets the fetch flag (calling from navbar on  project change) */
  resetFetchStatus() {
    this.hasFetchedData = false;
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
      // console.log('[QUOTE-SERVICE] - GET ALL QUOTES URL', url);

      this.http.get(url, httpOptions)
        .toPromise().then(async (project: any) => {
          let limits = await this.getQuoteLimits(project);
          resolve(limits)
        }).catch((err) => {
          reject(false);
        })
    })
  }

  async getQuoteLimits(project) {
    this.logger.log('calling  getQuoteLimits ', project)
    let limits: any;

    if (project.profile.type === 'payment') {

      if (project.isActiveSubscription === false) {
        limits = PLANS_LIST.Sandbox;
        return limits;
      }

      let plan = project.profile.name;

      switch (plan) {
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

    } else {

      if (project.trialExpired === false) {
        limits = PLANS_LIST.FREE_TRIAL;
      } else {
        limits = PLANS_LIST.Sandbox;
      }

    }

    if (project.profile.quotes) {
      let profile_quotes = project?.profile?.quotes;
      const merged_quotes = Object.assign({}, limits, profile_quotes);
      this.logger.log('merged_quotes ', merged_quotes)
      return merged_quotes;
    } else {
      this.logger.log('merged_quotes ', limits)
      return limits;
    }
  }




  // --------------------------------------------------
  // @ Get request count
  // --------------------------------------------------
  public getQuotasCount(project_id) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.SERVER_BASE_PATH + project_id + '/requests/count?conversation_quota=true'
    this.logger.log('[QUOTAS-SERV] - getQuotasCount - URL ', url)
    return this.http.get(url, httpOptions)
  }


  hasOpenedNavbarQuotasMenu() {
    this.hasOpenNavbarQuotasMenu$.next(true)
  }
  // hasReachedQuotasLimitInHome(value) {
  //  console.log('[QUOTE-SERVICE] - hasReachedQuotasLimitInHome value ', value);
  //   this.hasReachedQuotasLimitInHome$.next(value)

  // }
}
