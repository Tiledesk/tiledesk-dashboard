import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';
import { ExecutionsService } from './executions.service';
import { AppConfigService } from './app-config.service';
import { AuthService } from 'app/core/auth.service';
import { LoggerService } from './logger/logger.service';
import { canViewExecutionData, canViewExecutions } from 'app/bots/executions/executions.models';
import { PERMISSIONS } from 'app/utils/permissions.constants';

describe('ExecutionsService', () => {
  let service: ExecutionsService;
  let http: HttpTestingController;
  let baseUrl: string;

  function setup(url: string) {
    baseUrl = url;
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ExecutionsService,
        { provide: AppConfigService, useValue: { getConfig: () => ({ EXECUTIONS_BASE_URL: baseUrl }) } },
        { provide: AuthService, useValue: { user_bs: new BehaviorSubject({ token: 'JWT abc' }) } },
        { provide: LoggerService, useValue: { log: () => { }, error: () => { }, warn: () => { } } },
      ],
    });
    service = TestBed.inject(ExecutionsService);
    http = TestBed.inject(HttpTestingController);
  }

  afterEach(() => http.verify());

  it('isConfigured false for "" , missing and "${EXECUTIONS_BASE_URL}"', () => {
    for (const v of ['', undefined, '${EXECUTIONS_BASE_URL}']) {
      TestBed.resetTestingModule();
      setup(v as any);
      expect(service.isConfigured()).toBe(false);
    }
    TestBed.resetTestingModule();
    setup('/executions/api/v1/');
    expect(service.isConfigured()).toBe(true);
  });

  it('list builds the query string and joins the base URL', () => {
    setup('/executions/api/v1/');
    service.list('p1', { agent_id: 'a1', status: 'failed,running', has_failures: true, limit: 10, q: undefined }).subscribe();
    const req = http.expectOne((r) => r.url === '/executions/api/v1/projects/p1/executions');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('agent_id')).toBe('a1');
    expect(req.request.params.get('status')).toBe('failed,running');
    expect(req.request.params.get('has_failures')).toBe('true');
    expect(req.request.params.get('limit')).toBe('10');
    expect(req.request.params.has('q')).toBe(false);
    expect(req.request.headers.get('Authorization')).toBe('JWT abc');
    req.flush({ items: [], next_cursor: null });
  });

  it('joins a base URL without trailing slash without doubling slashes', () => {
    setup('/executions/api/v1');
    service.get('p1', 'e1').subscribe();
    http.expectOne('/executions/api/v1/projects/p1/executions/e1').flush({});
  });

  it('summary joins agent_ids with commas', () => {
    setup('/executions/api/v1/');
    service.summary('p1', ['a', 'b']).subscribe();
    const req = http.expectOne((r) => r.url === '/executions/api/v1/projects/p1/executions/summary');
    expect(req.request.params.get('agent_ids')).toBe('a,b');
    expect(req.request.params.get('since')).toBe('24h');
    req.flush({ agents: {} });
  });

  it('state and history call the right routes', () => {
    setup('/executions/api/v1/');
    service.state('p1', 'e1', 3).subscribe();
    const s = http.expectOne((r) => r.url === '/executions/api/v1/projects/p1/executions/e1/state');
    expect(s.request.params.get('step_seq')).toBe('3');
    s.flush({ step_seq: 3, partial: false, vars: [] });
    service.history('p1', 'e1', 'my key').subscribe();
    const h = http.expectOne((r) => r.url === '/executions/api/v1/projects/p1/executions/e1/state/history');
    expect(h.request.params.get('key')).toBe('my key');
    h.flush([]);
  });

  it('stop and destroy POST their bodies to the control routes', () => {
    setup('/executions/api/v1');
    service.stop('p1', 'e1', 'hard').subscribe();
    const s = http.expectOne('/executions/api/v1/projects/p1/executions/e1/stop');
    expect(s.request.method).toBe('POST');
    expect(s.request.body).toEqual({ mode: 'hard' });
    s.flush({ status: 'stopping' });
    service.destroy('p1', 'e1', 'e1abcd').subscribe();
    const d = http.expectOne('/executions/api/v1/projects/p1/executions/e1/destroy');
    expect(d.request.method).toBe('POST');
    expect(d.request.body).toEqual({ confirm: 'e1abcd' });
    d.flush({ status: 'destroyed', close: 'skipped' });
  });

  it('resume sends confirm only when asked; start new reads the input and posts it as is', () => {
    setup('/executions/api/v1');
    service.resume('p1', 'e1').subscribe();
    const r1 = http.expectOne('/executions/api/v1/projects/p1/executions/e1/resume');
    expect(r1.request.method).toBe('POST');
    expect(r1.request.body).toEqual({});
    r1.flush({ status: 'running' });
    service.resume('p1', 'e1', true).subscribe();
    const r2 = http.expectOne('/executions/api/v1/projects/p1/executions/e1/resume');
    expect(r2.request.body).toEqual({ confirm: true });
    r2.flush({ status: 'running' });

    service.startNewInput('p1', 'e1').subscribe();
    const g = http.expectOne('/executions/api/v1/projects/p1/executions/e1/start-new/input');
    expect(g.request.method).toBe('GET');
    g.flush({ input: {}, masked: [] });
    const input = { customer: { api_key: 'k' }, items: [1] };
    service.startNew('p1', 'e1', input).subscribe();
    const s = http.expectOne('/executions/api/v1/projects/p1/executions/e1/start-new');
    expect(s.request.method).toBe('POST');
    expect(s.request.body).toEqual({ input });
    s.flush({ status: 'started' });
  });

  it('data access: request, revoke and the grant on value reads', () => {
    setup('/executions/api/v1');
    const scope = { type: 'step' as const, step_seq: 2 };
    let info: any;
    service.requestDataAccess('p1', 'e1', { reason: 'check the 500', scope }).subscribe(r => (info = r));
    const a = http.expectOne('/executions/api/v1/projects/p1/executions/e1/data-access');
    expect(a.request.method).toBe('POST');
    expect(a.request.body).toEqual({ reason: 'check the 500', scope });
    a.flush({ grant_id: 'g1', expires_at: '2026-11-11T10:15:00.000Z', scope }, { status: 201, statusText: 'Created' });
    expect(info).toEqual({ grant_id: 'g1', expires_at: '2026-11-11T10:15:00.000Z', scope });

    service.revokeDataAccess('p1', 'e1', 'g/1').subscribe();
    const r = http.expectOne('/executions/api/v1/projects/p1/executions/e1/data-access/g%2F1/revoke');
    expect(r.request.method).toBe('POST');
    r.flush(null, { status: 204, statusText: 'No Content' });

    service.state('p1', 'e1', 2, 'g1').subscribe();
    const s = http.expectOne((x) => x.url === '/executions/api/v1/projects/p1/executions/e1/state');
    expect(s.request.params.get('step_seq')).toBe('2');
    expect(s.request.params.get('grant')).toBe('g1');
    s.flush({ step_seq: 2, partial: false, vars: [] });

    service.state('p1', 'e1', 2).subscribe();
    const s2 = http.expectOne((x) => x.url === '/executions/api/v1/projects/p1/executions/e1/state');
    expect(s2.request.params.has('grant')).toBe(false);
    s2.flush({ step_seq: 2, partial: false, vars: [] });

    service.history('p1', 'e1', 'k', 'g1').subscribe();
    const h = http.expectOne((x) => x.url === '/executions/api/v1/projects/p1/executions/e1/state/history');
    expect(h.request.params.get('key')).toBe('k');
    expect(h.request.params.get('grant')).toBe('g1');
    h.flush([]);

    service.triggerData('p1', 'e1', 'g1').subscribe();
    const t = http.expectOne((x) => x.url === '/executions/api/v1/projects/p1/executions/e1/data/trigger');
    expect(t.request.method).toBe('GET');
    expect(t.request.params.get('grant')).toBe('g1');
    t.flush({ value: { order_id: 'A-1001' } });
  });
});

