import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { IntegrationsComponent } from './integrations.component';
import { AuthService } from 'app/core/auth.service';
import { IntegrationService } from 'app/services/integration.service';
import { UsersService } from 'app/services/users.service';
import { NotifyService } from 'app/core/notify.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { BrandService } from 'app/services/brand.service';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { AppStoreService } from 'app/services/app-store.service';
import { AppConfigService } from 'app/services/app-config.service';
import { RoleService } from 'app/services/role.service';
import { RolesService } from 'app/services/roles.service';
import { ConnectorHubService, HubConnector, HubMe } from 'app/services/connector-hub.service';
import { INTEGRATION_LIST_ARRAY, INTEGRATIONS_CATEGORIES, INTEGRATIONS_KEYS } from './utils';

describe('IntegrationsComponent (connector hub shell)', () => {
  let component: IntegrationsComponent;
  let fixture: ComponentFixture<IntegrationsComponent>;
  let hub: jasmine.SpyObj<ConnectorHubService>;
  let router: Router;

  const connector = (o: Partial<HubConnector>): HubConnector =>
    ({ id: 'google-services', name: 'Google', version: '1.0.0', description: '', icon: 'https://x/g.svg', owner: 'global', status: 'active', ...o });
  const me = (o: Partial<HubMe>): HubMe =>
    ({ role: 'owner', manager: true, hub_admin: false, project_connectors_enabled: false, ...o });
  const connectorTiles = () => component.INTEGRATIONS.filter((i) => i.category === INTEGRATIONS_CATEGORIES.CONNECTOR);

  beforeEach(async () => {
    hub = jasmine.createSpyObj<ConnectorHubService>('ConnectorHubService', ['isConfigured', 'getMe', 'listConnectors']);
    hub.isConfigured.and.returnValue(true);

    await TestBed.configureTestingModule({
      declarations: [IntegrationsComponent],
      imports: [RouterTestingModule, TranslateModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: AuthService, useValue: { user_bs: new BehaviorSubject(null), project_bs: new BehaviorSubject(null), isChromeVerGreaterThan100: of(true), settingSidebarIsOpned: of(true) } },
        { provide: IntegrationService, useValue: { getAllIntegrations: () => of([]) } },
        { provide: UsersService, useValue: { project_user_role_bs: new BehaviorSubject(null) } },
        { provide: NotifyService, useValue: {} },
        { provide: LoggerService, useValue: jasmine.createSpyObj('LoggerService', ['log', 'debug', 'error', 'warn']) },
        { provide: BrandService, useValue: { getBrand: () => ({}) } },
        { provide: ProjectPlanService, useValue: { projectPlan$: new BehaviorSubject(null) } },
        { provide: AppStoreService, useValue: {} },
        { provide: AppConfigService, useValue: { getConfig: () => ({ t2y12PruGU9wUtEGzBJfolMIgK: '' }) } },
        { provide: RoleService, useValue: {} },
        { provide: RolesService, useValue: {} },
        { provide: ConnectorHubService, useValue: hub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IntegrationsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    component.projectID = 'p1';
    component.INTEGRATIONS = [...INTEGRATION_LIST_ARRAY];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loadConnectorTiles adds one tile per hub connector and the Add tile for a hub admin', () => {
    const before = component.INTEGRATIONS.length;
    hub.getMe.and.returnValue(of(me({ hub_admin: true })));
    hub.listConnectors.and.returnValue(of([connector({ id: 'a' }), connector({ id: 'b' })]));

    component.loadConnectorTiles();

    expect(connectorTiles().map((t) => t.key)).toEqual(['connector_item:a', 'connector_item:b', INTEGRATIONS_KEYS.CONNECTORS]);
    expect(component.INTEGRATIONS.length).toBe(before + 3);
    expect(component.connectorMe.hub_admin).toBe(true);
    expect(connectorTiles().every((t) => t.plan === 'Sandbox')).toBe(true);
  });

  it('loadConnectorTiles shows no Add tile for a plain member', () => {
    hub.getMe.and.returnValue(of(me({ manager: false })));
    hub.listConnectors.and.returnValue(of([connector({ id: 'a' })]));
    component.loadConnectorTiles();
    expect(connectorTiles().map((t) => t.key)).toEqual(['connector_item:a']);
  });

  it('loadConnectorTiles leaves INTEGRATIONS untouched when the hub is not configured', () => {
    hub.isConfigured.and.returnValue(false);
    const before = component.INTEGRATIONS;
    component.loadConnectorTiles();
    expect(hub.getMe).not.toHaveBeenCalled();
    expect(component.INTEGRATIONS).toBe(before);
  });

  it('loadConnectorTiles swallows a hub error', () => {
    const before = component.INTEGRATIONS.length;
    hub.getMe.and.returnValue(throwError(new Error('boom')));
    expect(() => component.loadConnectorTiles()).not.toThrow();
    expect(component.INTEGRATIONS.length).toBe(before);
    expect(component.connectorMe).toBeNull();
  });

  it('does not mutate the shared INTEGRATION_LIST_ARRAY and replaces old connector tiles on reload', () => {
    const shared = INTEGRATION_LIST_ARRAY.length;
    hub.getMe.and.returnValue(of(me({ hub_admin: true })));
    hub.listConnectors.and.returnValue(of([connector({ id: 'a' })]));
    component.loadConnectorTiles();
    hub.listConnectors.and.returnValue(of([connector({ id: 'b' })]));
    component.onConnectorRegistryChanged();
    expect(INTEGRATION_LIST_ARRAY.length).toBe(shared);
    expect(connectorTiles().map((t) => t.key)).toEqual(['connector_item:b', INTEGRATIONS_KEYS.CONNECTORS]);
  });

  it('selecting a connector_item tile sets selectedConnector and not selectedIntegration', async () => {
    hub.getMe.and.returnValue(of(me({ hub_admin: true })));
    hub.listConnectors.and.returnValue(of([connector({ id: 'a' })]));
    component.loadConnectorTiles();
    const tile = component.INTEGRATIONS.find((i) => i.key === 'connector_item:a');

    await component.onIntegrationSelect(tile);
    await fixture.whenStable();

    expect(component.selectedConnector.id).toBe('a');
    expect(component.selectedIntegration).toBeFalsy();
    expect(component.isConnectorItemSelected()).toBe(true);
  });

  it('selecting the connectors tile selects no integration record', async () => {
    hub.getMe.and.returnValue(of(me({ hub_admin: true })));
    hub.listConnectors.and.returnValue(of([]));
    component.loadConnectorTiles();
    const tile = component.INTEGRATIONS.find((i) => i.key === INTEGRATIONS_KEYS.CONNECTORS);
    await component.onIntegrationSelect(tile);
    await fixture.whenStable();
    expect(component.integrationSelectedName).toBe(INTEGRATIONS_KEYS.CONNECTORS);
    expect(component.selectedIntegration).toBeFalsy();
    expect(component.selectedConnector).toBeNull();
  });

  describe('deep link (C1)', () => {
    it('resolves ?name=connector_item:<id> after the tiles load and keeps tab/connection_id/status', async () => {
      component.intName = 'connector_item:a';
      spyOnProperty(component as any, 'currentUrlName', 'get').and.returnValue('connector_item:a');
      hub.getMe.and.returnValue(of(me({ hub_admin: true })));
      hub.listConnectors.and.returnValue(of([connector({ id: 'a' })]));

      component.loadConnectorTiles();
      await fixture.whenStable();

      expect(component.integrationSelectedName).toBe('connector_item:a');
      expect(component.selectedConnector.id).toBe('a');
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('a deep link to a connector that is not loaded selects nothing', async () => {
      component.intName = 'connector_item:missing';
      hub.getMe.and.returnValue(of(me({ hub_admin: true })));
      hub.listConnectors.and.returnValue(of([connector({ id: 'a' })]));
      component.loadConnectorTiles();
      await fixture.whenStable();
      expect(component.integrationSelectedName).toBe('none');
      expect(component.selectedConnector).toBeNull();
    });

    it('changeRoute navigates on a different key and not when the key is already the URL name', () => {
      const spy = spyOnProperty(component as any, 'currentUrlName', 'get');
      spy.and.returnValue('connector_item:a');
      component.changeRoute('connector_item:a');
      expect(router.navigate).not.toHaveBeenCalled();
      component.changeRoute('connector_item:b');
      expect(router.navigate).toHaveBeenCalledWith(['project/p1/integrations/'], { queryParams: { name: 'connector_item:b' } });
    });
  });

  describe('selection after reload (C8)', () => {
    beforeEach(async () => {
      hub.getMe.and.returnValue(of(me({ hub_admin: true })));
      hub.listConnectors.and.returnValue(of([connector({ id: 'a', status: 'active' })]));
      component.loadConnectorTiles();
      await component.onIntegrationSelect(component.INTEGRATIONS.find((i) => i.key === 'connector_item:a'));
      await fixture.whenStable();
    });

    it('re-resolves selectedConnector from the refreshed list', () => {
      hub.listConnectors.and.returnValue(of([connector({ id: 'a', status: 'disabled' })]));
      component.onConnectorRegistryChanged();
      expect(component.selectedConnector.status).toBe('disabled');
      expect(component.integrationSelectedName).toBe('connector_item:a');
    });

    it('clears the selection when the connector is gone', () => {
      hub.listConnectors.and.returnValue(of([]));
      component.onConnectorRegistryChanged();
      expect(component.selectedConnector).toBeNull();
      expect(component.integrationSelectedName).toBe('none');
    });
  });

  it('shows the Connectors category only when there is a connector tile (C7)', () => {
    expect(component.categoryHasTiles(INTEGRATIONS_CATEGORIES.CONNECTOR)).toBe(false);
    expect(component.categoryHasTiles(INTEGRATIONS_CATEGORIES.AI)).toBe(true);
    hub.getMe.and.returnValue(of(me({ hub_admin: true })));
    hub.listConnectors.and.returnValue(of([]));
    component.loadConnectorTiles();
    expect(component.categoryHasTiles(INTEGRATIONS_CATEGORIES.CONNECTOR)).toBe(true);
  });
});
