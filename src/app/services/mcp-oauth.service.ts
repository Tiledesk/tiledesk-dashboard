import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from './app-config.service';
import { LoggerService } from './logger/logger.service';

export type McpOAuthMode = 'mcp' | 'google' | 'manual';

export interface McpOAuthReference {
  connection_id: string;
  mode?: McpOAuthMode;
}

export interface McpOAuthConnection {
  _id: string;
  mode: McpOAuthMode;
  server_url: string;
  name?: string;
  status: 'pending' | 'active' | 'needs_reauth' | 'revoked';
  scopes?: string[];
  expires_at?: string;
  last_error?: { code: string; message: string; at: string };
  updatedAt: string;
}

export interface McpOAuthManualClient {
  authorization_endpoint: string;
  token_endpoint: string;
  client_id: string;
  client_secret?: string;
  revocation_endpoint?: string;
  token_endpoint_auth_method?: string;
}

export interface McpOAuthAuthorizeBody {
  mode: McpOAuthMode;
  server_url: string;
  name?: string;
  scopes?: string[];
  manual?: McpOAuthManualClient;
}

export interface McpOAuthAuthorizeResponse {
  success: boolean;
  authorization_url: string;
  connection_id: string;
}

export type McpOAuthResult =
  | { ok: true; connection: McpOAuthConnection }
  | { ok: false; reason: 'popup_blocked' | 'closed' | 'timeout' | 'provider_error' | 'request_failed'; message?: string; code?: string };

@Injectable({
  providedIn: 'root'
})
export class McpOAuthService {

  user: any;
  project_id: any;
  TOKEN: string;
  SERVER_BASE_PATH: string;

  /** Polling interval. Overridable so specs can drive the flow with fakeAsync/tick. */
  pollMs = 2000;
  /** Authorization state TTL on the server. Overridable in specs. */
  timeoutMs = 600000;
  /** Clock used for the timeout check. Overridable in specs. */
  now: () => number = () => Date.now();

  private generation = 0;
  private pollTimer: any = null;
  private timeoutTimer: any = null;
  private activePopup: Window | null = null;
  private pendingResolve: ((result: McpOAuthResult) => void) | null = null;
  private connectSettled = false;

  constructor(
    private auth: AuthService,
    public appConfigService: AppConfigService,
    private logger: LoggerService,
    private http: HttpClient
  ) {
    this.user = auth.user_bs.value;
    this.checkIfExistUserAndGetToken();

    this.auth.user_bs.subscribe((user) => {
      this.user = user;
      this.checkIfExistUserAndGetToken();
    });
    this.getCurrentProject();
    this.getAppConfig();
  }

