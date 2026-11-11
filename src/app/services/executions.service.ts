import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from './app-config.service';
import { LoggerService } from './logger/logger.service';
import {
  ExecutionDetail, ExecutionListParams, ExecutionPage, StartNewInput, StateView, Summary, VarHistoryEntry
} from 'app/bots/executions/executions.models';

@Injectable({ providedIn: 'root' })
export class ExecutionsService {

  user: any;
  TOKEN: string;

  constructor(
    private httpClient: HttpClient,
    public auth: AuthService,
    public appConfigService: AppConfigService,
    private logger: LoggerService
  ) {
    this.user = auth.user_bs.value;
    this.checkUser();

    this.auth.user_bs.subscribe((user) => {
      this.user = user;
      this.checkUser();
    });
  }

  checkUser() {
    if (this.user) {
      this.TOKEN = this.user.token;
    } else {
      this.logger.log('[EXECUTIONS-SERV] No user is signed in');
    }
  }

  private baseUrl(): string {
    const url = this.appConfigService.getConfig().EXECUTIONS_BASE_URL;
    return typeof url === 'string' ? url.trim() : '';
  }

  /** False when EXECUTIONS_BASE_URL is empty, missing or still the unreplaced `${...}` placeholder. */
  isConfigured(): boolean {
    const url = this.baseUrl();
    return url !== '' && !url.includes('${');
  }

  private url(projectId: string, path = ''): string {
    const base = this.baseUrl().replace(/\/+$/, '');
    return `${base}/projects/${projectId}/executions${path}`;
  }

  private headers(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    });
  }

  list(projectId: string, params: ExecutionListParams = {}): Observable<ExecutionPage> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach((k) => {
      const v = (params as any)[k];
      if (v !== undefined && v !== null && v !== '') {
        httpParams = httpParams.set(k, String(v));
      }
    });
    return this.httpClient.get<ExecutionPage>(this.url(projectId), { headers: this.headers(), params: httpParams });
  }

  summary(projectId: string, agentIds: string[], since = '24h'): Observable<Summary> {
    const params = new HttpParams().set('agent_ids', agentIds.join(',')).set('since', since);
    return this.httpClient.get<Summary>(this.url(projectId, '/summary'), { headers: this.headers(), params });
  }

  get(projectId: string, id: string): Observable<ExecutionDetail> {
    return this.httpClient.get<ExecutionDetail>(this.url(projectId, '/' + encodeURIComponent(id)), { headers: this.headers() });
  }

  state(projectId: string, id: string, stepSeq: number): Observable<StateView> {
    const params = new HttpParams().set('step_seq', String(stepSeq));
    return this.httpClient.get<StateView>(this.url(projectId, '/' + encodeURIComponent(id) + '/state'), { headers: this.headers(), params });
  }

  history(projectId: string, id: string, key: string): Observable<VarHistoryEntry[]> {
    const params = new HttpParams().set('key', key);
    return this.httpClient.get<VarHistoryEntry[]>(this.url(projectId, '/' + encodeURIComponent(id) + '/state/history'), { headers: this.headers(), params });
  }

  /** 202 {status}; 409 {error:'not_allowed', allowed}; 503 {error:'control_unavailable'}; 403. */
  stop(projectId: string, id: string, mode: 'soft' | 'hard', reason?: string): Observable<{ status: string }> {
    const body: any = { mode };
    if (reason) body.reason = reason;
    return this.httpClient.post<{ status: string }>(this.url(projectId, '/' + encodeURIComponent(id) + '/stop'), body, { headers: this.headers() });
  }

  /** confirm = first 6 characters of the id. 200 {status:'destroyed', close}; 400 confirm_mismatch; 409; 503. */
  destroy(projectId: string, id: string, confirm: string, reason?: string): Observable<{ status: string; close: 'closed' | 'skipped' | 'failed' }> {
    const body: any = { confirm };
    if (reason) body.reason = reason;
    return this.httpClient.post<{ status: string; close: 'closed' | 'skipped' | 'failed' }>(
      this.url(projectId, '/' + encodeURIComponent(id) + '/destroy'), body, { headers: this.headers() });
  }
  /**
   * 202 {status: running | waiting}. 409 confirm_required {action} (send again with confirm), not_resumable
   * {reason, allowed}, busy, not_allowed {allowed}; 502 version_check_failed; 503 no_agent_server / control_unavailable;
   * 500 unseal_failed; 403.
   */
  resume(projectId: string, id: string, confirm = false, reason?: string): Observable<{ status: string }> {
    const body: any = {};
    if (confirm) body.confirm = true;
    if (reason) body.reason = reason;
    return this.httpClient.post<{ status: string }>(this.url(projectId, '/' + encodeURIComponent(id) + '/resume'), body, { headers: this.headers() });
  }

  /** The stored input for start new: masked values are null and listed in `masked`. */
  startNewInput(projectId: string, id: string): Observable<StartNewInput> {
    return this.httpClient.get<StartNewInput>(this.url(projectId, '/' + encodeURIComponent(id) + '/start-new/input'), { headers: this.headers() });
  }

  /**
   * Sends exactly the input the user confirmed. 202 {status:'started', request_id?}; 400 missing_input {fields};
   * 409 already_started / not_allowed; 502 refire_failed; 503 control_unavailable.
   */
  startNew(projectId: string, id: string, input: { [k: string]: any }, reason?: string): Observable<{ status: string; request_id?: string }> {
    const body: any = { input };
    if (reason) body.reason = reason;
    return this.httpClient.post<{ status: string; request_id?: string }>(
      this.url(projectId, '/' + encodeURIComponent(id) + '/start-new'), body, { headers: this.headers() });
  }
}
