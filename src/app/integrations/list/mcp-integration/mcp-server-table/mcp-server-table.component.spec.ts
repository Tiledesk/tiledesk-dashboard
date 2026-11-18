import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LoggerService } from 'app/services/logger/logger.service';
import { McpOAuthConnection } from 'app/services/mcp-oauth.service';
import { McpServer, McpServerTableComponent } from './mcp-server-table.component';

describe('McpServerTableComponent OAuth status', () => {
  let component: McpServerTableComponent;
  let fixture: ComponentFixture<McpServerTableComponent>;

  const connection = (id: string, status: McpOAuthConnection['status']): McpOAuthConnection => ({
    _id: id,
    mode: 'mcp',
    server_url: 'https://mcp.example/' + id,
    status,
    updatedAt: '2026-11-11T10:00:00.000Z'
  });

  const server = (name: string, connectionId?: string, mode: 'mcp' | 'google' | 'manual' = 'mcp'): McpServer => ({
    name,
    url: 'https://mcp.example/' + name,
    transport: 'streamable_http',
    oauth: connectionId ? { connection_id: connectionId, mode } : undefined
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [McpServerTableComponent],
      imports: [FormsModule, TranslateModule.forRoot()],
      providers: [
        { provide: LoggerService, useValue: { log: () => {}, debug: () => {}, error: () => {}, warn: () => {} } }
      ]
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      Name: 'Name',
      Type: 'Type',
      Delete: 'Delete',
      Integration: {
        Authentication: 'Authentication',
        Tools: 'Tools',
        TotalMCPServers: 'Total',
        SearchByNameURLOrType: 'Search',
        NoMCPServersFound: 'None',
        Connected: 'Connected',
        Reconnect: 'Reconnect',
        NotConnected: 'Not connected',
        Pending: 'Pending',
        AuthOAuth: 'OAuth',
        AuthGoogle: 'Google',
        AuthManual: 'OAuth (manual)'
      }
    });
    translate.use('en');

    fixture = TestBed.createComponent(McpServerTableComponent);
    component = fixture.componentInstance;
  });

  it('renders a chip for each connection status and leaves servers without OAuth empty', () => {
    component.mcpServers = [
      server('Plain'),
      server('Active', 'active'),
      server('Pending', 'pending'),
      server('Reauth', 'reauth'),
      server('Revoked', 'revoked'),
      server('Missing', 'missing', 'google')
    ];
    component.oauthConnections = {
      active: connection('active', 'active'),
      pending: connection('pending', 'pending'),
      reauth: connection('reauth', 'needs_reauth'),
      revoked: connection('revoked', 'revoked')
    };

    fixture.detectChanges();

    const row = (name: string) => Array.from(fixture.nativeElement.querySelectorAll('tbody tr'))
      .find((item: HTMLElement) => item.textContent.indexOf(name) !== -1) as HTMLElement;

    expect(row('Plain').querySelector('.auth-chip')).toBeNull();
    expect(row('Active').querySelector('.auth-status').textContent).toContain('Connected');
    expect(row('Active').querySelector('.auth-chip').classList.contains('connected')).toBe(true);
    expect(row('Pending').querySelector('.auth-status').textContent).toContain('Pending');
    expect(row('Reauth').querySelector('.auth-status').textContent).toContain('Reconnect');
    expect(row('Revoked').querySelector('.auth-status').textContent).toContain('Reconnect');
    expect(row('Missing').querySelector('.auth-status').textContent).toContain('Not connected');
    expect(row('Missing').querySelector('.auth-mode').textContent).toContain('Google');
  });

  it('emits onReconnectServer when Reconnect is clicked', () => {
    const reauth = server('Reauth', 'reauth');
    component.mcpServers = [reauth];
    component.oauthConnections = { reauth: connection('reauth', 'needs_reauth') };
    spyOn(component.onReconnectServer, 'emit');

    fixture.detectChanges();
    fixture.nativeElement.querySelector('.auth-chip.reconnect').click();

    expect(component.onReconnectServer.emit).toHaveBeenCalledWith(reauth);
  });
});