  getAppConfig() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    this.logger.log('[MCP-OAUTH] SERVER_BASE_PATH ', this.SERVER_BASE_PATH);
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.project_id = project._id;
      }
    }, (error) => {
      this.logger.error('[MCP-OAUTH] get current project ERROR: ', error);
    }, () => {
      this.logger.debug('[MCP-OAUTH] get current project *COMPLETE*');
    });
  }

  checkIfExistUserAndGetToken() {
    if (this.user) {
      this.TOKEN = this.user.token;
    } else {
      this.logger.log('[MCP-OAUTH] No user is signed in');
    }
  }

  /**
   * Opens the provider window. Must be called synchronously inside the click handler,
   * before any HTTP call, otherwise the browser blocks the popup.
   */
  openPopup(): Window | null {
    return window.open('', 'mcp-oauth', 'width=520,height=720');
  }

  authorize(body: McpOAuthAuthorizeBody): Observable<McpOAuthAuthorizeResponse> {
    const url = this.baseUrl() + '/authorize';
    this.logger.debug('[MCP-OAUTH] authorize URL: ', url);
    return this.http.post<McpOAuthAuthorizeResponse>(url, body, this.httpOptions());
  }

  listConnections(): Observable<McpOAuthConnection[]> {
    const url = this.baseUrl() + '/connections';
    this.logger.debug('[MCP-OAUTH] list connections URL: ', url);
    return this.http.get<McpOAuthConnection[]>(url, this.httpOptions());
  }

  getConnection(id: string): Observable<McpOAuthConnection> {
    const url = this.baseUrl() + '/connections/' + id;
    this.logger.debug('[MCP-OAUTH] get connection URL: ', url);
    return this.http.get<McpOAuthConnection>(url, this.httpOptions());
  }

  deleteConnection(id: string): Observable<{ success: boolean; revoked: boolean }> {
    const url = this.baseUrl() + '/connections/' + id;
    this.logger.debug('[MCP-OAUTH] delete connection URL: ', url);
    return this.http.delete<{ success: boolean; revoked: boolean }>(url, this.httpOptions());
  }

  /**
   * Runs the popup authorization flow. `popup` is the window opened synchronously
   * by the click handler via openPopup().
   */
  connect(body: McpOAuthAuthorizeBody, popup: Window | null): Promise<McpOAuthResult> {
    if (popup === null) {
      return Promise.resolve({ ok: false, reason: 'popup_blocked' });
    }

    const generation = ++this.generation;
    this.activePopup = popup;

    return this.authorize(body).toPromise()
      .then((response): Promise<McpOAuthResult> => {
        if (generation !== this.generation) {
          return Promise.resolve({ ok: false, reason: 'closed' });
        }
        return this.getConnection(response.connection_id).toPromise()
          .then((existing): Promise<McpOAuthResult> => {
            if (generation !== this.generation) {
              return Promise.resolve({ ok: false, reason: 'closed' });
            }
            popup.location.href = response.authorization_url;
            return this.pollUntil(response.connection_id, existing.updatedAt, popup, generation);
          });
      })
      .catch((err) => {
        this.closePopup(popup);
        if (generation !== this.generation) {
          return { ok: false as const, reason: 'closed' as const };
        }
        return {
          ok: false as const,
          reason: 'request_failed' as const,
          message: err && err.error ? err.error.error : undefined,
          code: err && err.error ? err.error.code : undefined
        };
      });
  }

  /**
   * Stops the in-flight popup polling. Called from the component on cancel and on destroy.
   * Resolves the current connect() with `closed` so the caller is not left waiting.
   */
  cancel(): void {
    this.generation++;
    this.connectSettled = true;
    const popup = this.activePopup;
    this.activePopup = null;
    const resolve = this.pendingResolve;
    this.pendingResolve = null;
    this.stopTimers();
    if (popup) {
      this.closePopup(popup);
    }
    if (resolve) {
      resolve({ ok: false, reason: 'closed' });
    }
  }

  private pollUntil(connectionId: string, baseline: string, popup: Window, generation: number): Promise<McpOAuthResult> {
    this.connectSettled = false;

    return new Promise((resolve) => {
      const started = this.now();
      this.pendingResolve = resolve;

      const finish = (result: McpOAuthResult) => {
        if (this.connectSettled || generation !== this.generation) {
          return;
        }
        this.connectSettled = true;
        this.pendingResolve = null;
        this.activePopup = null;
        this.stopTimers();
        resolve(result);
      };

      const inspect = (connection: McpOAuthConnection, userClosed: boolean) => {
        if (this.connectSettled || generation !== this.generation) {
          return;
        }
        const outcome = this.outcomeFromConnection(connection, baseline);
        if (outcome) {
          this.closePopup(popup);
          finish(outcome);
          return;
        }
        if (userClosed) {
          finish({ ok: false, reason: 'closed' });
        }
      };

      this.timeoutTimer = setTimeout(() => {
        this.closePopup(popup);
        finish({ ok: false, reason: 'timeout' });
      }, this.timeoutMs);

      this.pollTimer = setInterval(() => {
        if (this.connectSettled || generation !== this.generation) {
          return;
        }
        if (this.now() - started >= this.timeoutMs) {
          this.closePopup(popup);
          finish({ ok: false, reason: 'timeout' });
          return;
        }
        const userClosed = !!popup.closed;
        if (userClosed) {
          this.stopTimers();
        }
        this.getConnection(connectionId).toPromise().then(
          (connection) => inspect(connection, userClosed),
          () => {
            if (userClosed) {
              finish({ ok: false, reason: 'closed' });
            }
          }
        );
      }, this.pollMs);
    });
  }

  private outcomeFromConnection(connection: McpOAuthConnection, baseline: string): McpOAuthResult | null {
    if (connection.status === 'active' && connection.updatedAt > baseline) {
      return { ok: true, connection };
    }
    if (connection.last_error && connection.last_error.at > baseline) {
      return { ok: false, reason: 'provider_error', message: connection.last_error.message };
    }
    return null;
  }

  private stopTimers(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
  }

  private closePopup(popup: Window | null): void {
    if (!popup) {
      return;
    }
    try {
      popup.close();
    } catch (e) {
      this.logger.debug('[MCP-OAUTH] popup close failed', e);
    }
  }

  private baseUrl(): string {
    return this.SERVER_BASE_PATH + this.project_id + '/mcp/oauth';
  }

  private httpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };
  }
}
