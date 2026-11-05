import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from './app-config.service';
import { LoggerService } from './logger/logger.service';

export type RegistryScope = 'global' | 'project';

export interface HubMe { role: string; manager: boolean; hub_admin: boolean; project_connectors_enabled: boolean }

// ConnectorView; catalog rows fill only the first six fields + status 'active'
export interface HubConnector {
  id: string; name: string; version: string; description: string; icon: string;
  owner: string; status: 'active' | 'disabled'; base_url?: string; internal_url?: string | null;
  last_validated_at?: string; validation_errors?: string[];
}

export interface HubValidateResult { valid: boolean; errors: string[]; manifest?: any }

export interface HubConnection {
  id: string; connector_id: string; label: string;
  account: { id?: string; display: string; email?: string } | null;
  status: 'pending' | 'connected' | 'disconnected'; created_by: string; created_at: string; updated_at: string;
}

export interface HubInstallResult { auth_url?: string; fields?: any[] }

/** Client of the connector-hub API (registry, connections, catalog `me`). */
@Injectable({
  providedIn: 'root'
})
export class ConnectorHubService {

  private TOKEN: string;
  private project_id: string;
  private meCache = new Map<string, Observable<HubMe>>();

  constructor(
    private auth: AuthService,
    private appConfigService: AppConfigService,
    private logger: LoggerService,
    private http: HttpClient
  ) {
    this.TOKEN = this.auth.user_bs.value?.token;
    this.auth.user_bs.subscribe((user) => {
      this.TOKEN = user?.token;
    });
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.project_id = project._id;
      }
    });
  }

  private hubBase(): string {
    const url = this.appConfigService.getConfig()?.connectorHubUrl;
    if (typeof url !== 'string' || !url.trim() || url.trim() === '${CONNECTOR_HUB_URL}') {
      return '';
    }
    return url.trim().replace(/\/+$/, '');
  }

  isConfigured(): boolean {
    return !!this.hubBase();
  }

  private url(path: string): string {
    return this.hubBase() + path;
  }

  private headers(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this.TOKEN });
  }

  private notConfigured<T>(): Observable<T> {
    return throwError(new Error('hub_not_configured'));
  }

  /** Runs `call` only when the hub is configured; otherwise errors without a request. */
  private guarded<T>(call: () => Observable<T>): Observable<T> {
    return this.isConfigured() ? call() : this.notConfigured<T>();
  }

  private registryPath(scope: RegistryScope): string {
    return scope === 'global' ? '/connectors' : `/projects/${this.project_id}/connectors`;
  }

  private connectionsPath(): string {
    return `/projects/${this.project_id}/connections`;
  }

  // ---- me / scope ----

  getMe(force = false): Observable<HubMe> {
    if (!this.isConfigured()) {
      return this.notConfigured<HubMe>();
    }
    const projectId = this.project_id;
    if (force) {
      this.meCache.delete(projectId);
    }
    let cached = this.meCache.get(projectId);
    if (!cached) {
      cached = this.http.get<HubMe>(this.url(`/projects/${projectId}/me`), { headers: this.headers() }).pipe(
        catchError((error) => {
          this.meCache.delete(projectId);
          return throwError(error);
        }),
        shareReplay(1)
      );
      this.meCache.set(projectId, cached);
    }
    return cached;
  }

  registryScope(me: HubMe): RegistryScope | null {
    if (me.hub_admin) {
      return 'global';
    }
    if (me.manager && me.project_connectors_enabled) {
      return 'project';
    }
    return null;
  }

  // ---- registry ----

  listConnectors(me: HubMe): Observable<HubConnector[]> {
    return this.guarded(() => {
      if (me.hub_admin) {
        // A hub admin sees global connectors and this project's own, never other projects'.
        return this.http.get<{ connectors: HubConnector[] }>(this.url('/connectors'), { headers: this.headers() }).pipe(
          map((res) => res.connectors.filter((c) => c.owner === 'global' || c.owner === this.project_id))
        );
      }
      const catalog$ = this.http.get<{ connectors: any[] }>(this.url(`/projects/${this.project_id}/catalog`), { headers: this.headers() }).pipe(
        map((res) => res.connectors.map((c): HubConnector => ({
          id: c.id, name: c.name, version: c.version, description: c.description, icon: c.icon, owner: c.owner, status: 'active'
        })))
      );
      if (this.registryScope(me) !== 'project') {
        return catalog$;
      }
      // The catalog only has active connectors: merge the project's own ones so a disabled one can be re-enabled.
      const own$ = this.http.get<{ connectors: HubConnector[] }>(this.url(this.registryPath('project')), { headers: this.headers() }).pipe(
        map((res) => res.connectors),
        catchError((error) => {
          this.logger.error('[CONNECTOR-HUB] list project connectors ERROR: ', error);
          return of([] as HubConnector[]);
        })
      );
      return forkJoin([catalog$, own$]).pipe(
        map(([catalog, own]) => {
          const ownIds = new Set(own.map((c) => c.id));
          return [...catalog.filter((c) => !ownIds.has(c.id)), ...own];
        })
      );
    });
  }

  getManifest(connectorId: string): Observable<any> {
    return this.guarded(() => this.http.get(this.url(`/projects/${this.project_id}/connectors/${connectorId}/manifest`), { headers: this.headers() }));
  }

  private registerBody(baseUrl: string, internalUrl: string | null): { base_url: string; internal_url?: string } {
    return internalUrl ? { base_url: baseUrl, internal_url: internalUrl } : { base_url: baseUrl };
  }

  validate(baseUrl: string, internalUrl: string | null, scope: RegistryScope): Observable<HubValidateResult> {
    return this.guarded(() => this.http.post<HubValidateResult>(
      this.url(this.registryPath(scope) + '/validate'), this.registerBody(baseUrl, internalUrl), { headers: this.headers() }));
  }

  register(baseUrl: string, internalUrl: string | null, scope: RegistryScope): Observable<{ connector: HubConnector; event_secret: string }> {
    return this.guarded(() => this.http.post<{ connector: HubConnector; event_secret: string }>(
      this.url(this.registryPath(scope)), this.registerBody(baseUrl, internalUrl), { headers: this.headers() }));
  }

  refresh(id: string, scope: RegistryScope): Observable<{ connector: HubConnector; valid: boolean; errors: string[] }> {
    return this.guarded(() => this.http.post<{ connector: HubConnector; valid: boolean; errors: string[] }>(
      this.url(`${this.registryPath(scope)}/${id}/refresh`), {}, { headers: this.headers() }));
  }

  setEnabled(id: string, enabled: boolean, scope: RegistryScope): Observable<HubConnector> {
    return this.guarded(() => this.http.post<HubConnector>(
      this.url(`${this.registryPath(scope)}/${id}/${enabled ? 'enable' : 'disable'}`), {}, { headers: this.headers() }));
  }

  removeConnector(id: string, scope: RegistryScope): Observable<void> {
    return this.guarded(() => this.http.delete<void>(this.url(`${this.registryPath(scope)}/${id}`), { headers: this.headers() }));
  }

  // ---- connections ----

  listConnections(connectorId: string): Observable<HubConnection[]> {
    return this.guarded(() => {
      const params = new HttpParams().set('connector_id', connectorId).set('include_pending', 'false');
      return this.http.get<{ connections: HubConnection[] }>(this.url(this.connectionsPath()), { headers: this.headers(), params }).pipe(
        map((res) => res.connections)
      );
    });
  }

  createConnection(connectorId: string, label?: string): Observable<HubConnection> {
    const body: { connector_id: string; label?: string } = { connector_id: connectorId };
    if (label) {
      body.label = label;
    }
    return this.guarded(() => this.http.post<HubConnection>(this.url(this.connectionsPath()), body, { headers: this.headers() }));
  }

  install(connectionId: string, returnUrl: string): Observable<HubInstallResult> {
    return this.guarded(() => this.http.post<HubInstallResult>(
      this.url(`${this.connectionsPath()}/${connectionId}/install`), { return_url: returnUrl }, { headers: this.headers() }));
  }

  getConnectionStatus(connectionId: string): Observable<{ connected: boolean; connection: HubConnection }> {
    return this.guarded(() => this.http.get<{ connected: boolean; connection: HubConnection }>(
      this.url(`${this.connectionsPath()}/${connectionId}/status`), { headers: this.headers() }));
  }

  renameConnection(connectionId: string, label: string): Observable<HubConnection> {
    return this.guarded(() => this.http.patch<HubConnection>(
      this.url(`${this.connectionsPath()}/${connectionId}`), { label }, { headers: this.headers() }));
  }

  revokeConnection(connectionId: string, force = false): Observable<void> {
    return this.guarded(() => this.http.delete<void>(
      this.url(`${this.connectionsPath()}/${connectionId}${force ? '?force=true' : ''}`), { headers: this.headers() }));
  }
}
