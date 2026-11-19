import { TestBed, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { NgZone } from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';
import { KbSourcesService } from './kb-sources.service';
import { AppConfigService } from './app-config.service';
import { AuthService } from 'app/core/auth.service';
import { LoggerService } from './logger/logger.service';

const BASE = 'https://api.example.com/';
const URL_ = BASE + 'prj1/kb/sources';

describe('KbSourcesService', () => {
  let service: KbSourcesService;
  let http: HttpTestingController;
  let popup: { closed: boolean; close: jasmine.Spy; location: { href: string } };
  let openSpy: jasmine.Spy;
  let fakeChannel: any;
  function relay(data: any) { fakeChannel.onmessage({ data } as MessageEvent); }

  function setup(serverBase = BASE) {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AppConfigService, useValue: { getConfig: () => ({ SERVER_BASE_URL: serverBase }) } },
        { provide: AuthService, useValue: {
          user_bs: new BehaviorSubject({ token: 'JWT tok' }),
          project_bs: new BehaviorSubject({ _id: 'prj1' }) } },
        { provide: LoggerService, useValue: { log: () => {}, error: () => {}, warn: () => {} } },
      ]
    });
    fakeChannel = { onmessage: null, postMessage: () => {}, close: () => {} };
    spyOn(KbSourcesService.prototype as any, 'createChannel').and.returnValue(fakeChannel);
    service = TestBed.inject(KbSourcesService);
    http = TestBed.inject(HttpTestingController);
    popup = { closed: false, close: jasmine.createSpy('close'), location: { href: '' } };
    openSpy = spyOn(window, 'open').and.returnValue(popup as any);
  }

  function post(origin: string, data: any, source: any = 'popup') {
    const ev = new MessageEvent('message', { origin, data });
    // MessageEvent only accepts real windows as source: override on the instance
    Object.defineProperty(ev, 'source', { value: source === 'popup' ? popup : source });
    window.dispatchEvent(ev);
  }

  afterEach(() => http.verify());

  describe('http', () => {
    beforeEach(() => setup());

    it('getProviders', () => {
      service.getProviders().subscribe();
      const r = http.expectOne(URL_ + '/providers');
      expect(r.request.method).toBe('GET');
      expect(r.request.headers.get('Authorization')).toBe('JWT tok');
      r.flush({});
    });
    it('getConnections', () => {
      service.getConnections().subscribe();
      http.expectOne(r => r.method === 'GET' && r.url === URL_ + '/connections').flush([]);
    });
    it('deleteConnection without and with cascade', () => {
      service.deleteConnection('c1').subscribe();
      http.expectOne(r => r.method === 'DELETE' && r.urlWithParams === URL_ + '/connections/c1').flush({});
      service.deleteConnection('c1', true).subscribe();
      http.expectOne(r => r.method === 'DELETE' && r.urlWithParams === URL_ + '/connections/c1?cascade=true').flush({});
    });
    it('getRoots', () => {
      service.getRoots('c1').subscribe();
      http.expectOne(URL_ + '/connections/c1/roots').flush({ items: [] });
    });
    it('getDrives', () => {
      service.getDrives('c1', 's 1').subscribe();
      http.expectOne(r => r.url === URL_ + '/connections/c1/drives' && r.params.get('site') === 's 1').flush({ items: [] });
    });
    it('getChildren with and without item/page', () => {
      service.getChildren('c1', 'd1').subscribe();
      const a = http.expectOne(r => r.url === URL_ + '/connections/c1/drives/d1/children');
      expect(a.request.params.keys().length).toBe(0);
      a.flush({ items: [] });
      service.getChildren('c1', 'd1', 'i1', 'tok').subscribe();
      const b = http.expectOne(r => r.url === URL_ + '/connections/c1/drives/d1/children');
      expect(b.request.params.get('item')).toBe('i1');
      expect(b.request.params.get('page')).toBe('tok');
      b.flush({ items: [] });
    });
    it('importItems posts to the provider path', () => {
      service.importItems('googledrive', { connection_id: 'c1', items: [] } as any).subscribe();
      const r = http.expectOne(URL_ + '/googledrive/import');
      expect(r.request.method).toBe('POST');
      r.flush({});
    });

    it('importItems', () => {
      const req = { namespace: 'ns', connection_id: 'c1', items: [{ drive_id: 'd', item_id: 'i', kind: 'file' as const }], refresh_rate: 'never' };
      service.importItems('microsoft365', req).subscribe();
      const r = http.expectOne(URL_ + '/microsoft365/import');
      expect(r.request.method).toBe('POST');
      expect(r.request.body).toEqual(req);
      r.flush({ contents: [] });
    });
    it('updateFolderRefreshRate', () => {
      service.updateFolderRefreshRate('k1', 'daily').subscribe();
      const r = http.expectOne(URL_ + '/folders/k1');
      expect(r.request.method).toBe('PATCH');
      expect(r.request.body).toEqual({ refresh_rate: 'daily' });
      r.flush({});
    });
    it('syncFolder', () => {
      service.syncFolder('k1').subscribe();
      const r = http.expectOne(URL_ + '/folders/k1/sync');
      expect(r.request.method).toBe('POST');
      r.flush({});
    });
  });

  describe('connect per provider', () => {
    beforeEach(() => setup());

    it('connect(googledrive) posts to /googledrive/connect', () => {
      service.connect('googledrive', 'c1');
      const r = http.expectOne(URL_ + '/googledrive/connect');
      expect(r.request.body.connection_id).toBe('c1');
      service.cancelConnect();
    });

    it('connectInWindow(googledrive) posts to /googledrive/connect', () => {
      service.connectInWindow('googledrive', 'c1').catch(() => {});
      http.expectOne(URL_ + '/googledrive/connect').flush({}, { status: 500, statusText: 'x' });
    });
  });

  describe('connectInWindow', () => {
    beforeEach(() => setup());

    it('POSTs origin and a clean return_url, then navigates to authorize_url', async () => {
      const nav = spyOn(service, 'navigate');
      const p = service.connectInWindow('microsoft365', 'c1');
      const r = http.expectOne(URL_ + '/microsoft365/connect');
      expect(r.request.method).toBe('POST');
      expect(r.request.body.connection_id).toBe('c1');
      expect(r.request.body.origin).toBe(window.location.origin);
      expect(r.request.body.return_url).toBe(window.location.href.split('?')[0]);
      expect(r.request.body.return_url).not.toContain('?');
      r.flush({ authorize_url: 'https://api.example.com/start?x=1' });
      await p;
      expect(nav).toHaveBeenCalledWith('https://api.example.com/start?x=1');
    });

    it('strips a leftover ms365 query from the hash route', () => {
      expect((service as any).cleanReturnUrl('http://h/#/project/P/knowledge-bases/N?ms365=error&reason=x'))
        .toBe('http://h/#/project/P/knowledge-bases/N');
    });

    it('rejects with connect_failed when authorize_url is missing', async () => {
      const nav = spyOn(service, 'navigate');
      const p = service.connectInWindow('microsoft365');
      http.expectOne(URL_ + '/microsoft365/connect').flush({});
      let err: any; try { await p; } catch (e) { err = e; }
      expect(err).toEqual({ reason: 'connect_failed' });
      expect(nav).not.toHaveBeenCalled();
    });

    it('rejects with connect_failed on an HTTP error', async () => {
      const p = service.connectInWindow('microsoft365');
      http.expectOne(URL_ + '/microsoft365/connect').flush({}, { status: 500, statusText: 'x' });
      let err: any; try { await p; } catch (e) { err = e; }
      expect(err).toEqual({ reason: 'connect_failed' });
    });
  });

  describe('connect', () => {
    beforeEach(() => setup());

    function answerConnect() {
      const r = http.expectOne(URL_ + '/microsoft365/connect');
      expect(r.request.method).toBe('POST');
      expect(r.request.body).toEqual({
        connection_id: 'c1', origin: window.location.origin, return_url: window.location.href.split('?')[0], popup: true
      });
      r.flush({ authorize_url: 'https://api.example.com/kb-sources/oauth/microsoft365/start?ticket=t' });
    }

    it('opens the popup synchronously, then navigates it to authorize_url', fakeAsync(() => {
      service.connect('microsoft365', 'c1');
      expect(openSpy).toHaveBeenCalledWith('', 'ms365-connect', 'width=520,height=680');
      answerConnect();
      expect(popup.location.href).toContain('/start?ticket=t');
      tick(1000); // closed-poll must not leave pending timers
      post(BASE.slice(0, -1), { type: 'ms365-connect', status: 'connected' });
      flushMicrotasks();
    }));

    it('resolves connected on a valid message', fakeAsync(() => {
      let res: any;
      service.connect('microsoft365', 'c1').then(r => res = r);
      answerConnect();
      post('https://api.example.com', { type: 'ms365-connect', status: 'connected', connection_id: 'c1', provider: 'microsoft365' });
      flushMicrotasks();
      expect(res).toEqual({ status: 'connected', reason: undefined, connection_id: 'c1', provider: 'microsoft365' });
    }));

    it('resolves error with reason', fakeAsync(() => {
      let res: any;
      service.connect('microsoft365', 'c1').then(r => res = r);
      answerConnect();
      post('https://api.example.com', { type: 'ms365-connect', status: 'error', reason: 'access_denied' });
      flushMicrotasks();
      expect(res.status).toBe('error');
      expect(res.reason).toBe('access_denied');
    }));

    it('ignores a message from another origin', fakeAsync(() => {
      let res: any;
      service.connect('microsoft365', 'c1').then(r => res = r);
      answerConnect();
      post('https://evil.example.com', { type: 'ms365-connect', status: 'connected' });
      flushMicrotasks();
      expect(res).toBeUndefined();
      post('https://api.example.com', { type: 'ms365-connect', status: 'connected' });
      flushMicrotasks();
      expect(res.status).toBe('connected');
    }));

    it('ignores a message from another window on the server origin', fakeAsync(() => {
      let res: any;
      service.connect('microsoft365', 'c1').then(r => res = r);
      answerConnect();
      post('https://api.example.com', { type: 'ms365-connect', status: 'connected' }, window);
      post('https://api.example.com', { type: 'ms365-connect', status: 'connected' }, null);
      flushMicrotasks();
      expect(res).toBeUndefined();
      post('https://api.example.com', { type: 'ms365-connect', status: 'connected' });
      flushMicrotasks();
      expect(res.status).toBe('connected');
    }));

    it('ignores a status other than connected or error', fakeAsync(() => {
      let res: any;
      service.connect('microsoft365', 'c1').then(r => res = r);
      answerConnect();
      post('https://api.example.com', { type: 'ms365-connect', status: 'blocked' });
      post('https://api.example.com', { type: 'ms365-connect', status: 'closed' });
      post('https://api.example.com', { type: 'ms365-connect' });
      flushMicrotasks();
      expect(res).toBeUndefined();
      popup.closed = true;
      tick(1000);
      flushMicrotasks();
      expect(res.status).toBe('closed');
    }));

    it('closes the popup and resolves connect_failed when authorize_url is missing', fakeAsync(() => {
      let res: any;
      service.connect('microsoft365', 'c1').then(r => res = r);
      http.expectOne(URL_ + '/microsoft365/connect').flush({});
      flushMicrotasks();
      expect(popup.close).toHaveBeenCalled();
      expect(popup.location.href).toBe('');
      expect(res).toEqual({ status: 'error', reason: 'connect_failed' });
    }));

    it('ignores a message with another type', fakeAsync(() => {
      let res: any;
      service.connect('microsoft365', 'c1').then(r => res = r);
      answerConnect();
      post('https://api.example.com', { type: 'other', status: 'connected' });
      post('https://api.example.com', null);
      flushMicrotasks();
      expect(res).toBeUndefined();
      popup.closed = true;
      tick(1000);
      flushMicrotasks();
      expect(res.status).toBe('closed');
    }));

    it('resolves blocked when window.open returns null and sends no request', fakeAsync(() => {
      openSpy.and.returnValue(null);
      let res: any;
      service.connect('microsoft365', 'c1').then(r => res = r);
      flushMicrotasks();
      expect(res).toEqual({ status: 'blocked' });
      http.expectNone(URL_ + '/microsoft365/connect');
    }));

    it('resolves closed when the popup closes', fakeAsync(() => {
      let res: any;
      service.connect('microsoft365', 'c1').then(r => res = r);
      answerConnect();
      tick(1000);
      expect(res).toBeUndefined();
      popup.closed = true;
      tick(1000);
      flushMicrotasks();
      expect(res).toEqual({ status: 'closed' });
    }));

    it('closes the popup and resolves connect_failed when the HTTP call fails', fakeAsync(() => {
      let res: any;
      service.connect('microsoft365', 'c1').then(r => res = r);
      http.expectOne(URL_ + '/microsoft365/connect').flush({ error: 'x' }, { status: 500, statusText: 'err' });
      flushMicrotasks();
      expect(popup.close).toHaveBeenCalled();
      expect(res).toEqual({ status: 'error', reason: 'connect_failed' });
    }));

    it('removes the listener and the timer after resolving, and resolves once', fakeAsync(() => {
      const removeSpy = spyOn(window, 'removeEventListener').and.callThrough();
      let count = 0; let res: any;
      service.connect('microsoft365', 'c1').then(r => { count++; res = r; });
      answerConnect();
      post('https://api.example.com', { type: 'ms365-connect', status: 'connected' });
      flushMicrotasks();
      expect(removeSpy).toHaveBeenCalledWith('message', jasmine.any(Function));
      popup.closed = true;
      tick(5000); // a surviving timer would try to resolve 'closed'
      post('https://api.example.com', { type: 'ms365-connect', status: 'error' });
      flushMicrotasks();
      expect(count).toBe(1);
      expect(res.status).toBe('connected');
    }));
  });

  describe('relayed results (window.opener cut by the sign-in pages)', () => {
    beforeEach(() => setup());

    function answer() {
      http.expectOne(URL_ + '/microsoft365/connect').flush({ authorize_url: 'https://api.example.com/kb-sources/oauth/microsoft365/start?ticket=t' });
    }

    it('a relayed result resolves a pending connect once and drops the timer', fakeAsync(() => {
      let res: any; let count = 0;
      service.connect('microsoft365', 'c1').then(r => { res = r; count++; });
      answer();
      relay({ type: 'ms365-connect', status: 'connected', connection_id: 'c9', provider: 'microsoft365' });
      flushMicrotasks();
      expect(res).toEqual({ status: 'connected', reason: undefined, connection_id: 'c9', provider: 'microsoft365' });
      popup.closed = true;
      tick(3000);
      flushMicrotasks();
      expect(count).toBe(1);
    }));

    it('emits a result relayed after connect resolved closed', fakeAsync(() => {
      const seen: any[] = [];
      const sub = service.relayedConnectResults$.subscribe(r => seen.push(r));
      let res: any;
      service.connect('microsoft365', 'c1').then(r => res = r);
      answer();
      popup.closed = true; // the cut opener looks like a closed popup
      tick(1000);
      flushMicrotasks();
      expect(res).toEqual({ status: 'closed' });
      relay({ type: 'ms365-connect', status: 'error', reason: 'access_denied' });
      expect(seen).toEqual([{ status: 'error', reason: 'access_denied', connection_id: undefined, provider: 'microsoft365' }]);
      sub.unsubscribe();
    }));

    it('emits a relayed result inside the Angular zone', () => {
      const zone = TestBed.inject(NgZone);
      const runSpy = spyOn(zone, 'run').and.callThrough();
      const seen: boolean[] = [];
      const sub = service.relayedConnectResults$.subscribe(() => seen.push(NgZone.isInAngularZone()));
      relay({ type: 'ms365-connect', status: 'connected', connection_id: 'c1', provider: 'googledrive' });
      expect(runSpy).toHaveBeenCalled();
      expect(seen).toEqual([true]);
      sub.unsubscribe();
    });

        it('ignores malformed relayed messages', () => {
      const seen: any[] = [];
      const sub = service.relayedConnectResults$.subscribe(r => seen.push(r));
      relay(null);
      relay({ type: 'other', status: 'connected' });
      relay({ type: 'ms365-connect', status: 'closed' });
      expect(seen).toEqual([]);
      sub.unsubscribe();
    });
  });

  describe('connect origin from authorize_url', () => {
    beforeEach(() => setup());

    it('ignores every message before /connect answers', fakeAsync(() => {
      let res: any;
      service.connect('microsoft365', 'c1').then(r => res = r);
      post('https://api.example.com', { type: 'ms365-connect', status: 'connected' });
      post(BASE.slice(0, -1), { type: 'ms365-connect', status: 'connected' });
      flushMicrotasks();
      expect(res).toBeUndefined();
      http.expectOne(URL_ + '/microsoft365/connect').flush({ authorize_url: 'https://api.example.com/s' });
      popup.closed = true; tick(1000); flushMicrotasks();
      expect(res.status).toBe('closed');
    }));

    it('accepts the origin of authorize_url even when it differs from SERVER_BASE_URL, and ignores SERVER_BASE_URL origin', fakeAsync(() => {
      let res: any;
      service.connect('microsoft365', 'c1').then(r => res = r);
      http.expectOne(URL_ + '/microsoft365/connect').flush({ authorize_url: 'https://public.example.org/kb/start?t=1' });
      post('https://api.example.com', { type: 'ms365-connect', status: 'connected' });
      flushMicrotasks();
      expect(res).toBeUndefined();
      post('https://public.example.org', { type: 'ms365-connect', status: 'connected', connection_id: 'c9', provider: 'microsoft365' });
      flushMicrotasks();
      expect(res.connection_id).toBe('c9');
    }));

    it('resolves connect_failed on an unparsable authorize_url', fakeAsync(() => {
      let res: any;
      service.connect('microsoft365', 'c1').then(r => res = r);
      http.expectOne(URL_ + '/microsoft365/connect').flush({ authorize_url: 'http://' });
      flushMicrotasks();
      expect(popup.close).toHaveBeenCalled();
      expect(res).toEqual({ status: 'error', reason: 'connect_failed' });
    }));

    it('cancelConnect closes the popup, drops listener and timer and resolves closed', fakeAsync(() => {
      const removeSpy = spyOn(window, 'removeEventListener').and.callThrough();
      let res: any;
      service.connect('microsoft365', 'c1').then(r => res = r);
      service.cancelConnect();
      flushMicrotasks();
      expect(popup.close).toHaveBeenCalled();
      expect(removeSpy).toHaveBeenCalledWith('message', jasmine.any(Function));
      expect(res).toEqual({ status: 'closed' });
      http.expectOne(URL_ + '/microsoft365/connect').flush({ authorize_url: 'https://api.example.com/s' });
      expect(popup.location.href).toBe('');
      tick(5000);
    }));

    it('cancelConnect with nothing pending is a no-op', () => {
      expect(() => service.cancelConnect()).not.toThrow();
    });
  });

  describe('connect with a relative server base URL', () => {
    it('resolves the origin against the current location', fakeAsync(() => {
      setup('/api/');
      let res: any;
      service.connect('microsoft365').then(r => res = r);
      http.expectOne('/api/prj1/kb/sources/microsoft365/connect').flush({ authorize_url: '/x' });
      post(window.location.origin, { type: 'ms365-connect', status: 'connected' });
      flushMicrotasks();
      expect(res.status).toBe('connected');
    }));
  });
});
