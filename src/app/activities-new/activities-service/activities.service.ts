import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from 'app/services/app-config.service';
import { Observable } from 'rxjs';
import { LoggerService } from '../../services/logger/logger.service';
import { ActivitiesListResponse } from '../../models/activity-model';

@Injectable()
export class ActivitiesService {

  ACTIVITIES_URL: any;
  SERVER_BASE_PATH: string;
  TOKEN: string;
  projectID: string;

  constructor(
    private _httpClient: HttpClient,
    private auth: AuthService,
    public appConfigService: AppConfigService,
    private logger: LoggerService
  ) {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    this.TOKEN = auth.user_bs.value.token;
    this.getCurrentProjectAndBuildUrl();
  }

  getCurrentProjectAndBuildUrl() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.projectID = project._id;
        this.ACTIVITIES_URL = this.SERVER_BASE_PATH + project._id + '/activities';
      }
    });
  }

  public getUsersActivities(querystring: string, pagenumber: number): Observable<ActivitiesListResponse> {
    let _querystring = '&' + querystring;
    if (querystring === undefined || !querystring) {
      _querystring = '';
    }

    const url = this.ACTIVITIES_URL + '?page=' + pagenumber + _querystring;
    this.logger.log('[ACTIVITIES-SERV] - GET ACTIVITIES - URL ', url);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };
    return this._httpClient.get<ActivitiesListResponse>(url, httpOptions);
  }

  public downloadActivitiesAsCsv(querystring: string, pagenumber: number, language: string) {
    let _querystring = '&' + querystring;
    if (querystring === undefined || !querystring) {
      _querystring = '';
    }

    const url = this.ACTIVITIES_URL + '/csv?page=' + pagenumber + _querystring + '&lang=' + language;
    this.logger.log('[ACTIVITIES-SERV] - DOWNLOAD ACTIVITIES CSV - URL ', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN,
      }),
      responseType: 'text' as 'json'
    };

    return this._httpClient.get(url, httpOptions);
  }
}
