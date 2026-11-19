import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { AppConfigService } from './app-config.service';
import { AuthService } from 'app/core/auth.service';
import { LoggerService } from './logger/logger.service';
import {
  KbImportRequest, KbImportResponse, KbSourceConnection, KbSourceItems, KbSourceProviderId, KbSourceProviders, Ms365ConnectResult
} from 'app/models/kb-sources.model';
import { MS365_CONNECT_CHANNEL, asProvider, parseMs365Relayed } from 'app/knowledge-bases/utils/ms365-popup-return';

export type { KbSourceProvider, KbSourceProviders } from 'app/models/kb-sources.model';

@Injectable({
  providedIn: 'root'
})
export class KbSourcesService {

  SERVER_BASE_PATH: string;
  private activeConnectCancel: (() => void) | null = null;
  private relayed = new Subject<Ms365ConnectResult>();
  /**
   * Sign-in results relayed by the popup on the BroadcastChannel (when the Microsoft pages cut
   * window.opener). connect() resolves with them while pending; a result arriving after connect()
   * already resolved 'closed' (the cut opener looks like a closed popup) is still emitted here.
   */
  readonly relayedConnectResults$: Observable<Ms365ConnectResult> = this.relayed.asObservable();
  TOKEN: string;
  project_id: string;

