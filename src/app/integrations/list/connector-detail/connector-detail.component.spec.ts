import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Subject, of, throwError } from 'rxjs';
import { AuthService } from 'app/core/auth.service';
import { NotifyService } from 'app/core/notify.service';
import { ConnectorHubService, HubConnector, HubMe } from 'app/services/connector-hub.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { ConnectorDetailComponent } from './connector-detail.component';

describe('ConnectorDetailComponent', () => {
  let fixture: ComponentFixture<ConnectorDetailComponent>;
  let component: ConnectorDetailComponent;
  let hub: jasmine.SpyObj<ConnectorHubService>;
  let notify: jasmine.SpyObj<NotifyService>;
  let logger: jasmine.SpyObj<LoggerService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let changed: jasmine.Spy;

  const PROJECT = 'p1';
  const me = (o: Partial<HubMe> = {}): HubMe =>
    ({ role: 'owner', manager: true, hub_admin: false, project_connectors_enabled: true, ...o });
  const connector = (o: Partial<HubConnector> = {}): HubConnector => ({
    id: 'acme', name: 'Acme', version: '1.0.0', description: '', icon: '', owner: PROJECT, status: 'active',
    base_url: 'http://acme.test', ...o
  });
  const manifest = {
    actions: [{ id: 'a1', name: 'A1', group: 'g' }, { id: 'a2', name: 'A2' }],
    triggers: [{ id: 't1', name: 'T1' }],
    groups: [{ id: 'g', name: 'G' }]
  };

  function setup(meValue: HubMe, c: HubConnector = connector(), query: any = {}) {
    hub = jasmine.createSpyObj('ConnectorHubService', ['getManifest', 'refresh', 'setEnabled', 'removeConnector']);
    hub.getManifest.and.returnValue(of(manifest));
    notify = jasmine.createSpyObj('NotifyService', ['showWidgetStyleUpdateNotification']);
    logger = jasmine.createSpyObj('LoggerService', ['log', 'debug', 'error', 'warn']);
    dialog = jasmine.createSpyObj('MatDialog', ['open']);
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [ConnectorDetailComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ConnectorHubService, useValue: hub },
        { provide: NotifyService, useValue: notify },
        { provide: LoggerService, useValue: logger },
        { provide: MatDialog, useValue: dialog },
        { provide: AuthService, useValue: { project_bs: new BehaviorSubject({ _id: PROJECT }) } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: (k: string) => query[k] || null } } } }
      ]
    });
    fixture = TestBed.createComponent(ConnectorDetailComponent);
    component = fixture.componentInstance;
    component.connector = c;
    component.me = meValue;
    changed = jasmine.createSpy('changed');
    component.onChanged.subscribe(changed);
    component.ngOnChanges({ connector: {} as any });
    fixture.detectChanges();
  }

  const el = (sel: string): HTMLElement => fixture.nativeElement.querySelector(sel);

  it('renders name, base url and action/trigger counts from the manifest', () => {
    setup(me());
    expect(hub.getManifest).toHaveBeenCalledWith('acme');
    expect(el('.connector-name').textContent).toContain('Acme');
    expect(el('.connector-base-url').textContent).toContain('http://acme.test');
    expect(el('.actions-count').textContent.trim()).toBe('2');
    expect(el('.triggers-count').textContent.trim()).toBe('1');
  });

  it('opens the actions modal with items and groups', () => {
    setup(me());
    component.openActionsModal();
    const cfg = dialog.open.calls.mostRecent().args[1] as any;
    expect(cfg.data.items.length).toBe(2);
    expect(cfg.data.groups).toEqual([{ id: 'g', name: 'G' }]);
    component.openTriggersModal();
    expect((dialog.open.calls.mostRecent().args[1] as any).data.items.length).toBe(1);
  });

  it('registry buttons are hidden for a non-admin member', () => {
    setup(me({ manager: false, role: 'agent' }));
    expect(el('.btn-refresh')).toBeNull();
    expect(el('.btn-toggle')).toBeNull();
    expect(el('.btn-delete')).toBeNull();
  });

  it('registry buttons are shown for a hub admin', () => {
    setup(me({ hub_admin: true, project_connectors_enabled: false }), connector({ owner: 'global' }));
    expect(el('.btn-refresh')).not.toBeNull();
    expect(el('.btn-toggle')).not.toBeNull();
    expect(el('.btn-delete')).not.toBeNull();
  });

  it('a project-scoped manager cannot edit a global connector', () => {
    setup(me({ hub_admin: false }), connector({ owner: 'global' }));
    expect(component.canEdit).toBe(false);
    expect(el('.btn-delete')).toBeNull();
  });

  it('a project manager can edit a connector owned by the project', () => {
    setup(me());
    expect(component.canEdit).toBe(true);
  });

  describe('refresh', () => {
    it('calls hub refresh, emits onChanged and notifies success when valid', () => {
      setup(me());
      hub.refresh.and.returnValue(of({ connector: connector(), valid: true, errors: [] }));
      component.refresh();
      expect(hub.refresh).toHaveBeenCalledWith('acme', 'project');
      expect(notify.showWidgetStyleUpdateNotification).toHaveBeenCalledWith('Integration.ConnectorRefreshed', 3, 'success');
      expect(changed).toHaveBeenCalled();
    });

    it('notifies a warning with the errors when valid is false, and emits onChanged', () => {
      setup(me());
      hub.refresh.and.returnValue(of({ connector: connector(), valid: false, errors: ['bad id', 'no actions'] }));
      component.refresh();
      const [msg, , kind] = notify.showWidgetStyleUpdateNotification.calls.mostRecent().args;
      expect(kind).toBe('warning');
      expect(msg).toContain('bad id');
      expect(msg).toContain('no actions');
      expect(changed).toHaveBeenCalled();
    });

    it('maps a hub failure to a translation key and does not emit', () => {
      setup(me());
      hub.refresh.and.returnValue(throwError({ status: 403, error: { code: 'manager_role_required', error: 'raw english' } }));
      component.refresh();
      expect(notify.showWidgetStyleUpdateNotification).toHaveBeenCalledWith('Integration.ConnectorErr_manager_role_required', 3, 'error');
      expect(changed).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  it('toggleEnabled calls setEnabled(id, false) for an active connector and emits onChanged', () => {
    setup(me());
    hub.setEnabled.and.returnValue(of(connector({ status: 'disabled' })));
    component.toggleEnabled();
    expect(hub.setEnabled).toHaveBeenCalledWith('acme', false, 'project');
    expect(changed).toHaveBeenCalled();
  });

  it('toggleEnabled enables a disabled connector without loading its manifest', () => {
    setup(me(), connector({ status: 'disabled' }));
    expect(hub.getManifest).not.toHaveBeenCalled();
    expect(component.manifest).toBeNull();
    hub.setEnabled.and.returnValue(of(connector()));
    component.toggleEnabled();
    expect(hub.setEnabled).toHaveBeenCalledWith('acme', true, 'project');
  });

  describe('deleteConnector', () => {
    it('confirms then calls removeConnector and emits onChanged', async () => {
      setup(me());
      spyOn(component, 'confirmDelete').and.returnValue(Promise.resolve(true));
      hub.removeConnector.and.returnValue(of(undefined));
      component.deleteConnector();
      await fixture.whenStable();
      expect(hub.removeConnector).toHaveBeenCalledWith('acme', 'project');
      expect(notify.showWidgetStyleUpdateNotification).toHaveBeenCalledWith('Integration.ConnectorDeleted', 3, 'success');
      expect(changed).toHaveBeenCalled();
    });

    it('does nothing when the confirmation is dismissed', async () => {
      setup(me());
      spyOn(component, 'confirmDelete').and.returnValue(Promise.resolve(false));
      component.deleteConnector();
      await fixture.whenStable();
      expect(hub.removeConnector).not.toHaveBeenCalled();
      expect(changed).not.toHaveBeenCalled();
    });

    it('409 connector_in_use notifies the translated message and does not emit onChanged', async () => {
      setup(me());
      spyOn(component, 'confirmDelete').and.returnValue(Promise.resolve(true));
      hub.removeConnector.and.returnValue(throwError({ status: 409, error: { code: 'connector_in_use', error: 'raw english' } }));
      component.deleteConnector();
      await fixture.whenStable();
      expect(notify.showWidgetStyleUpdateNotification).toHaveBeenCalledWith('Integration.ConnectorErr_connector_in_use', 3, 'error');
      expect(changed).not.toHaveBeenCalled();
    });
  });

  describe('hardening', () => {
    it('escapes the manifest-controlled name before it reaches the Swal html', () => {
      setup(me(), connector({ name: '<img src=x onerror=alert(1)>' }));
      const Swal = require('sweetalert2');
      const fire = spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isDenied: false }));
      spyOn(TestBed.inject(TranslateService), 'instant').and.callFake(((k: string, p: any) => p ? `<b>${p.serverName}</b>` : k) as any);
      component.confirmDelete();
      const html: string = fire.calls.mostRecent().args[0].html;
      expect(html).not.toContain('<img');
      expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    });

    it('caps the valid:false warning to the first 5 errors', () => {
      setup(me());
      hub.refresh.and.returnValue(of({ connector: connector(), valid: false, errors: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7'] }));
      component.refresh();
      const msg: string = notify.showWidgetStyleUpdateNotification.calls.mostRecent().args[0];
      expect(msg).toContain('e5');
      expect(msg).not.toContain('e6');
      expect(msg).toContain('…');
    });

    it('ignores an older manifest response that arrives last', () => {
      setup(me());
      const first = new Subject<any>();
      const second = new Subject<any>();
      hub.getManifest.and.returnValues(first, second);
      component.ngOnChanges({ connector: {} as any });
      component.ngOnChanges({ connector: {} as any });
      second.next({ actions: [{ id: 'new', name: 'New' }] });
      first.next({ actions: [{ id: 'old', name: 'Old' }, { id: 'old2', name: 'Old2' }] });
      expect(component.actions.length).toBe(1);
      expect(component.actions[0].id).toBe('new');
    });

    it('getManifest failure notifies the translated key', () => {
      setup(me());
      hub.getManifest.and.returnValue(throwError({ status: 404, error: { code: 'unknown_connector', error: 'raw english' } }));
      component.ngOnChanges({ connector: {} as any });
      expect(notify.showWidgetStyleUpdateNotification).toHaveBeenCalledWith('Integration.ConnectorErr_unknown_connector', 3, 'error');
      expect(logger.error).toHaveBeenCalled();
    });

    it('resets the tab to details when another connector is selected', () => {
      setup(me());
      component.setTab('connections');
      const other = connector({ id: 'other' });
      component.connector = other;
      component.ngOnChanges({ connector: { previousValue: connector(), currentValue: other } as any });
      expect(component.activeTab).toBe('details');
    });
  });

  describe('tabs', () => {
    it('switching tab to connections renders <connector-connections>', () => {
      setup(me());
      expect(el('connector-connections')).toBeNull();
      el('.tab-connections').click();
      fixture.detectChanges();
      expect(component.activeTab).toBe('connections');
      expect(el('connector-connections')).not.toBeNull();
    });

    it('with ?tab=connections in the url, selecting another connector still opens on details', () => {
      setup(me(), connector(), { tab: 'connections' });
      expect(component.activeTab).toBe('connections');
      const other = connector({ id: 'other' });
      component.connector = other;
      component.ngOnChanges({ connector: { previousValue: connector(), currentValue: other } as any });
      fixture.detectChanges();
      expect(component.activeTab).toBe('details');
      expect(el('connector-connections')).toBeNull();
    });

    it('opens on the connections tab when the url carries ?tab=connections', () => {
      setup(me(), connector(), { tab: 'connections' });
      expect(component.activeTab).toBe('connections');
      expect(el('connector-connections')).not.toBeNull();
    });
  });
});
