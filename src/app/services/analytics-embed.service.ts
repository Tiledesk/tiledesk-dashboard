import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';
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
  /** Cached embed tokens keyed by projectId + jwt fingerprint. */
  private embedTokenCache = new Map<string, { token: string; type: string; expiresAtMs: number }>();
  /** In-flight token requests so parallel callers share one POST. */
  private embedTokenInflight = new Map<string, Observable<EmbedTokenResponse>>();

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

  private embedTokenCacheKey(projectId: string, tiledeskJwt: string): string {
    return `${projectId}::${this.bareJwtFromTiledeskAuthValue(tiledeskJwt)}`;
  }

  /**
   * Returns a project embed token, sharing in-flight POSTs and caching until near expiry.
   * Home analytics (flow/overview/kb) each call this many times; without caching that is N POSTs.
   */
  getEmbedToken(projectId: string, tiledeskJwt: string): Observable<EmbedTokenResponse> {
    const base = this.analyticsApiBase;
    if (!base) {
      return throwError(() => new Error('analyticsApiBase is not configured'));
    }

    const key = this.embedTokenCacheKey(projectId, tiledeskJwt);
    const cached = this.embedTokenCache.get(key);
    const now = Date.now();
    if (cached && cached.expiresAtMs > now) {
      const expiresInSec = Math.max(1, Math.floor((cached.expiresAtMs - now) / 1000));
      return of({
        token: cached.token,
        expires_in: expiresInSec,
        type: cached.type,
      });
    }

    const inflight = this.embedTokenInflight.get(key);
    if (inflight) {
      return inflight;
    }

    const url = `${base}/api/v1/embed-token`;
    const headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: this.tiledeskAuthorizationHeader(tiledeskJwt)
    });
    this.logger.log('[AnalyticsEmbedService] POST embed-token', url);

    const request$ = this.http.post<EmbedTokenResponse>(url, { id_project: projectId }, { headers }).pipe(
      tap((res) => {
        // Refresh slightly early so parallel callers don't race an almost-expired token.
        const safetyMarginSec = 30;
        const ttlSec = Math.max(5, (res?.expires_in ?? 300) - safetyMarginSec);
        this.embedTokenCache.set(key, {
          token: res.token,
          type: res.type || 'Bearer',
          expiresAtMs: Date.now() + ttlSec * 1000,
        });
        this.embedTokenInflight.delete(key);
      }),
      catchError((err) => {
        this.embedTokenInflight.delete(key);
        return throwError(() => err);
      }),
      shareReplay(1),
    );

    this.embedTokenInflight.set(key, request$);
    return request$;
  }
}