  constructor(
    private appConfigService: AppConfigService,
    private auth: AuthService,
    private httpClient: HttpClient,
    private logger: LoggerService,
  ) {
    this.auth.user_bs.subscribe((user) => {
      if (user) {
        this.TOKEN = user.token;
      }
    });
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.project_id = project._id;
      }
    });
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    this.listenRelayedResults();
  }

  /** Overridable for tests. */
  protected createChannel(): BroadcastChannel | null {
    return typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(MS365_CONNECT_CHANNEL);
  }

  private listenRelayedResults() {
    let ch: BroadcastChannel | null = null;
    try { ch = this.createChannel(); } catch (e) { ch = null; }
    if (!ch) { return; }
    ch.onmessage = (event: MessageEvent) => {
      const result = parseMs365Relayed(event.data);
      if (result) { this.relayed.next(result); }
    };
  }

  private get baseUrl(): string {
    return this.SERVER_BASE_PATH + this.project_id + '/kb/sources';
  }

  private get httpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };
  }

  /** Admin-only: available providers plus the server KB file limit and extensions. */
  getProviders(): Observable<KbSourceProviders> {
    const url = this.baseUrl + '/providers';
    this.logger.log('[KB-SOURCES.SERVICE] - get providers URL ', url);
    return this.httpClient.get<KbSourceProviders>(url, this.httpOptions);
  }

  getConnections(): Observable<KbSourceConnection[]> {
    return this.httpClient.get<KbSourceConnection[]>(this.baseUrl + '/connections', this.httpOptions);
  }

  deleteConnection(id: string, cascade = false): Observable<any> {
    const params = cascade ? new HttpParams().set('cascade', 'true') : new HttpParams();
    return this.httpClient.delete(this.baseUrl + '/connections/' + id, { ...this.httpOptions, params });
  }

  getRoots(connId: string): Observable<KbSourceItems> {
    return this.httpClient.get<KbSourceItems>(this.baseUrl + '/connections/' + connId + '/roots', this.httpOptions);
  }

  getDrives(connId: string, siteId: string): Observable<KbSourceItems> {
    const params = new HttpParams().set('site', siteId);
    return this.httpClient.get<KbSourceItems>(this.baseUrl + '/connections/' + connId + '/drives', { ...this.httpOptions, params });
  }

  getChildren(connId: string, driveId: string, itemId?: string, page?: string): Observable<KbSourceItems> {
    let params = new HttpParams();
    if (itemId) { params = params.set('item', itemId); }
    if (page) { params = params.set('page', page); }
    return this.httpClient.get<KbSourceItems>(
      this.baseUrl + '/connections/' + connId + '/drives/' + driveId + '/children', { ...this.httpOptions, params });
  }

  importItems(provider: KbSourceProviderId, req: KbImportRequest): Observable<KbImportResponse> {
    return this.httpClient.post<KbImportResponse>(this.baseUrl + '/' + provider + '/import', req, this.httpOptions);
  }

  updateFolderRefreshRate(kbId: string, rate: string): Observable<any> {
    return this.httpClient.patch(this.baseUrl + '/folders/' + kbId, { refresh_rate: rate }, this.httpOptions);
  }

  syncFolder(kbId: string): Observable<any> {
    return this.httpClient.post(this.baseUrl + '/folders/' + kbId + '/sync', {}, this.httpOptions);
  }

  /**
   * Provider (Microsoft 365, Google Drive) sign-in in a popup. MUST be called directly from the click handler:
   * the popup is opened synchronously (before any await/HTTP) so the browser does not block it,
   * then navigated to the server `authorize_url`. Resolves once with connected | error (server
   * message), closed (user closed the popup, polled every 1000 ms) or blocked (popup refused).
   * An HTTP failure closes the popup and resolves { status: 'error', reason: 'connect_failed' }.
   */
  connect(provider: KbSourceProviderId, connectionId?: string): Promise<Ms365ConnectResult> {
    this.cancelConnect(); // one popup at a time
    const popup = window.open('', 'ms365-connect', 'width=520,height=680');
    if (!popup) {
      return Promise.resolve({ status: 'blocked' });
    }

    return new Promise<Ms365ConnectResult>((resolve) => {
      let done = false;
      // the callback lives under the same public base as authorize_url (/start), which may differ
      // from SERVER_BASE_URL: the expected origin is known only once /connect answers
      let expectedOrigin: string | null = null;
      const finish = (result: Ms365ConnectResult) => {
        if (done) { return; }
        done = true;
        relaySub.unsubscribe();
        window.removeEventListener('message', onMessage);
        clearInterval(timer);
        if (this.activeConnectCancel === cancel) { this.activeConnectCancel = null; }
        resolve(result);
      };
      const cancel = () => {
        if (done) { return; }
        try { popup.close(); } catch (e) { /* already gone */ }
        finish({ status: 'closed' });
      };
      this.activeConnectCancel = cancel;
      const onMessage = (event: MessageEvent) => {
        if (!expectedOrigin || event.origin !== expectedOrigin || event.source !== popup) { return; }
        const data = event.data;
        if (!data || data.type !== 'ms365-connect' || (data.status !== 'connected' && data.status !== 'error')) { return; }
        finish({ status: data.status, reason: data.reason, connection_id: data.connection_id, provider: asProvider(data.provider) || 'microsoft365' });
      };
      const relaySub = this.relayed.subscribe(result => finish(result));
      const timer = setInterval(() => {
        if (popup.closed) { finish({ status: 'closed' }); }
      }, 1000);
      window.addEventListener('message', onMessage);

      this.httpClient.post<{ authorize_url: string }>(
        this.baseUrl + '/' + provider + '/connect',
        // return_url + popup: where the popup lands when the sign-in pages cut window.opener
        { connection_id: connectionId, origin: window.location.origin, return_url: this.cleanReturnUrl(window.location.href), popup: true },
        this.httpOptions
      ).subscribe({
        next: (res) => {
          if (done) { return; }
          let origin: string | null = null;
          if (res && typeof res.authorize_url === 'string' && res.authorize_url) {
            try {
              origin = new URL(res.authorize_url, window.location.href).origin;
            } catch (e) {
              this.logger.error('[KB-SOURCES.SERVICE] - connect: invalid authorize_url ', e);
            }
          }
          if (!origin || origin === 'null') {
            popup.close();
            finish({ status: 'error', reason: 'connect_failed' });
            return;
          }
          expectedOrigin = origin;
          popup.location.href = res.authorize_url;
        },
        error: (err) => {
          if (done) { return; }
          this.logger.error('[KB-SOURCES.SERVICE] - connect error ', err);
          popup.close();
          finish({ status: 'error', reason: 'connect_failed' });
        }
      });
    });
  }

  /**
   * Full-page fallback when the popup is blocked: asks the server for the authorize_url with a
   * `return_url` (the clean current page) and navigates this window to it. The browser comes back
   * to return_url with ms365=connected|error appended to the hash route's query. The promise
   * resolves just before leaving the page; it rejects with { reason: 'connect_failed' }.
   */
  connectInWindow(provider: KbSourceProviderId, connectionId?: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.httpClient.post<{ authorize_url: string }>(
        this.baseUrl + '/' + provider + '/connect',
        { connection_id: connectionId, origin: window.location.origin, return_url: this.cleanReturnUrl(window.location.href) },
        this.httpOptions
      ).subscribe({
        next: (res) => {
          if (res && typeof res.authorize_url === 'string' && res.authorize_url) {
            this.navigate(res.authorize_url);
            resolve();
          } else {
            reject({ reason: 'connect_failed' });
          }
        },
        error: (err) => {
          this.logger.error('[KB-SOURCES.SERVICE] - connectInWindow error ', err);
          reject({ reason: 'connect_failed' });
        }
      });
    });
  }

  /** Current page URL without the query string, in the hash part too (e.g. a leftover ?ms365=...). */
  private cleanReturnUrl(href: string): string {
    return href.split('?')[0];
  }

  /** Overridable for tests: leaves the page for the sign-in. */
  navigate(url: string): void {
    window.location.assign(url);
  }

  /** Closes the pending sign-in popup (if any), removes its listener/timer and resolves connect() with 'closed'. */
  cancelConnect(): void {
    if (this.activeConnectCancel) { this.activeConnectCancel(); }
  }
}
