import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from './app-config.service';
import { LoggerService } from './logger/logger.service';
import {
  AuditPage, ExecutionDetail, ExecutionGraph, GraphParams, RetentionSettings, StopNoticeBody, StopNoticeSettings, ExecutionListParams, ExecutionPage, ExecutionStats, GrantInfo, GrantScope, StartNewInput, StateView, StatsParams, Summary, ValueOrState,
  VarHistoryEntry
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

  /** includeTests: test runs counted too (test=all), as the list shows them. */
  summary(projectId: string, agentIds: string[], since = '24h', includeTests = false): Observable<Summary> {
    let params = new HttpParams().set('agent_ids', agentIds.join(',')).set('since', since);
    if (includeTests) params = params.set('test', 'all');
    return this.httpClient.get<Summary>(this.url(projectId, '/summary'), { headers: this.headers(), params });
  }

  /** Exact counts of the view (live runs of any age, plus the range's runs), per status and per agent. */
  stats(projectId: string, params: StatsParams): Observable<ExecutionStats> {
    let httpParams = new HttpParams().set('range', params.range);
    if (params.agent_id) httpParams = httpParams.set('agent_id', params.agent_id);
    if (params.test !== undefined) httpParams = httpParams.set('test', String(params.test));
    return this.httpClient.get<ExecutionStats>(this.url(projectId, '/stats'), { headers: this.headers(), params: httpParams });
  }

  /** The graph page's one call per refresh: the stats of the view plus, per agent, the drawn rows (chip priority, at most 12) and the hidden counts. */
  graph(projectId: string, params: GraphParams): Observable<ExecutionGraph> {
    let httpParams = new HttpParams().set('range', params.range);
    if (params.test !== undefined) httpParams = httpParams.set('test', String(params.test));
    return this.httpClient.get<ExecutionGraph>(this.url(projectId, '/graph'), { headers: this.headers(), params: httpParams });
  }

  get(projectId: string, id: string): Observable<ExecutionDetail> {
    return this.httpClient.get<ExecutionDetail>(this.url(projectId, '/' + encodeURIComponent(id)), { headers: this.headers() });
  }

  /**
   * The block's state. With a grant covering it, each side gains `value` or `value_state` (403 grant_invalid /
   * grant_out_of_scope, 410 data_expired). Values are returned to the caller only: never stored or cached here.
   */
  state(projectId: string, id: string, stepSeq: number, grantId?: string): Observable<StateView> {
    let params = new HttpParams().set('step_seq', String(stepSeq));
    if (grantId) params = params.set('grant', grantId);
    return this.httpClient.get<StateView>(this.url(projectId, '/' + encodeURIComponent(id) + '/state'), { headers: this.headers(), params });
  }

  /** With a grant, entries in covered steps gain before_value/after_value or before_state/after_state. */
  history(projectId: string, id: string, key: string, grantId?: string): Observable<VarHistoryEntry[]> {
    let params = new HttpParams().set('key', key);
    if (grantId) params = params.set('grant', grantId);
    return this.httpClient.get<VarHistoryEntry[]>(this.url(projectId, '/' + encodeURIComponent(id) + '/state/history'), { headers: this.headers(), params });
  }

  /**
   * Opens the execution's sealed data for 15 minutes. 201/200 {grant_id, expires_at, scope} (an active grant for the
   * same scope comes back again); 403 forbidden (audited denial); 410 data_expired; 404 no_data; 400 invalid_body.
   */
  requestDataAccess(projectId: string, id: string, body: { reason: string; scope: GrantScope }): Observable<GrantInfo> {
    return this.httpClient.post<GrantInfo>(this.url(projectId, '/' + encodeURIComponent(id) + '/data-access'), body, { headers: this.headers() });
  }

  /** Close: ends the grant on the service (204). */
  revokeDataAccess(projectId: string, id: string, grantId: string): Observable<void> {
    return this.httpClient.post<void>(
      this.url(projectId, '/' + encodeURIComponent(id) + '/data-access/' + encodeURIComponent(grantId) + '/revoke'), {}, { headers: this.headers() });
  }

  /** The trigger input under an execution grant: {value} or {value_state}; a step grant gets 403 grant_out_of_scope. */
  triggerData(projectId: string, id: string, grantId: string): Observable<ValueOrState> {
    const params = new HttpParams().set('grant', grantId);
    return this.httpClient.get<ValueOrState>(this.url(projectId, '/' + encodeURIComponent(id) + '/data/trigger'), { headers: this.headers(), params });
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

  /** Audit of one execution, newest first, 50 per page; `next_cursor` is null on the last page. 403 without executions_audit_read. */
  audit(projectId: string, id: string, cursor?: string | null): Observable<AuditPage> {
    let params = new HttpParams();
    if (cursor) params = params.set('cursor', cursor);
    return this.httpClient.get<AuditPage>(this.url(projectId, '/' + encodeURIComponent(id) + '/audit'), { headers: this.headers(), params });
  }

  /** Retention of executions of the project (trace and sealed data days). */
  getRetention(projectId: string): Observable<RetentionSettings> {
    return this.httpClient.get<RetentionSettings>(this.settingsUrl(projectId), { headers: this.headers() });
  }

  /** 200 with the GET shape; 400 out_of_range {field}; 403 without executions_audit_read. */
  putRetention(projectId: string, body: { trace_days: number; data_days: number }): Observable<RetentionSettings> {
    return this.httpClient.put<RetentionSettings>(this.settingsUrl(projectId), body, { headers: this.headers() });
  }

  /** The stop notice the chatbot sends when a user writes while the agent's execution is stopped. */
  getStopNotice(projectId: string): Observable<StopNoticeSettings> {
    return this.httpClient.get<StopNoticeSettings>(this.settingsUrl(projectId, 'stop-notice'), { headers: this.headers() });
  }

  /** 200 with the GET shape; 400 out_of_range {field: 'text'}; 403 without executions_control. */
  putStopNotice(projectId: string, body: StopNoticeBody): Observable<StopNoticeSettings> {
    return this.httpClient.put<StopNoticeSettings>(this.settingsUrl(projectId, 'stop-notice'), body, { headers: this.headers() });
  }

  private settingsUrl(projectId: string, setting: 'retention' | 'stop-notice' = 'retention'): string {
    const base = this.baseUrl().replace(/\/+$/, '');
    return `${base}/projects/${projectId}/settings/${setting}`;
  }
}
