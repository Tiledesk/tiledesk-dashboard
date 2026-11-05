import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { Location } from '@angular/common';
import { ComponentFixture, discardPeriodicTasks, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { map } from 'rxjs/operators';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { NotifyService } from 'app/core/notify.service';
import { ConnectorHubService, HubConnection, HubConnector, HubMe } from 'app/services/connector-hub.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { ConnectorConnectionsComponent } from './connector-connections.component';

describe('ConnectorConnectionsComponent', () => {
  let fixture: ComponentFixture<ConnectorConnectionsComponent>;
  let component: ConnectorConnectionsComponent;
  let hub: jasmine.SpyObj<ConnectorHubService>;
  let notify: jasmine.SpyObj<NotifyService>;
  let logger: jasmine.SpyObj<LoggerService>;
  let router: Router;
  let navigate: jasmine.Spy;
  let query$: BehaviorSubject<any>;
  let replaceHref: jasmine.Spy;

  const PAGE = 'https://app.test/v3/dashboard/';
  const HASH = '#/project/p1/integrations?name=connector_item:acme&tab=connections';

  const me = (o: Partial<HubMe> = {}): HubMe =>
    ({ role: 'owner', manager: true, hub_admin: false, project_connectors_enabled: true, ...o });
  const connector: HubConnector = {
    id: 'acme', name: 'Acme', version: '1.0.0', description: '', icon: '', owner: 'global', status: 'active'
  };
  const conn = (o: Partial<HubConnection> = {}): HubConnection => ({
    id: 'c1', connector_id: 'acme', label: 'Work', account: { display: 'jane@acme.test' }, status: 'connected',
    created_by: 'u', created_at: '2026-01-01', updated_at: '2026-01-01', ...o
  });
  const rows = (): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll('tr.connection-row'));
  const btn = (cls: string) => fixture.nativeElement.querySelector('button.' + cls);

  function setup(meValue: HubMe, query: any = {}, list: HubConnection[] = [conn()], href: string = PAGE + HASH) {
    query$ = new BehaviorSubject<any>(query);
    hub = jasmine.createSpyObj('ConnectorHubService',
      ['listConnections', 'createConnection', 'install', 'getConnectionStatus', 'renameConnection', 'revokeConnection']);
    hub.listConnections.and.returnValue(of(list));
    notify = jasmine.createSpyObj('NotifyService', ['showWidgetStyleUpdateNotification']);
    logger = jasmine.createSpyObj('LoggerService', ['log', 'debug', 'error', 'warn']);
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), RouterTestingModule],
      declarations: [ConnectorConnectionsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ConnectorHubService, useValue: hub },
        { provide: NotifyService, useValue: notify },
        { provide: LoggerService, useValue: logger },
        {
          provide: ActivatedRoute, deps: [Router],
          useFactory: (r: Router) => Object.create(r.routerState.root, {
            snapshot: { get: () => ({ queryParamMap: convertToParamMap(query$.value) }) },
            queryParamMap: { value: query$.pipe(map((q) => convertToParamMap(q))) }
          })
        }
      ]
    });
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    fixture = TestBed.createComponent(ConnectorConnectionsComponent);
    component = fixture.componentInstance;
    component.connector = connector;
    component.me = meValue;
    navigate = spyOn(component, 'navigate');
    spyOn(component, 'currentHref').and.callFake(() => href);
    replaceHref = spyOn(component, 'replaceHref').and.callFake((url: string) => { href = new URL(url, href).href; });
  }

  function init(meValue: HubMe, query: any = {}, list?: HubConnection[]) {
    setup(meValue, query, list);
    fixture.detectChanges();
  }

  it('load lists the connector\'s connections with account display and status', () => {
    init(me(), {}, [conn(), conn({ id: 'c2', label: 'Home', status: 'pending', account: null })]);
    expect(hub.listConnections).toHaveBeenCalledWith('acme');
    expect(rows().length).toBe(2);
    expect(rows()[0].textContent).toContain('Work');
    expect(rows()[0].textContent).toContain('jane@acme.test');
    expect(rows()[1].textContent).toContain('Home');
  });

  it('a connector id change resets the list, cancels a pending poll and reloads for the new connector', fakeAsync(() => {
    setup(me(), { connection_id: 'c1', status: 'connected' }, [conn()]);
    hub.getConnectionStatus.and.returnValue(of({ connected: false, connection: conn({ status: 'pending' }) }));
    fixture.detectChanges();
    expect(rows().length).toBe(1);
    const pending = new Subject<HubConnection[]>();
    hub.listConnections.and.returnValue(pending);
    const other: HubConnector = { ...connector, id: 'other' };
    component.connector = other;
    component.ngOnChanges({ connector: new SimpleChange(connector, other, false) });
    fixture.detectChanges();
    expect(hub.listConnections.calls.mostRecent().args).toEqual(['other']);
    expect(rows().length).toBe(0);
    tick(15000);
    expect(hub.getConnectionStatus).toHaveBeenCalledTimes(1);
    pending.next([conn({ id: 'o1', connector_id: 'other', label: 'Other' })]);
    fixture.detectChanges();
    expect(rows().length).toBe(1);
    expect(rows()[0].textContent).toContain('Other');
  }));

  it('ngOnChanges on the first binding or the same connector id does not reload', () => {
    init(me());
    component.ngOnChanges({ connector: new SimpleChange(undefined, connector, true) });
    component.ngOnChanges({ connector: new SimpleChange(connector, { ...connector }, false) });
    expect(hub.listConnections).toHaveBeenCalledTimes(1);
  });

  it('non-manager sees no add / rename / reconnect / revoke buttons', () => {
    init(me({ role: 'agent', manager: false }));
    expect(component.canManage).toBe(false);
    expect(rows().length).toBe(1);
    ['add-account', 'reconnect', 'rename', 'revoke'].forEach((c) => expect(btn(c)).toBeNull());
  });

  it('manager sees add / rename / revoke, and reconnect only on non-connected rows', () => {
    init(me(), {}, [conn(), conn({ id: 'c2', status: 'disconnected' })]);
    expect(component.canManage).toBe(true);
    ['add-account', 'rename', 'revoke'].forEach((c) => expect(btn(c)).not.toBeNull());
    expect(fixture.nativeElement.querySelectorAll('button.reconnect').length).toBe(1);
    expect(rows()[0].querySelector('button.reconnect')).toBeNull();
  });

  it('addAccount creates a connection then installs with a return_url on this page and navigates to auth_url', () => {
    init(me());
    hub.createConnection.and.returnValue(of(conn({ id: 'new', status: 'pending' })));
    hub.install.and.returnValue(of({ auth_url: 'https://provider.test/consent' }));
    component.addAccount();
    expect(hub.createConnection).toHaveBeenCalledWith('acme');
    expect(hub.install).toHaveBeenCalledWith('new', component.returnUrl());
    expect(navigate).toHaveBeenCalledWith('https://provider.test/consent');
  });

  ['javascript:alert(1)', 'data:text/html,<script>alert(1)</script>', 'http://provider.test/consent'].forEach((unsafe) => {
    it(`an unsafe auth_url (${unsafe.split(':')[0]}:) is not navigated: generic error, logged, list reloaded`, () => {
      init(me());
      hub.createConnection.and.returnValue(of(conn({ id: 'new', status: 'pending' })));
      hub.install.and.returnValue(of({ auth_url: unsafe }));
      component.addAccount();
      expect(navigate).not.toHaveBeenCalled();
      expect(notify.showWidgetStyleUpdateNotification).toHaveBeenCalledWith('Integration.ConnectorErr_unknown', 3, 'error');
      expect(logger.error).toHaveBeenCalled();
      expect(component.isBusy).toBe(false);
      expect(hub.listConnections).toHaveBeenCalledTimes(2);
    });
  });

  it('reconnect with a javascript: auth_url does not navigate', () => {
    init(me());
    hub.install.and.returnValue(of({ auth_url: 'javascript:alert(1)' }));
    component.reconnect(conn());
    expect(navigate).not.toHaveBeenCalled();
    expect(notify.showWidgetStyleUpdateNotification).toHaveBeenCalledWith('Integration.ConnectorErr_unknown', 3, 'error');
  });

  it('install answering { fields } shows the not-supported message and does not navigate', () => {
    init(me());
    hub.createConnection.and.returnValue(of(conn({ id: 'new', status: 'pending' })));
    hub.install.and.returnValue(of({ fields: [{ name: 'api_key' }] }));
    component.addAccount();
    expect(navigate).not.toHaveBeenCalled();
    expect(notify.showWidgetStyleUpdateNotification)
      .toHaveBeenCalledWith('Integration.ConnectorApiKeyNotSupported', 3, 'warning');
  });

  it('a failing install maps the hub error to a translation key and logs the raw text only', () => {
    init(me());
    hub.createConnection.and.returnValue(throwError({ status: 400, error: { code: 'invalid_return_url', error: 'raw hub text' } }));
    component.addAccount();
    expect(notify.showWidgetStyleUpdateNotification).toHaveBeenCalledWith('Integration.ConnectorErr_invalid_return_url', 3, 'error');
    expect(notify.showWidgetStyleUpdateNotification).not.toHaveBeenCalledWith('raw hub text', 3, 'error');
    expect(logger.error).toHaveBeenCalled();
  });

  it('install failing after createConnection reloads the list', () => {
    init(me());
    hub.createConnection.and.returnValue(of(conn({ id: 'new', status: 'pending' })));
    hub.install.and.returnValue(throwError({ status: 500, error: { code: 'x' } }));
    component.addAccount();
    expect(hub.listConnections).toHaveBeenCalledTimes(2);
  });

  it('install answering neither auth_url nor fields shows the generic error', () => {
    init(me());
    hub.createConnection.and.returnValue(of(conn({ id: 'new', status: 'pending' })));
    hub.install.and.returnValue(of({}));
    component.addAccount();
    expect(navigate).not.toHaveBeenCalled();
    expect(notify.showWidgetStyleUpdateNotification).toHaveBeenCalledWith('Integration.ConnectorErr_unknown', 3, 'error');
  });

  it('listConnections failing leaves an empty list and shows the error key', () => {
    init(me());
    hub.listConnections.and.returnValue(throwError({ status: 403, error: { code: 'not_a_member', error: 'raw' } }));
    component.load();
    fixture.detectChanges();
    expect(rows().length).toBe(0);
    expect(notify.showWidgetStyleUpdateNotification).toHaveBeenCalledWith('Integration.ConnectorErr_not_a_member', 3, 'error');
  });

  it('getConnectionStatus erroring toasts the error key, reloads and clears the params', () => {
    setup(me(), { connection_id: 'c1', status: 'connected' });
    hub.getConnectionStatus.and.returnValue(throwError({ status: 500, error: { code: 'x' } }));
    fixture.detectChanges();
    expect(notify.showWidgetStyleUpdateNotification).toHaveBeenCalledWith('Integration.ConnectorErr_unknown', 3, 'error');
    expect(hub.listConnections).toHaveBeenCalledTimes(2);
    expect(router.navigate).toHaveBeenCalledTimes(1);
  });

  it('destroying while the status request is pending: no toast, no reload, no navigate', () => {
    setup(me(), { connection_id: 'c1', status: 'connected' });
    const pending = new Subject<any>();
    hub.getConnectionStatus.and.returnValue(pending);
    fixture.detectChanges();
    fixture.destroy();
    pending.next({ connected: true, connection: conn() });
    expect(notify.showWidgetStyleUpdateNotification).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(hub.listConnections).toHaveBeenCalledTimes(1);
  });

  it('a second return on the same instance supersedes an in-flight one (no stale toast)', () => {
    setup(me(), { connection_id: 'c1', status: 'connected' });
    const first = new Subject<any>();
    hub.getConnectionStatus.and.returnValues(first, of({ connected: true, connection: conn({ id: 'c2' }) }));
    fixture.detectChanges();
    query$.next({ connection_id: 'c2', status: 'connected' });
    expect(notify.showWidgetStyleUpdateNotification).toHaveBeenCalledTimes(1);
    first.next({ connected: true, connection: conn() });
    expect(notify.showWidgetStyleUpdateNotification).toHaveBeenCalledTimes(1);
    expect(hub.getConnectionStatus.calls.allArgs()).toEqual([['c1'], ['c2']]);
  });

  it('clearing the params (or re-emitting the same return) does not re-trigger handling', () => {
    setup(me(), { connection_id: 'c1', status: 'connected' });
    hub.getConnectionStatus.and.returnValue(of({ connected: true, connection: conn() }));
    fixture.detectChanges();
    query$.next({ connection_id: 'c1', status: 'connected', tab: 'connections' });
    query$.next({ tab: 'connections' });
    expect(hub.getConnectionStatus).toHaveBeenCalledTimes(1);
    expect(notify.showWidgetStyleUpdateNotification).toHaveBeenCalledTimes(1);
  });

  it('reconnect installs on the existing connection id (no createConnection)', () => {
    init(me());
    hub.install.and.returnValue(of({ auth_url: 'https://provider.test/consent' }));
    component.reconnect(conn());
    expect(hub.createConnection).not.toHaveBeenCalled();
    expect(hub.install).toHaveBeenCalledWith('c1', component.returnUrl());
    expect(navigate).toHaveBeenCalledWith('https://provider.test/consent');
  });

  it('rename sends the new label and reloads; an empty label is ignored', fakeAsync(() => {
    init(me());
    hub.renameConnection.and.returnValue(of(conn({ label: 'New' })));
    spyOn(component, 'promptLabel').and.returnValues(Promise.resolve('  New '), Promise.resolve('   '), Promise.resolve(null));
    component.rename(conn());
    tick();
    expect(hub.renameConnection).toHaveBeenCalledWith('c1', 'New');
    expect(hub.listConnections).toHaveBeenCalledTimes(2);
    component.rename(conn());
    tick();
    component.rename(conn());
    tick();
    expect(hub.renameConnection).toHaveBeenCalledTimes(1);
  }));

  it('revoke asks for confirmation, revokes and reloads', fakeAsync(() => {
    init(me());
    spyOn(component, 'confirmRevoke').and.returnValue(Promise.resolve(true));
    hub.revokeConnection.and.returnValue(of(undefined));
    component.revoke(conn());
    tick();
    expect(hub.revokeConnection).toHaveBeenCalledWith('c1');
    expect(hub.listConnections).toHaveBeenCalledTimes(2);
  }));

  it('revoke with revoke_failed offers remove anyway and retries with force=true', fakeAsync(() => {
    init(me());
    spyOn(component, 'confirmRevoke').and.returnValue(Promise.resolve(true));
    const anyway = spyOn(component, 'confirmRemoveAnyway').and.returnValue(Promise.resolve(true));
    hub.revokeConnection.and.returnValues(throwError({ status: 502, error: { code: 'revoke_failed' } }), of(undefined));
    component.revoke(conn());
    tick();
    expect(anyway).toHaveBeenCalled();
    expect(hub.revokeConnection.calls.allArgs()).toEqual([['c1'], ['c1', true]]);
    expect(hub.listConnections).toHaveBeenCalledTimes(2);
  }));

  it('cancelling the remove-anyway offer leaves the row', fakeAsync(() => {
    init(me());
    spyOn(component, 'confirmRevoke').and.returnValue(Promise.resolve(true));
    spyOn(component, 'confirmRemoveAnyway').and.returnValue(Promise.resolve(false));
    hub.revokeConnection.and.returnValue(throwError({ status: 502, error: { code: 'revoke_failed' } }));
    component.revoke(conn());
    tick();
    expect(hub.revokeConnection).toHaveBeenCalledTimes(1);
    expect(hub.listConnections).toHaveBeenCalledTimes(1);
    expect(rows().length).toBe(1);
  }));

  it('handleReturn with status=connected polls status until connected, toasts once, reloads and clears the query params',
    fakeAsync(() => {
      setup(me(), { connection_id: 'c1', status: 'connected' });
      hub.getConnectionStatus.and.returnValues(
        of({ connected: false, connection: conn({ status: 'pending' }) }),
        of({ connected: true, connection: conn() }));
      fixture.detectChanges();
      expect(hub.getConnectionStatus).toHaveBeenCalledTimes(1);
      expect(notify.showWidgetStyleUpdateNotification).not.toHaveBeenCalled();
      tick(1500);
      expect(hub.getConnectionStatus).toHaveBeenCalledTimes(2);
      expect(notify.showWidgetStyleUpdateNotification).toHaveBeenCalledWith('Integration.ConnectorAccountConnected', 3, 'success');
      expect(notify.showWidgetStyleUpdateNotification).toHaveBeenCalledTimes(1);
      expect(hub.listConnections).toHaveBeenCalledTimes(2);
      expect(router.navigate).toHaveBeenCalledWith([], {
        queryParams: { connection_id: null, status: null }, queryParamsHandling: 'merge', replaceUrl: true
      });
      tick(15000);
      expect(hub.getConnectionStatus).toHaveBeenCalledTimes(2);
    }));

  it('handleReturn gives up after 10 polls with an error toast', fakeAsync(() => {
    setup(me(), { connection_id: 'c1', status: 'connected' });
    hub.getConnectionStatus.and.returnValue(of({ connected: false, connection: conn({ status: 'pending' }) }));
    fixture.detectChanges();
    tick(15000);
    expect(hub.getConnectionStatus).toHaveBeenCalledTimes(10);
    expect(notify.showWidgetStyleUpdateNotification).toHaveBeenCalledWith('Integration.ConnectorAccountFailed', 3, 'error');
      expect(notify.showWidgetStyleUpdateNotification).toHaveBeenCalledTimes(1);
  }));

  it('handleReturn with status=error toasts an error and does not poll', () => {
    init(me(), { connection_id: 'c1', status: 'error' });
    expect(hub.getConnectionStatus).not.toHaveBeenCalled();
    expect(notify.showWidgetStyleUpdateNotification).toHaveBeenCalledWith('Integration.ConnectorAccountFailed', 3, 'error');
      expect(notify.showWidgetStyleUpdateNotification).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalled();
    expect(hub.listConnections).toHaveBeenCalledTimes(1);
  });

  it('no return params: no toast, no polling, no navigation', () => {
    init(me());
    expect(notify.showWidgetStyleUpdateNotification).not.toHaveBeenCalled();
    expect(hub.getConnectionStatus).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('ngOnDestroy clears a pending poll timer', fakeAsync(() => {
    setup(me(), { connection_id: 'c1', status: 'connected' });
    hub.getConnectionStatus.and.returnValue(of({ connected: false, connection: conn({ status: 'pending' }) }));
    fixture.detectChanges();
    fixture.destroy();
    tick(15000);
    expect(hub.getConnectionStatus).toHaveBeenCalledTimes(1);
  }));

  it('returnUrl keeps the origin and sub-path and puts the route in the hash (name=connector_item:<id>, tab=connections)', () => {
    setup(me());
    spyOn(TestBed.inject(Location), 'prepareExternalUrl').and.callFake((u: string) => '#' + u);
    fixture.detectChanges();
    const url = new URL(component.returnUrl());
    expect(url.origin).toBe('https://app.test');
    expect(url.pathname).toBe('/v3/dashboard/');
    expect(url.search).toBe('');
    expect(url.hash.startsWith('#/')).toBe(true);
    expect(decodeURIComponent(url.hash)).toContain('name=connector_item:acme');
    expect(url.hash).toContain('tab=connections');
  });

  it('a return in the outer query (before the #) is handled once, the outer params stripped and the hash kept', () => {
    setup(me(), { name: 'connector_item:acme', tab: 'connections' }, [conn()],
      PAGE + '?connection_id=c1&status=connected&keep=1' + HASH);
    hub.getConnectionStatus.and.returnValue(of({ connected: true, connection: conn() }));
    fixture.detectChanges();
    expect(hub.getConnectionStatus).toHaveBeenCalledWith('c1');
    expect(notify.showWidgetStyleUpdateNotification).toHaveBeenCalledWith('Integration.ConnectorAccountConnected', 3, 'success');
    expect(replaceHref).toHaveBeenCalledTimes(1);
    expect(replaceHref.calls.mostRecent().args[0]).toBe('/v3/dashboard/?keep=1' + HASH);
    query$.next({ name: 'connector_item:acme', tab: 'connections' });
    expect(hub.getConnectionStatus).toHaveBeenCalledTimes(1);
    expect(notify.showWidgetStyleUpdateNotification).toHaveBeenCalledTimes(1);
  });

  it('an outer status=error return toasts once and strips the outer params', () => {
    setup(me(), { tab: 'connections' }, [conn()], PAGE + '?connection_id=c1&status=error' + HASH);
    fixture.detectChanges();
    expect(hub.getConnectionStatus).not.toHaveBeenCalled();
    expect(notify.showWidgetStyleUpdateNotification).toHaveBeenCalledWith('Integration.ConnectorAccountFailed', 3, 'error');
    expect(replaceHref.calls.mostRecent().args[0]).toBe('/v3/dashboard/' + HASH);
  });

  it('the outer query wins over the inner one', () => {
    setup(me(), { connection_id: 'inner', status: 'connected' }, [conn()], PAGE + '?connection_id=outer&status=connected' + HASH);
    hub.getConnectionStatus.and.returnValue(of({ connected: true, connection: conn() }));
    fixture.detectChanges();
    expect(hub.getConnectionStatus.calls.allArgs()).toEqual([['outer']]);
  });

  it('an inner-query return does not rewrite the outer URL', () => {
    setup(me(), { connection_id: 'c1', status: 'connected' });
    hub.getConnectionStatus.and.returnValue(of({ connected: true, connection: conn() }));
    fixture.detectChanges();
    expect(hub.getConnectionStatus).toHaveBeenCalledWith('c1');
    expect(replaceHref).not.toHaveBeenCalled();
  });
});
