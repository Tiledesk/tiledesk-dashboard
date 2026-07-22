import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from 'app/services/app-config.service';
import { Observable, throwError } from 'rxjs';
import { LoggerService } from '../../services/logger/logger.service';
import { ActivitiesListResponse } from '../../models/activity-model';

@Injectable()
export class ActivitiesService {

  constructor(
    private _httpClient: HttpClient,
    private auth: AuthService,
    public appConfigService: AppConfigService,
    private logger: LoggerService
  ) { }

  /** Build URL at request time so project/config are ready (avoids empty first load). */
  private resolveActivitiesBaseUrl(): string | null {
    const project = this.auth.project_bs?.value;
    const serverBasePath = this.appConfigService.getConfig()?.SERVER_BASE_URL;
    if (!project?._id || !serverBasePath) {
      this.logger.error('[ACTIVITIES-SERV] Missing project or SERVER_BASE_URL', {
        hasProject: !!project?._id,
        serverBasePath,
      });
      return null;
    }
    return serverBasePath + project._id + '/activities';
  }

  private resolveAuthHeaders(): HttpHeaders | null {
    const token = this.auth.user_bs?.value?.token;
    if (!token) {
      this.logger.error('[ACTIVITIES-SERV] Missing auth token');
      return null;
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
  }

  public getUsersActivities(querystring: string, pagenumber: number): Observable<ActivitiesListResponse> {
    const activitiesUrl = this.resolveActivitiesBaseUrl();
    const httpHeaders = this.resolveAuthHeaders();
    if (!activitiesUrl || !httpHeaders) {
      return throwError(() => new Error('Activities request prerequisites not ready'));
    }

    let _querystring = '&' + querystring;
    if (querystring === undefined || !querystring) {
      _querystring = '';
    }

    const url = activitiesUrl + '?page=' + pagenumber + _querystring;
    this.logger.log('[ACTIVITIES-SERV] - GET ACTIVITIES - URL ', url);
    return this._httpClient.get<ActivitiesListResponse>(url, { headers: httpHeaders });
  }

  public downloadActivitiesAsCsv(querystring: string, pagenumber: number, language: string) {
    const activitiesUrl = this.resolveActivitiesBaseUrl();
    const httpHeaders = this.resolveAuthHeaders();
    if (!activitiesUrl || !httpHeaders) {
      return throwError(() => new Error('Activities CSV request prerequisites not ready'));
    }

    let _querystring = '&' + querystring;
    if (querystring === undefined || !querystring) {
      _querystring = '';
    }

    const url = activitiesUrl + '/csv?page=' + pagenumber + _querystring + '&lang=' + language;
    this.logger.log('[ACTIVITIES-SERV] - DOWNLOAD ACTIVITIES CSV - URL ', url);

    return this._httpClient.get(url, {
      headers: httpHeaders,
      responseType: 'text' as 'json'
    });
  }
}
