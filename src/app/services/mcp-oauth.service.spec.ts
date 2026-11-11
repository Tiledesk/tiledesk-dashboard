import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from './app-config.service';
import { IntegrationService } from './integration.service';
import { LoggerService } from './logger/logger.service';
import { McpOAuthConnection, McpOAuthResult, McpOAuthService } from './mcp-oauth.service';

const T0 = '2026-11-11T10:00:00.000Z';
const T1 = '2026-11-11T10:00:05.000Z';
const AUTHORIZE_URL = 'http://api/P1/mcp/oauth/authorize';
const connectionUrl = (id: string) => 'http://api/P1/mcp/oauth/connections/' + id;

describe('McpOAuthService', () => {
  let service: McpOAuthService;
  let integrationService: IntegrationService;
  let http: HttpTestingController;

  const authorizeBody = { mode: 'mcp' as const, server_url: 'https://mcp.example/sse', name: 'Demo' };

  function connection(overrides: Partial<McpOAuthConnection> = {}): McpOAuthConnection {
    return {
      _id: 'C1',
      mode: 'mcp',
      server_url: 'https://mcp.example/sse',
      name: 'Demo',
      status: 'pending',
      updatedAt: T0,
      ...overrides
    };
  }

  function fakePopup() {
    return {
      closed: false,
      location: { href: '' },
      close() { this.closed = true; }
    };
  }

  function startConnect(popup: Window | null, body = authorizeBody): { result: () => McpOAuthResult } {
    let result: McpOAuthResult;
    service.connect(body, popup).then((value) => result = value);
    return { result: () => result };
  }

  function flushAuthorize(connectionId = 'C1', authorizationUrl = 'https://idp.example/auth') {
    const req = http.expectOne(AUTHORIZE_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('JWT abc');
    req.flush({ success: true, authorization_url: authorizationUrl, connection_id: connectionId });
    tick();
  }

  function flushBaseline(updatedAt = T0, connectionId = 'C1') {
    const req = http.expectOne(connectionUrl(connectionId));
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('JWT abc');
    req.flush(connection({ _id: connectionId, updatedAt, status: 'pending' }));
    tick();
  }

  beforeEach(() => {
    const user_bs = new BehaviorSubject<any>({ token: 'JWT abc' });
    const project_bs = new BehaviorSubject<any>({ _id: 'P1' });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        McpOAuthService,
        IntegrationService,
        { provide: AuthService, useValue: { user_bs, project_bs } },
        { provide: AppConfigService, useValue: { getConfig: () => ({ SERVER_BASE_URL: 'http://api/' }) } },
        { provide: LoggerService, useValue: { log: () => {}, debug: () => {}, error: () => {}, warn: () => {}, info: () => {} } }
      ]
    });

    service = TestBed.inject(McpOAuthService);
    integrationService = TestBed.inject(IntegrationService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    service.cancel();
    http.verify();
  });

  it('posts authorize to the project OAuth endpoint with the JWT and the body unchanged', () => {
    const body = {
      mode: 'manual' as const,
      server_url: 'https://mcp.example/sse',
      name: 'Demo',
      scopes: ['openid', 'email'],
      manual: {
        authorization_endpoint: 'https://idp.example/auth',
        token_endpoint: 'https://idp.example/token',
        client_id: 'client-1',
        client_secret: 'secret'
      }
    };

    service.authorize(body).subscribe();

    const req = http.expectOne(AUTHORIZE_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('JWT abc');
    expect(req.request.body).toEqual(body);
    req.flush({ success: true, authorization_url: 'https://idp.example/auth', connection_id: 'C1' });
  });

  it('returns popup_blocked and makes no HTTP call when the popup is null', fakeAsync(() => {
    const pending = startConnect(null);

    tick();

    expect(pending.result()).toEqual({ ok: false, reason: 'popup_blocked' });
    http.expectNone(AUTHORIZE_URL);
  }));

  it('resolves when a later poll shows the connection became active after the baseline', fakeAsync(() => {
    const popup = fakePopup();
    const pending = startConnect(popup as any);

    const auth = http.expectOne(AUTHORIZE_URL);
    expect(auth.request.body).toEqual(authorizeBody);
    auth.flush({ success: true, authorization_url: 'https://idp.example/auth', connection_id: 'C1' });
    tick();
    flushBaseline();

    expect(popup.location.href).toBe('https://idp.example/auth');

    tick(service.pollMs);
    http.expectOne(connectionUrl('C1')).flush(connection({ status: 'active', updatedAt: T1 }));
    tick();

    const result = pending.result();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.connection.status).toBe('active');
      expect(result.connection.updatedAt).toBe(T1);
    }
    expect(popup.closed).toBe(true);
  }));

  it('does not treat an already active connection as success when updatedAt equals the baseline', fakeAsync(() => {
    const popup = fakePopup();
    const pending = startConnect(popup as any);

    flushAuthorize();
    flushBaseline();

    tick(service.pollMs);
    http.expectOne(connectionUrl('C1')).flush(connection({ status: 'active', updatedAt: T0 }));
    tick();

    expect(pending.result()).toBeUndefined();
    expect(popup.closed).toBe(false);

    service.cancel();
    tick();
    expect(pending.result()).toEqual({ ok: false, reason: 'closed' });
  }));

  it('returns provider_error with the server message when last_error is newer than the baseline', fakeAsync(() => {
    const popup = fakePopup();
    const pending = startConnect(popup as any);

    flushAuthorize();
    flushBaseline();

    tick(service.pollMs);
    http.expectOne(connectionUrl('C1')).flush(connection({
      status: 'pending',
      updatedAt: T0,
      last_error: { code: 'access_denied', message: 'User denied access', at: T1 }
    }));
    tick();

    expect(pending.result()).toEqual({ ok: false, reason: 'provider_error', message: 'User denied access' });
    expect(popup.closed).toBe(true);
  }));

  it('returns closed when the user closes the popup before the grant completes', fakeAsync(() => {
    const popup = fakePopup();
    const pending = startConnect(popup as any);

    flushAuthorize();
    flushBaseline();

    popup.closed = true;
    tick(service.pollMs);
    http.expectOne(connectionUrl('C1')).flush(connection({ status: 'pending', updatedAt: T0 }));
    tick();

    expect(pending.result()).toEqual({ ok: false, reason: 'closed' });
  }));

  it('returns timeout and closes the popup when the grant does not complete within timeoutMs', fakeAsync(() => {
    const popup = fakePopup();
    service.pollMs = 2000;
    service.timeoutMs = 5000;
    const pending = startConnect(popup as any);

    flushAuthorize();
    flushBaseline();

    tick(service.pollMs);
    http.expectOne(connectionUrl('C1')).flush(connection({ status: 'pending', updatedAt: T0 }));
    tick();
    expect(pending.result()).toBeUndefined();

    tick(service.pollMs);
    http.expectOne(connectionUrl('C1')).flush(connection({ status: 'pending', updatedAt: T0 }));
    tick();
    expect(pending.result()).toBeUndefined();

    tick(1000);

    expect(pending.result()).toEqual({ ok: false, reason: 'timeout' });
    expect(popup.closed).toBe(true);
  }));

  it('returns request_failed with the server message and closes the popup when authorize fails', fakeAsync(() => {
    const popup = fakePopup();
    const pending = startConnect(popup as any);

    const req = http.expectOne(AUTHORIZE_URL);
    req.flush(
      { success: false, error: 'OAuth is not configured', code: 'not_configured' },
      { status: 503, statusText: 'Service Unavailable' }
    );
    tick();

    expect(pending.result()).toEqual({
      ok: false,
      reason: 'request_failed',
      message: 'OAuth is not configured',
      code: 'not_configured'
    });
    expect(popup.closed).toBe(true);
    http.expectNone(connectionUrl('C1'));
  }));
});

