import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { NotifyService } from 'app/core/notify.service';
import { IntegrationService } from 'app/services/integration.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { McpOAuthService } from 'app/services/mcp-oauth.service';
import { McpIntegrationComponent } from './mcp-integration.component';

describe('McpIntegrationComponent OAuth', () => {
  let component: McpIntegrationComponent;
  let integrationService: { getMcpTools: jasmine.Spy };
  let mcpOAuth: {
    openPopup: jasmine.Spy;
    connect: jasmine.Spy;
    cancel: jasmine.Spy;
    deleteConnection: jasmine.Spy;
  };
  let notify: { showWidgetStyleUpdateNotification: jasmine.Spy };

  const serverUrl = 'https://mcp.example/sse';

  beforeEach(async () => {
    integrationService = {
      getMcpTools: jasmine.createSpy('getMcpTools').and.returnValue(of({ tools: [{ name: 'echo', description: 'Echo' }] }))
    };
    mcpOAuth = {
      openPopup: jasmine.createSpy('openPopup').and.returnValue({ closed: false, location: { href: '' }, close() { this.closed = true; } }),
      connect: jasmine.createSpy('connect').and.returnValue(Promise.resolve({
        ok: true,
        connection: { _id: 'C1', mode: 'mcp', server_url: serverUrl, status: 'active', updatedAt: 'T1' }
      })),
      cancel: jasmine.createSpy('cancel'),
      deleteConnection: jasmine.createSpy('deleteConnection').and.returnValue(of({ success: true, revoked: true }))
    };
    notify = { showWidgetStyleUpdateNotification: jasmine.createSpy('notify') };

    await TestBed.configureTestingModule({
      declarations: [McpIntegrationComponent],
      imports: [FormsModule, TranslateModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: IntegrationService, useValue: integrationService },
        { provide: McpOAuthService, useValue: mcpOAuth },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(null) }) } },
        { provide: NotifyService, useValue: notify },
        { provide: LoggerService, useValue: { log: () => {}, debug: () => {}, error: () => {}, warn: () => {}, info: () => {} } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(McpIntegrationComponent);
    component = fixture.componentInstance;
    component.integration = { value: { servers: [] } };
    fixture.detectChanges();
  });

  function fillServer(name = 'Demo') {
    component.currentServer.name = name;
    component.currentServer.url = serverUrl;
    component.currentServer.transport = 'streamable_http';
  }

  it('connects with None by calling getMcpTools with the url only', () => {
    fillServer();
    component.authType = 'none';

    component.connectToServer();

    expect(mcpOAuth.connect).not.toHaveBeenCalled();
    expect(integrationService.getMcpTools).toHaveBeenCalledWith(serverUrl);
  });

  it('opens the popup and loads tools with the new connection when OAuth succeeds', fakeAsync(() => {
    fillServer();
    component.authType = 'mcp';

    component.connectToServer();

    expect(mcpOAuth.openPopup).toHaveBeenCalledBefore(mcpOAuth.connect);
    expect(mcpOAuth.connect).toHaveBeenCalledWith(
      { mode: 'mcp', server_url: serverUrl, name: 'Demo' },
      jasmine.anything()
    );

    tick();

    expect(component.currentServer.oauth).toEqual({ connection_id: 'C1', mode: 'mcp' });
    expect(integrationService.getMcpTools).toHaveBeenCalledWith(serverUrl, { connection_id: 'C1', mode: 'mcp' });
  }));

  it('shows an error and does not load tools when the popup is blocked', fakeAsync(() => {
    fillServer();
    component.authType = 'mcp';
    mcpOAuth.connect.and.returnValue(Promise.resolve({ ok: false, reason: 'popup_blocked' }));

    component.connectToServer();
    tick();

    expect(integrationService.getMcpTools).not.toHaveBeenCalled();
    expect(notify.showWidgetStyleUpdateNotification).toHaveBeenCalled();
    const args = notify.showWidgetStyleUpdateNotification.calls.mostRecent().args;
    expect(args[2]).toBe('error');
    expect(args[0]).toContain('AllowPopups');
  }));

  it('saves the connection reference when OAuth is selected', () => {
    fillServer();
    component.authType = 'mcp';
    component.currentServer.oauth = { connection_id: 'C1', mode: 'mcp' };
    component.currentServer.tools = [{ name: 'echo' }];

    component.addOrUpdateServer();

    expect(component.integration.value.servers[0].oauth).toEqual({ connection_id: 'C1', mode: 'mcp' });
  });

  it('saves oauth null when authentication is None', () => {
    fillServer();
    component.authType = 'none';
    component.currentServer.oauth = { connection_id: 'C1', mode: 'mcp' };

    component.addOrUpdateServer();

    expect(component.integration.value.servers[0].oauth).toBeNull();
  });

  it('clears the connection and disables Update when the URL of an OAuth server changes', () => {
    const server = {
      name: 'Demo',
      url: serverUrl,
      transport: 'streamable_http',
      oauth: { connection_id: 'C1', mode: 'mcp' as const }
    };
    component.integration.value.servers = [server];

    component.onSelectServer(server);
    component.currentServer.url = 'https://mcp.example/other';
    component.onServerUrlChange();

    expect(component.currentServer.oauth).toBeNull();
    expect(component.isUpdateDisabled()).toBe(true);
  });

  it('revokes the connection when an OAuth server is switched to None', () => {
    const server = {
      name: 'Demo',
      url: serverUrl,
      transport: 'streamable_http',
      oauth: { connection_id: 'C1', mode: 'mcp' as const }
    };
    component.integration.value.servers = [server];
    component.onSelectServer(server);
    component.authType = 'none';

    component.addOrUpdateServer();

    expect(mcpOAuth.deleteConnection).toHaveBeenCalledWith('C1');
  });

  it('does not revoke a connection that another server still uses', () => {
    const shared = { connection_id: 'C1', mode: 'mcp' as const };
    component.integration.value.servers = [
      { name: 'Demo', url: serverUrl, transport: 'streamable_http', oauth: { ...shared } },
      { name: 'Other', url: 'https://mcp.example/other', transport: 'streamable_http', oauth: { ...shared } }
    ];
    component.onSelectServer(component.integration.value.servers[0]);
    component.authType = 'none';

    component.addOrUpdateServer();

    expect(mcpOAuth.deleteConnection).not.toHaveBeenCalled();
  });
});
