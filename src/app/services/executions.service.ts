import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from './app-config.service';
import { LoggerService } from './logger/logger.service';
import {
  ExecutionDetail, ExecutionListParams, ExecutionPage, StateView, Summary, VarHistoryEntry
} from 'app/bots/executions/executions.models';

@Injectable()
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
}
