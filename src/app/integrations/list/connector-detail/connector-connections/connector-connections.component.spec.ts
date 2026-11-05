import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, discardPeriodicTasks, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
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

  function setup(meValue: HubMe, query: any = {}, list: HubConnection[] = [conn()]) {
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
          useFactory: (r: Router) => Object.create(r.routerState.root, { snapshot: { value: { queryParamMap: convertToParamMap(query) } } })
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

  it('non-manager sees no add / rename / reconnect / revoke buttons', () => {
    init(me({ role: 'agent', manager: false }));
    expect(component.canManage).toBe(false);
    expect(rows().length).toBe(1);
    ['add-account', 'reconnect', 'rename', 'revoke'].forEach((c) => expect(btn(c)).toBeNull());
  });

  it('manager sees the add / rename / reconnect / revoke buttons', () => {
    init(me());
    expect(component.canManage).toBe(true);
    ['add-account', 'reconnect', 'rename', 'revoke'].forEach((c) => expect(btn(c)).not.toBeNull());
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

  it('returnUrl contains name=connector_item:<id> and tab=connections and the current origin', () => {
    init(me());
    const url = component.returnUrl();
    expect(url.startsWith(window.location.origin)).toBe(true);
    expect(decodeURIComponent(url)).toContain('name=connector_item:acme');
    expect(url).toContain('tab=connections');
  });
});
