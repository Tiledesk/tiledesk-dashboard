import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from './app-config.service';
import { LoggerService } from './logger/logger.service';
import { ConnectorHubService, HubMe } from './connector-hub.service';

describe('ConnectorHubService', () => {
  const HUB = 'http://hub.test';
  let service: ConnectorHubService;
  let http: HttpTestingController;
  let projectBs: BehaviorSubject<any>;
  let userBs: BehaviorSubject<any>;
  let config: any;

  const me = (o: Partial<HubMe>): HubMe =>
    ({ role: 'owner', manager: false, hub_admin: false, project_connectors_enabled: false, ...o });

  function setup(cfg: any) {
    config = cfg;
    projectBs = new BehaviorSubject<any>({ _id: 'p1' });
    userBs = new BehaviorSubject<any>({ token: 'JWT abc' });
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: { user_bs: userBs, project_bs: projectBs } },
        { provide: AppConfigService, useValue: { getConfig: () => config } },
        { provide: LoggerService, useValue: jasmine.createSpyObj('LoggerService', ['log', 'debug', 'error', 'warn']) },
      ],
    });
    service = TestBed.inject(ConnectorHubService);
    http = TestBed.inject(HttpTestingController);
  }

  describe('configured', () => {
    beforeEach(() => setup({ connectorHubUrl: HUB + '/' }));
    afterEach(() => http.verify());

    it('isConfigured is true for a URL', () => {
      expect(service.isConfigured()).toBe(true);
    });

    it('getMe sends the user token in Authorization and caches per project', () => {
      let got: any;
      service.getMe().subscribe(m => got = m);
      const req = http.expectOne(HUB + '/projects/p1/me');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('JWT abc');
      req.flush(me({ manager: true }));
      expect(got.manager).toBe(true);

      service.getMe().subscribe();
      http.expectNone(HUB + '/projects/p1/me');

      projectBs.next({ _id: 'p2' });
      service.getMe().subscribe();
      http.expectOne(HUB + '/projects/p2/me').flush(me({}));

      service.getMe(true).subscribe();
      http.expectOne(HUB + '/projects/p2/me').flush(me({}));
    });

    it('getMe drops the cache on error so a retry refetches', () => {
      let err: any;
      service.getMe().subscribe({ error: e => err = e });
      http.expectOne(HUB + '/projects/p1/me').flush({ code: 'not_a_member' }, { status: 403, statusText: 'Forbidden' });
      expect(err.status).toBe(403);
      service.getMe().subscribe();
      http.expectOne(HUB + '/projects/p1/me').flush(me({}));
    });

    it('clears the /me cache when the token changes and omits Authorization without a token', () => {
      service.getMe().subscribe();
      http.expectOne(HUB + '/projects/p1/me').flush(me({}));
      service.getMe().subscribe();
      http.expectNone(HUB + '/projects/p1/me');

      userBs.next({ token: 'JWT other' });
      service.getMe().subscribe();
      const req = http.expectOne(HUB + '/projects/p1/me');
      expect(req.request.headers.get('Authorization')).toBe('JWT other');
      req.flush(me({}));

      userBs.next(null);
      service.getMe().subscribe();
      const anon = http.expectOne(HUB + '/projects/p1/me');
      expect(anon.request.headers.has('Authorization')).toBe(false);
      anon.flush(me({}));
    });

    it('registryScope', () => {
      expect(service.registryScope(me({ hub_admin: true }))).toBe('global');
      expect(service.registryScope(me({ hub_admin: false, manager: true, project_connectors_enabled: true }))).toBe('project');
      expect(service.registryScope(me({ manager: true, project_connectors_enabled: false }))).toBeNull();
      expect(service.registryScope(me({ manager: false, project_connectors_enabled: true }))).toBeNull();
    });

    it('listConnectors uses GET /connectors for a hub admin, keeping global and current-project connectors only', () => {
      let got: any[];
      service.listConnectors(me({ hub_admin: true })).subscribe(l => got = l);
      const req = http.expectOne(HUB + '/connectors');
      expect(req.request.method).toBe('GET');
      req.flush({ connectors: [
        { id: 'a', owner: 'global', status: 'active' },
        { id: 'b', owner: 'p1', status: 'disabled' },
        { id: 'c', owner: 'other', status: 'active' },
      ] });
      expect(got.map(c => c.id)).toEqual(['a', 'b']);
    });

    it('listConnectors maps the catalog for a non admin', () => {
      let got: any[];
      service.listConnectors(me({ manager: true })).subscribe(l => got = l);
      http.expectOne(HUB + '/projects/p1/catalog').flush({ contract_version: 2, connectors: [
        { id: 'g', name: 'Google', version: '1.0.0', description: 'd', icon: 'i', owner: 'global', auth: {}, groups: [], actions: [], triggers: [] },
      ] });
      expect(got).toEqual([{ id: 'g', name: 'Google', version: '1.0.0', description: 'd', icon: 'i', owner: 'global', status: 'active' }]);
    });

    it('listConnectors for project scope merges the own connectors, including disabled ones', () => {
      let got: any[];
      service.listConnectors(me({ manager: true, project_connectors_enabled: true })).subscribe(l => got = l);
      http.expectOne(HUB + '/projects/p1/catalog').flush({ connectors: [
        { id: 'g', name: 'G', version: '1', description: '', icon: '', owner: 'global' },
        { id: 'mine', name: 'M', version: '1', description: '', icon: '', owner: 'p1' },
      ] });
      http.expectOne(HUB + '/projects/p1/connectors').flush({ connectors: [
        { id: 'mine', name: 'M', version: '1', description: '', icon: '', owner: 'p1', status: 'active', base_url: 'http://x' },
        { id: 'off', name: 'O', version: '1', description: '', icon: '', owner: 'p1', status: 'disabled', base_url: 'http://y' },
      ] });
      expect(got.map(c => c.id + ':' + c.status)).toEqual(['g:active', 'mine:active', 'off:disabled']);
      expect(got[1].base_url).toBe('http://x');
    });

    it('getManifest hits the project manifest path', () => {
      service.getManifest('g').subscribe();
      http.expectOne(HUB + '/projects/p1/connectors/g/manifest').flush({});
    });

    it('validate / register hit the global path for global scope and /projects/p1/connectors for project scope', () => {
      service.validate('http://c', 'http://int', 'global').subscribe();
      let r = http.expectOne(HUB + '/connectors/validate');
      expect(r.request.method).toBe('POST');
      expect(r.request.body).toEqual({ base_url: 'http://c', internal_url: 'http://int' });
      r.flush({ valid: true, errors: [] });

      service.validate('http://c', null, 'project').subscribe();
      r = http.expectOne(HUB + '/projects/p1/connectors/validate');
      expect(r.request.body).toEqual({ base_url: 'http://c' });
      r.flush({ valid: true, errors: [] });

      service.register('http://c', null, 'global').subscribe();
      r = http.expectOne(HUB + '/connectors');
      expect(r.request.method).toBe('POST');
      expect(r.request.body).toEqual({ base_url: 'http://c' });
      r.flush({});

      service.register('http://c', 'http://int', 'project').subscribe();
      r = http.expectOne(HUB + '/projects/p1/connectors');
      expect(r.request.body).toEqual({ base_url: 'http://c', internal_url: 'http://int' });
      r.flush({});
    });

    it('refresh posts to /:id/refresh', () => {
      service.refresh('x', 'global').subscribe();
      expect(http.expectOne(HUB + '/connectors/x/refresh').request.method).toBe('POST');
      service.refresh('x', 'project').subscribe();
      http.expectOne(HUB + '/projects/p1/connectors/x/refresh').flush({});
    });

    it('setEnabled maps to /disable and /enable; removeConnector sends DELETE', () => {
      service.setEnabled('x', false, 'global').subscribe();
      expect(http.expectOne(HUB + '/connectors/x/disable').request.method).toBe('POST');
      service.setEnabled('x', true, 'project').subscribe();
      http.expectOne(HUB + '/projects/p1/connectors/x/enable').flush({});
      service.removeConnector('x', 'project').subscribe();
      const r = http.expectOne(HUB + '/projects/p1/connectors/x');
      expect(r.request.method).toBe('DELETE');
      r.flush(null, { status: 204, statusText: 'No Content' });
    });

    it('listConnections adds connector_id and include_pending=false and unwraps the list', () => {
      let got: any;
      service.listConnections('g').subscribe(l => got = l);
      const r = http.expectOne(req => req.url === HUB + '/projects/p1/connections');
      expect(r.request.params.get('connector_id')).toBe('g');
      expect(r.request.params.get('include_pending')).toBe('false');
      r.flush({ connections: [{ id: 'c1' }] });
      expect(got).toEqual([{ id: 'c1' }]);
    });

    it('createConnection posts connector_id and optional label', () => {
      service.createConnection('g', 'Work').subscribe();
      const r = http.expectOne(HUB + '/projects/p1/connections');
      expect(r.request.method).toBe('POST');
      expect(r.request.body).toEqual({ connector_id: 'g', label: 'Work' });
      r.flush({});
      service.createConnection('g').subscribe();
      expect(http.expectOne(HUB + '/projects/p1/connections').request.body).toEqual({ connector_id: 'g' });
    });

    it('revokeConnection(id, true) appends ?force=true, (id) does not', () => {
      service.revokeConnection('c1', true).subscribe();
      const forced = http.expectOne(HUB + '/projects/p1/connections/c1?force=true');
      expect(forced.request.method).toBe('DELETE');
      forced.flush(null, { status: 204, statusText: 'No Content' });
      service.revokeConnection('c1').subscribe();
      http.expectOne(HUB + '/projects/p1/connections/c1').flush(null, { status: 204, statusText: 'No Content' });
    });

    it('install posts { return_url }, status gets, renameConnection patches { label }', () => {
      service.install('c1', 'http://dash/x').subscribe();
      const i = http.expectOne(HUB + '/projects/p1/connections/c1/install');
      expect(i.request.method).toBe('POST');
      expect(i.request.body).toEqual({ return_url: 'http://dash/x' });
      i.flush({ auth_url: 'u' });

      service.getConnectionStatus('c1').subscribe();
      expect(http.expectOne(HUB + '/projects/p1/connections/c1/status').request.method).toBe('GET');

      service.renameConnection('c1', 'New').subscribe();
      const p = http.expectOne(HUB + '/projects/p1/connections/c1');
      expect(p.request.method).toBe('PATCH');
      expect(p.request.body).toEqual({ label: 'New' });
    });
  });

  describe('not configured', () => {
    for (const value of [undefined, '', '${CONNECTOR_HUB_URL}']) {
      it(`isConfigured is false for ${JSON.stringify(value)}`, () => {
        setup({ connectorHubUrl: value });
        expect(service.isConfigured()).toBe(false);
      });
    }

    it('getMe and every call error with hub_not_configured without a request', () => {
      setup({});
      const errors: string[] = [];
      const track = (o: any) => o.subscribe({ error: (e: Error) => errors.push(e.message) });
      track(service.getMe());
      track(service.listConnectors(me({ hub_admin: true })));
      track(service.listConnectors(me({})));
      track(service.getManifest('g'));
      track(service.validate('u', null, 'global'));
      track(service.register('u', null, 'project'));
      track(service.refresh('x', 'global'));
      track(service.setEnabled('x', true, 'global'));
      track(service.removeConnector('x', 'global'));
      track(service.listConnections('g'));
      track(service.createConnection('g'));
      track(service.install('c', 'u'));
      track(service.getConnectionStatus('c'));
      track(service.renameConnection('c', 'l'));
      track(service.revokeConnection('c'));
      expect(errors.length).toBe(15);
      expect(errors.every(m => m === 'hub_not_configured')).toBe(true);
      http.verify();
    });
  });
});
