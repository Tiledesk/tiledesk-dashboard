import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, of, throwError } from 'rxjs';
import { NotifyService } from 'app/core/notify.service';
import { ConnectorHubService, HubMe } from 'app/services/connector-hub.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { ConnectorIntegrationComponent } from './connector-integration.component';

describe('ConnectorIntegrationComponent', () => {
  let fixture: ComponentFixture<ConnectorIntegrationComponent>;
  let component: ConnectorIntegrationComponent;
  let hub: jasmine.SpyObj<ConnectorHubService>;
  let notify: jasmine.SpyObj<NotifyService>;
  let logger: jasmine.SpyObj<LoggerService>;

  const me = (o: Partial<HubMe> = {}): HubMe =>
    ({ role: 'owner', manager: true, hub_admin: false, project_connectors_enabled: true, ...o });
  const manifest = {
    connector: { name: 'Acme', icon: 'i.svg' },
    actions: [{ id: 'a1', name: 'A1', group: 'g' }, { id: 'a2', name: 'A2' }],
    triggers: [{ id: 't1', name: 'T1' }],
    groups: [{ id: 'g', name: 'G' }]
  };
  const registered: any = { id: 'acme', name: 'Acme' };

  function setup(meValue: HubMe) {
    hub = jasmine.createSpyObj('ConnectorHubService', ['validate', 'register']);
    notify = jasmine.createSpyObj('NotifyService', ['showWidgetStyleUpdateNotification']);
    logger = jasmine.createSpyObj('LoggerService', ['log', 'debug', 'error', 'warn']);
    TestBed.configureTestingModule({
      imports: [FormsModule, TranslateModule.forRoot()],
      declarations: [ConnectorIntegrationComponent],
      providers: [
        { provide: ConnectorHubService, useValue: hub },
        { provide: NotifyService, useValue: notify },
        { provide: LoggerService, useValue: logger }
      ]
    });
    fixture = TestBed.createComponent(ConnectorIntegrationComponent);
    component = fixture.componentInstance;
    component.me = meValue;
    fixture.detectChanges();
  }

  function registerBtn(): HTMLButtonElement {
    const btns = fixture.nativeElement.querySelectorAll('.form-actions button');
    return btns[1];
  }

  describe('as project manager', () => {
    beforeEach(() => setup(me()));

    it('previewManifest calls validate with the url and shows counts from manifest.actions/triggers', () => {
      hub.validate.and.returnValue(of({ valid: true, errors: [], manifest }));
      component.baseUrl = 'http://c.test';
      component.previewManifest();
      expect(hub.validate).toHaveBeenCalledWith('http://c.test', null, 'project');
      expect(component.preview).toEqual(jasmine.objectContaining({ name: 'Acme', icon: 'i.svg', actionCount: 2, triggerCount: 1 }));
      expect(component.preview.groups.length).toBe(1);
      expect(component.errors).toEqual([]);
    });

    it('previewManifest with valid:false lists errors and does not enable register', () => {
      hub.validate.and.returnValue(of({ valid: false, errors: ['bad id', 'no actions'] }));
      component.baseUrl = 'http://c.test';
      component.previewManifest();
      fixture.detectChanges();
      expect(component.preview).toBeNull();
      expect(component.errors).toEqual(['bad id', 'no actions']);
      expect(fixture.nativeElement.querySelectorAll('.manifest-errors li').length).toBe(2);
      expect(registerBtn().disabled).toBe(true);
    });

    it('a response that arrives after the url changed is discarded', () => {
      const subj = new Subject<any>();
      hub.validate.and.returnValue(subj);
      component.baseUrl = 'http://a.test';
      component.previewManifest();
      component.baseUrl = 'http://b.test';
      component.onUrlChange();
      subj.next({ valid: true, errors: [], manifest });
      expect(component.preview).toBeNull();
      expect(component.isLoadingManifest).toBe(false);
    });

    it('register is disabled until a valid preview exists and calls register with the previewed url', () => {
      expect(registerBtn().disabled).toBe(true);
      hub.validate.and.returnValue(of({ valid: true, errors: [], manifest }));
      hub.register.and.returnValue(of({ connector: registered, event_secret: 's' }));
      const changed = jasmine.createSpy('changed');
      component.onChanged.subscribe(changed);
      component.baseUrl = 'http://c.test';
      component.previewManifest();
      fixture.detectChanges();
      expect(registerBtn().disabled).toBe(false);

      component.baseUrl = 'http://edited.test';
      component.register();
      expect(hub.register).toHaveBeenCalledWith('http://c.test', null, 'project');
      expect(changed).toHaveBeenCalledWith(registered);
      expect(notify.showWidgetStyleUpdateNotification).toHaveBeenCalledWith('Integration.ConnectorRegistered', 3, 'success');
      expect(component.baseUrl).toBe('');
      expect(component.preview).toBeNull();
    });

    it('register 409 connector_exists keeps the form and notifies the translated message', () => {
      hub.validate.and.returnValue(of({ valid: true, errors: [], manifest }));
      hub.register.and.returnValue(throwError({ status: 409, error: { success: false, error: 'raw english', code: 'connector_exists' } }));
      component.baseUrl = 'http://c.test';
      component.previewManifest();
      component.register();
      expect(notify.showWidgetStyleUpdateNotification).toHaveBeenCalledWith('Integration.ConnectorErr_connector_exists', 3, 'error');
      expect(component.baseUrl).toBe('http://c.test');
      expect(component.preview).not.toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });

    it('register 422 invalid_manifest shows details[]', () => {
      hub.validate.and.returnValue(of({ valid: true, errors: [], manifest }));
      hub.register.and.returnValue(throwError({ status: 422, error: { code: 'invalid_manifest', errors: ['x is required'] } }));
      component.baseUrl = 'http://c.test';
      component.previewManifest();
      component.register();
      expect(component.errors).toEqual(['x is required']);
      expect(notify.showWidgetStyleUpdateNotification).toHaveBeenCalledWith('Integration.ConnectorErr_invalid_manifest', 3, 'error');
    });

    it('internal url input is not rendered for non-admins and internal_url is never sent', () => {
      expect(fixture.nativeElement.querySelector('#connector-internal-url')).toBeNull();
      hub.validate.and.returnValue(of({ valid: true, errors: [], manifest }));
      component.baseUrl = 'http://c.test';
      component.internalUrl = 'http://internal';
      component.previewManifest();
      expect(hub.validate).toHaveBeenCalledWith('http://c.test', null, 'project');
    });

    it('scope is project for a project manager when enabled', () => {
      expect(component.scope).toBe('project');
    });

    it('shows the not-available message when the role has no registry scope', () => {
      component.me = me({ manager: false });
      fixture.detectChanges();
      expect(component.scope).toBeNull();
      expect(fixture.nativeElement.querySelector('#connector-url')).toBeNull();
    });
  });

  describe('as hub admin', () => {
    beforeEach(() => setup(me({ hub_admin: true, project_connectors_enabled: false })));

    it('internal url input is rendered only for hub admins; scope is global', () => {
      expect(component.scope).toBe('global');
      expect(fixture.nativeElement.querySelector('#connector-internal-url')).not.toBeNull();
    });

    it('internal_url null is sent when blank, the value when set', () => {
      hub.validate.and.returnValue(of({ valid: true, errors: [], manifest }));
      component.baseUrl = 'http://c.test';
      component.internalUrl = '  ';
      component.previewManifest();
      expect(hub.validate).toHaveBeenCalledWith('http://c.test', null, 'global');
      component.internalUrl = 'http://internal';
      component.previewManifest();
      expect(hub.validate).toHaveBeenCalledWith('http://c.test', 'http://internal', 'global');
    });
  });
});