describe('canViewExecutions', () => {
  it('owner, admin and supervisor yes; agent no', () => {
    expect(canViewExecutions('owner', undefined)).toBe(true);
    expect(canViewExecutions('admin', [])).toBe(true);
    expect(canViewExecutions('supervisor', undefined)).toBe(true);
    expect(canViewExecutions('agent', [PERMISSIONS.EXECUTIONS_READ])).toBe(false);
  });
  it('custom roles need executions_read', () => {
    expect(canViewExecutions('custom', undefined)).toBe(false);
    expect(canViewExecutions('custom', ['other'])).toBe(false);
    expect(canViewExecutions('custom', [PERMISSIONS.EXECUTIONS_READ])).toBe(true);
  });
});

describe('canViewExecutionData', () => {
  it('owner and admin yes; supervisor and agent no', () => {
    expect(canViewExecutionData('owner', undefined)).toBe(true);
    expect(canViewExecutionData('admin', [])).toBe(true);
    expect(canViewExecutionData('supervisor', [PERMISSIONS.EXECUTIONS_DATA_ACCESS])).toBe(false);
    expect(canViewExecutionData('agent', [PERMISSIONS.EXECUTIONS_DATA_ACCESS])).toBe(false);
  });
  it('custom roles need executions_data_access', () => {
    expect(canViewExecutionData('custom', undefined)).toBe(false);
    expect(canViewExecutionData('custom', [PERMISSIONS.EXECUTIONS_READ])).toBe(false);
    expect(canViewExecutionData('custom', [PERMISSIONS.EXECUTIONS_DATA_ACCESS])).toBe(true);
  });
});
