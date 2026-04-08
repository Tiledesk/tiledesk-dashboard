import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AppConfigService } from './app-config.service';
import { LoggerService } from './logger/logger.service';

export interface EmbedTokenResponse {
  token: string;
  expires_in: number;
  type: string;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsEmbedService {
  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
    private logger: LoggerService
  ) {}

  /** Base URL of the analytics API host (e.g. https://host/analyticsapi — no trailing slash). */
  private get analyticsApiBase(): string {
    const c = this.appConfigService.getConfig();
    const base = c?.analyticsApiBase;
    return typeof base === 'string' ? base.replace(/\/+$/, '') : '';
  }

  /**
   * Tiledesk stores user.token as "JWT &lt;jwt&gt;". Embed API expects RFC 6750 Bearer with the JWT only.
   */
  private bareJwtFromTiledeskAuthValue(value: string): string {
    let s = (value ?? '').trim();
    if (/^jwt\s+/i.test(s)) {
      s = s.replace(/^jwt\s+/i, '');
    } else if (/^bearer\s+/i.test(s)) {
      s = s.replace(/^bearer\s+/i, '');
    }
    return s.trim();
  }

  private tiledeskAuthorizationHeader(tiledeskJwt: string): string {
    const bare = this.bareJwtFromTiledeskAuthValue(tiledeskJwt);
    return bare ? `Bearer ${bare}` : '';
  }

  getEmbedToken(projectId: string, tiledeskJwt: string): Observable<EmbedTokenResponse> {
    const base = this.analyticsApiBase;
    if (!base) {
      return throwError(() => new Error('analyticsApiBase is not configured'));
    }
    const url = `${base}/api/v1/embed-token`;
    const headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: this.tiledeskAuthorizationHeader(tiledeskJwt)
    });
    this.logger.log('[AnalyticsEmbedService] POST embed-token', url);
    return this.http.post<EmbedTokenResponse>(url, { id_project: projectId }, { headers });
  }
}
