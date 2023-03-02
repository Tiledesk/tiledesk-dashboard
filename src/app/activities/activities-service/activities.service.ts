import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from 'app/services/app-config.service';
import { Observable } from 'rxjs';
import { Activity } from '../../models/activity-model';
import { LoggerInstance } from 'app/services/chat21-core/providers/logger/loggerInstance';
import { LoggerService } from 'app/services/chat21-core/providers/abstract/logger.service';
@Injectable()
export class ActivitiesService {

  ACTIVITIES_URL: any;
  SERVER_BASE_PATH: string;
  TOKEN: string;
  projectID: string;

  private logger: LoggerService = LoggerInstance.getInstance();

  /**
   * 
   * @param _httpClient 
   * @param auth 
   * @param appConfigService 
   * @param logger 
   */
  constructor(
    private _httpClient: HttpClient,
    private auth: AuthService,
    public appConfigService: AppConfigService,
  ) {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    this.TOKEN = auth.user_bs.value.token;
    this.getCurrentProjectAndBuildUrl();
  }


  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------
  getCurrentProjectAndBuildUrl() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {
        this.projectID = project._id
        this.ACTIVITIES_URL = this.SERVER_BASE_PATH + project._id + '/activities';
      }
    });
  }

  /**
    * Get Teammates activities
    * @param querystring 
    * @param pagenumber 
    * @returns 
    */
  public getUsersActivities(querystring: string, pagenumber: number): Observable<Activity[]> {
    let _querystring = '&' + querystring
    if (querystring === undefined || !querystring) {
      _querystring = ''
    }

    const url = this.ACTIVITIES_URL + '?page=' + pagenumber + _querystring;

    this.logger.log('[ACTIVITIES-SERV] - GET ACTIVITIES - URL ', url);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };
    return this._httpClient.get<Activity[]>(url, httpOptions);
  }


}