describe('IntegrationService.getMcpTools', () => {
  let integrationService: IntegrationService;
  let http: HttpTestingController;

  beforeEach(() => {
    const user_bs = new BehaviorSubject<any>({ token: 'JWT abc' });
    const project_bs = new BehaviorSubject<any>({ _id: 'P1' });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        IntegrationService,
        { provide: AuthService, useValue: { user_bs, project_bs } },
        { provide: AppConfigService, useValue: { getConfig: () => ({ SERVER_BASE_URL: 'http://api/' }) } },
        { provide: LoggerService, useValue: { log: () => {}, debug: () => {}, error: () => {}, warn: () => {}, info: () => {} } }
      ]
    });

    integrationService = TestBed.inject(IntegrationService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('posts only the server url when no OAuth connection is passed', () => {
    integrationService.getMcpTools('https://mcp.example/sse').subscribe();

    const req = http.expectOne('http://api/P1/mcp/tools');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ url: 'https://mcp.example/sse' });
    req.flush({ tools: [] });
  });

  it('posts the connection id when an OAuth reference is passed', () => {
    integrationService.getMcpTools('https://mcp.example/sse', { connection_id: 'C1', mode: 'mcp' }).subscribe();

    const req = http.expectOne('http://api/P1/mcp/tools');
    expect(req.request.body).toEqual({
      url: 'https://mcp.example/sse',
      oauth: { connection_id: 'C1' }
    });
    req.flush({ tools: [] });
  });
});
