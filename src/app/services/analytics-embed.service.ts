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

export type AnalyticsKbChartId = 'answered' | 'unanswered' | 'answer-rate';

/** postMessage payload when a KB sparkline title is clicked in the dashboard. */
export interface AnalyticsKbChartClickMessage {
  type: 'ANALYTICS_KB_CHART_CLICK';
  source: 'knowledge-bases';
  chartId: AnalyticsKbChartId;
  kbId: string;
  projectId: string;
  /** UTC ISO range, same as analytics charts API (`from` inclusive, `to` exclusive). */
  from: string;
  to: string;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsEmbedService {
  private pendingKbChartClick: AnalyticsKbChartClickMessage | null = null;

  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
    private logger: LoggerService
  ) {}

  /** Queue a KB chart click to forward to the analytics iframe after navigation. */
  queueKbChartClick(payload: {
    chartId: AnalyticsKbChartId;
    kbId: string;
    projectId: string;
    from: string;
    to: string;
  }): void {
    this.pendingKbChartClick = {
      type: 'ANALYTICS_KB_CHART_CLICK',
      source: 'knowledge-bases',
      ...payload,
    };
  }

  /** Read and clear a queued KB chart click (one-shot). */
  consumePendingKbChartClick(): AnalyticsKbChartClickMessage | null {
    const pending = this.pendingKbChartClick;
    this.pendingKbChartClick = null;
    return pending;
  }

  /** Target origin for postMessage to the analytics embed iframe. */
  getEmbedPostMessageTargetOrigin(): string {
    const embedBase = this.appConfigService.getConfig()?.analyticsEmbedBase as string | undefined;
    if (!embedBase) {
      return '*';
    }
    try {
      const origin = new URL(embedBase, window.location.origin).origin;
      return origin && origin !== 'null' ? origin : '*';
    } catch {
      return '*';
    }
  }

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

  /** RFC 6750 Bearer header for analytics API calls from dashboard services. */
  authorizationHeaderFromTiledeskToken(tiledeskJwt: string): string {
    const bare = this.bareJwtFromTiledeskAuthValue(tiledeskJwt);
    return bare ? `Bearer ${bare}` : '';
  }

  private tiledeskAuthorizationHeader(tiledeskJwt: string): string {
    return this.authorizationHeaderFromTiledeskToken(tiledeskJwt);
  }

  /** Bearer header for analytics API routes that accept the embed token (charts, etc.). */
  authorizationHeaderFromEmbedToken(embedToken: string): string {
    const bare = (embedToken ?? '').trim();
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
