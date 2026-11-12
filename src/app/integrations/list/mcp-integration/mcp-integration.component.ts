import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { IntegrationService } from 'app/services/integration.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { McpServer, McpTool } from './mcp-server-table/mcp-server-table.component';
import { MatDialog } from '@angular/material/dialog';
import { NotifyService } from 'app/core/notify.service';
import { McpToolsModalComponent } from './mcp-tools-modal/mcp-tools-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { McpOAuthAuthorizeBody, McpOAuthConnection, McpOAuthMode, McpOAuthReference, McpOAuthResult, McpOAuthService } from 'app/services/mcp-oauth.service';

const Swal = require('sweetalert2');

type McpAuthType = 'none' | McpOAuthMode;

@Component({
  selector: 'mcp-integration',
  templateUrl: './mcp-integration.component.html',
  styleUrls: ['./mcp-integration.component.scss']
})
export class McpIntegrationComponent implements OnInit, OnDestroy {

  @Input() integration: any;
  @Output() onUpdateIntegration = new EventEmitter;
  @Output() onDeleteIntegration = new EventEmitter;

  translateparams: any;
  
  // Form fields
  currentServer: McpServer = {
    name: '',
    url: '',
    transport: 'streamable_http'
  };
  
  isEditing: boolean = false;
  editingIndex: number = -1;

  authType: McpAuthType = 'none';
  scopesText: string = '';
  manualAuthorizationUrl: string = '';
  manualTokenUrl: string = '';
  manualClientId: string = '';
  manualClientSecret: string = '';
  manualRevocationUrl: string = '';
  /** URL the current OAuth connection was granted for. A different URL invalidates it. */
  authorizedUrl: string = '';
  urlChanged: boolean = false;
  waitingForAuthorization: boolean = false;
  oauthConnections: { [id: string]: McpOAuthConnection } = {};
  reconnectRequired: { [id: string]: boolean } = {};
  oauthStatusUnavailable = false;

  private originalOAuth: McpOAuthReference | null = null;
  private stashedOAuth: McpOAuthReference | null = null;
  private oauthPopup: Window | null = null;

  // Connect/Tools state
  isLoadingTools: boolean = false;
  toolsRetrieved: boolean = false;
  currentTools: McpTool[] = [];
  loadingServerUrl: string = '';

  constructor(
    private integrationService: IntegrationService,
    private logger: LoggerService,
    private dialog: MatDialog,
    private notify: NotifyService,
    private translate: TranslateService,
    private mcpOAuthService: McpOAuthService
  ) { }

  ngOnInit(): void {
    this.logger.log("[INT-MCP] integration ", this.integration)
    this.translateparams = { intname: 'MCP' };
    
    // Initialize servers array if not set
    if (!this.integration.value.servers) {
      this.integration.value.servers = [];
    }
    this.loadOAuthConnections();
  }

  ngOnDestroy(): void {
    this.mcpOAuthService.cancel();
  }

  addOrUpdateServer(): void {
    this.logger.log('[INT-MCP] addOrUpdateServer', this.currentServer, 'isEditing:', this.isEditing);
    
    // Validation
    if (!this.currentServer.name || !this.currentServer.url || !this.currentServer.transport) {
      this.logger.error('[INT-MCP] Missing required fields');
      return;
    }

    const previousConnectionId = this.isEditing && this.authType === 'none'
      ? this.originalOAuth && this.originalOAuth.connection_id
      : null;

    // None must send oauth: null so the server merge drops the stored reference.
    if (this.authType === 'none') {
      this.currentServer.oauth = null;
    }

    // Preserve tools if they were retrieved
    const toolsToPreserve = this.currentServer.tools || [];

    if (this.isEditing && this.editingIndex >= 0) {
      // Update existing server - preserve existing tools if no new ones were retrieved
      const existingServer = this.integration.value.servers[this.editingIndex];
      const serverToSave: McpServer = { 
        ...this.currentServer,
        oauth: this.authType === 'none' ? null : this.currentServer.oauth,
        tools: toolsToPreserve.length > 0 ? toolsToPreserve : existingServer.tools
      };
      this.integration.value.servers[this.editingIndex] = serverToSave;
      this.logger.log('[INT-MCP] Updated server at index', this.editingIndex);
    } else {
      // Add new server with tools if available
      const serverToAdd: McpServer = { 
        ...this.currentServer,
        oauth: this.authType === 'none' ? null : this.currentServer.oauth,
        tools: toolsToPreserve
      };
      this.integration.value.servers.push(serverToAdd);
      this.logger.log('[INT-MCP] Added new server');
    }

    this.revokeConnectionIfUnused(previousConnectionId);
    this.resetForm();
    this.saveIntegration();
  }

  onSelectServer(server: McpServer): void {
    this.logger.log('[INT-MCP] Server selected:', server);
    const index = this.integration.value.servers.findIndex(s => 
      s.name === server.name && s.url === server.url && s.transport === server.transport
    );
    
    if (index >= 0) {
      this.currentServer = {
        ...server,
        oauth: server.oauth ? { ...server.oauth } : server.oauth
      };
      this.isEditing = true;
      this.editingIndex = index;
      this.originalOAuth = server.oauth && server.oauth.connection_id ? { ...server.oauth } : null;
      this.authType = this.originalOAuth ? (this.originalOAuth.mode || 'mcp') : 'none';
      this.authorizedUrl = this.originalOAuth ? server.url : '';
      this.urlChanged = false;
      this.stashedOAuth = null;
      this.scopesText = this.scopesTextForServer(server);
      this.manualAuthorizationUrl = '';
      this.manualTokenUrl = '';
      this.manualClientId = '';
      this.manualClientSecret = '';
      this.manualRevocationUrl = '';
    }
  }

  /**
   * An OAuth connection is bound to the server URL. Changing it requires a new grant.
   */
  onServerUrlChange(): void {
    if (this.authType === 'none' || !this.authorizedUrl) {
      return;
    }
    if (this.currentServer.url !== this.authorizedUrl) {
      if (this.currentServer.oauth) {
        this.stashedOAuth = this.currentServer.oauth;
      }
      this.currentServer.oauth = null;
      this.urlChanged = true;
      this.toolsRetrieved = false;
      return;
    }
    if (this.stashedOAuth) {
      this.currentServer.oauth = this.stashedOAuth;
      this.stashedOAuth = null;
    }
    this.urlChanged = false;
  }

  keepsStoredClientSecret(): boolean {
    return this.isEditing && !!this.originalOAuth;
  }

  isUpdateDisabled(): boolean {
    if (!this.currentServer.name || !this.currentServer.url || this.isLoadingTools || this.waitingForAuthorization) {
      return true;
    }
    if (this.authType === 'none') {
      return false;
    }
    return this.urlChanged || !this.currentServer.oauth || !this.currentServer.oauth.connection_id;
  }

  onDeleteServer(server: McpServer): void {
    this.logger.log('[INT-MCP] Delete server requested:', server);
    
    // Show confirmation dialog before deleting
    Swal.fire({
      title: this.translate.instant('AreYouSure'),
      html: this.translate.instant('Integration.MCPServerWillBeDeleted', { serverName: server.name }),
      icon: "warning",
      showCloseButton: false,
      showCancelButton: true,
      showConfirmButton: false,
      showDenyButton: true,
      denyButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
      focusConfirm: false,
      reverseButtons: true,
    }).then((result) => {
      if (result.isDenied) {
        // User confirmed deletion
        this.logger.log('[INT-MCP] Delete confirmed for server:', server);
        const index = this.integration.value.servers.findIndex(s => 
          s.name === server.name && s.url === server.url && s.transport === server.transport
        );
        
        if (index >= 0) {
          this.integration.value.servers.splice(index, 1);
          
          // If we were editing this server, reset the form
          if (this.isEditing && this.editingIndex === index) {
            this.resetForm();
          }
          
          this.saveIntegration();
          this.revokeConnectionIfUnused(server.oauth && server.oauth.connection_id);
          
          // Show success notification
          Swal.fire({
            title: this.translate.instant('Done') + "!",
            text: this.translate.instant('Integration.MCPServerHasBeenDeleted'),
            icon: "success",
            showCloseButton: false,
            showCancelButton: false,
            confirmButtonText: this.translate.instant('Ok'),
          });
        }
      } else {
        this.logger.log('[INT-MCP] Delete cancelled');
      }
    });
  }

  resetForm(): void {
    this.currentServer = {
      name: '',
      url: '',
      transport: 'streamable_http'
    };
    this.isEditing = false;
    this.editingIndex = -1;
    this.toolsRetrieved = false;
    this.currentTools = [];
    this.authType = 'none';
    this.scopesText = '';
    this.manualAuthorizationUrl = '';
    this.manualTokenUrl = '';
    this.manualClientId = '';
    this.manualClientSecret = '';
    this.manualRevocationUrl = '';
    this.authorizedUrl = '';
    this.urlChanged = false;
    this.originalOAuth = null;
    this.stashedOAuth = null;
    this.waitingForAuthorization = false;
  }

  /**
   * Normalize tools array to ensure each tool has only name and description
   * @param tools Array of tools (may contain extra fields)
   * @returns Normalized array with only name and description
   */
  private normalizeTools(tools: any[]): McpTool[] {
    if (!Array.isArray(tools)) {
      return [];
    }

    return tools
      .filter(tool => tool && tool.name) // Filter out invalid tools (must have at least name)
      .map(tool => ({
        name: tool.name || '',
        description: tool.description || undefined
      }));
  }

  /**
   * Connect to MCP server and retrieve tools.
   * OAuth opens the provider popup synchronously in this click handler.
   */
  connectToServer(): void {
    if (!this.currentServer.url) {
      this.notify.showWidgetStyleUpdateNotification('Please enter a server URL', 3, 'error');
      return;
    }

    if (this.authType !== 'none') {
      this.beginOAuthConnect();
      return;
    }

    this.currentServer.oauth = null;
    this.loadToolsForCurrentServer();
  }

  cancelAuthorization(): void {
    if (this.oauthPopup) {
      this.oauthPopup.close();
      this.oauthPopup = null;
    }
    this.waitingForAuthorization = false;
    this.mcpOAuthService.cancel();
  }

  private beginOAuthConnect(): void {
    const popup = this.mcpOAuthService.openPopup();
    this.oauthPopup = popup;
    this.waitingForAuthorization = true;
    this.mcpOAuthService.connect(this.authorizeBody(), popup).then((result) => {
      this.waitingForAuthorization = false;
      this.oauthPopup = null;
      if (!result.ok) {
        this.notifyAuthorizationFailure(result);
        return;
      }
      this.currentServer.oauth = {
        connection_id: result.connection._id,
        mode: this.authType as McpOAuthMode
      };
      this.authorizedUrl = this.currentServer.url;
      this.urlChanged = false;
      this.stashedOAuth = null;
      if (result.connection && result.connection._id) {
        this.reconnectRequired[result.connection._id] = false;
        this.oauthConnections = {
          ...this.oauthConnections,
          [result.connection._id]: result.connection
        };
        if (result.connection.scopes && result.connection.scopes.length) {
          this.scopesText = result.connection.scopes.join(' ');
        }
      }
      this.loadOAuthConnections();
      this.loadToolsForCurrentServer();
    });
  }

  private loadToolsForCurrentServer(): void {
    this.isLoadingTools = true;
    this.loadingServerUrl = this.currentServer.url;
    this.toolsRetrieved = false;

    this.logger.log('[INT-MCP] Connecting to server:', this.currentServer.url);

    const oauth = this.currentServer.oauth && this.currentServer.oauth.connection_id
      ? this.currentServer.oauth
      : undefined;
    const toolsRequest = oauth
      ? this.integrationService.getMcpTools(this.currentServer.url, oauth)
      : this.integrationService.getMcpTools(this.currentServer.url);

    toolsRequest.subscribe(
      (response: any) => {
        this.logger.log('[INT-MCP] Tools retrieved:', response);
        
        // Handle response - could be array of tools or object with tools property
        let rawTools: any[] = [];
        if (Array.isArray(response)) {
          rawTools = response;
        } else if (response && Array.isArray(response.tools)) {
          rawTools = response.tools;
        } else if (response && response.data && Array.isArray(response.data)) {
          rawTools = response.data;
        }

        // Normalize tools to ensure only name and description are present
        const tools = this.normalizeTools(rawTools);

        if (tools && tools.length > 0) {
          this.currentTools = tools;
          this.toolsRetrieved = true;
          
          // Store normalized tools in current server
          this.currentServer.tools = tools;
          
          // Show tools modal
          this.openToolsModal(tools, this.currentServer.url);
          
          this.notify.showWidgetStyleUpdateNotification('Tools retrieved successfully', 2, 'done');
        } else {
          this.logger.warn('[INT-MCP] No tools found in response');
          this.notify.showWidgetStyleUpdateNotification('No tools found for this server', 3, 'warning');
        }
        
        this.isLoadingTools = false;
        this.loadingServerUrl = '';
      },
      (error) => {
        this.logger.error('[INT-MCP] Error retrieving tools:', error);
        this.isLoadingTools = false;
        this.loadingServerUrl = '';
        this.toolsRetrieved = false;
        
        const errorMessage = this.mcpToolsErrorMessage(error, this.currentServer, 'Failed to retrieve tools from server');
        if (errorMessage) {
          this.notify.showWidgetStyleUpdateNotification(errorMessage, 3, 'error');
        }
      }
    );
  }

  /**
   * Refresh tools for an existing server
   */
  refreshTools(server: McpServer): void {
    if (!server.url) {
      this.notify.showWidgetStyleUpdateNotification('Server URL is missing', 3, 'error');
      return;
    }

    this.isLoadingTools = true;
    this.loadingServerUrl = server.url;

    this.logger.log('[INT-MCP] Refreshing tools for server:', server.url);

    const toolsRequest = server.oauth && server.oauth.connection_id
      ? this.integrationService.getMcpTools(server.url, server.oauth)
      : this.integrationService.getMcpTools(server.url);

    toolsRequest.subscribe(
      (response: any) => {
        this.logger.log('[INT-MCP] Tools refreshed:', response);
        
        // Handle response
        let rawTools: any[] = [];
        if (Array.isArray(response)) {
          rawTools = response;
        } else if (response && Array.isArray(response.tools)) {
          rawTools = response.tools;
        } else if (response && response.data && Array.isArray(response.data)) {
          rawTools = response.data;
        }

        // Normalize tools to ensure only name and description are present
        const tools = this.normalizeTools(rawTools);

        // Find server index and update
        const index = this.integration.value.servers.findIndex(s => 
          s.name === server.name && s.url === server.url && s.transport === server.transport
        );

        if (index >= 0) {
          // Update normalized tools for this server
          this.integration.value.servers[index].tools = tools;
          
          // If this is the current server being edited, update it too
          if (this.isEditing && this.editingIndex === index) {
            this.currentServer.tools = tools;
          }
          
          // Save integration
          this.saveIntegration();
          
          // Show tools modal
          if (tools && tools.length > 0) {
            this.openToolsModal(tools, server.url);
            this.notify.showWidgetStyleUpdateNotification('Tools refreshed successfully', 2, 'done');
          } else {
            this.notify.showWidgetStyleUpdateNotification('No tools found for this server', 3, 'warning');
          }
        }
        
        this.isLoadingTools = false;
        this.loadingServerUrl = '';
      },
      (error) => {
        this.logger.error('[INT-MCP] Error refreshing tools:', error);
        this.isLoadingTools = false;
        this.loadingServerUrl = '';
        
        this.finishMcpToolsError(error, server, 'Failed to refresh tools');
      }
    );
  }

  /**
   * Open modal to display tools
   */
  openToolsModal(tools: McpTool[], serverUrl: string): void {
    const dialogRef = this.dialog.open(McpToolsModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '80vh',
      data: {
        tools: tools,
        serverUrl: serverUrl
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.logger.log('[INT-MCP] Tools modal closed');
    });
  }

  /**
   * Check if tools have been retrieved for current server
   */
  hasToolsRetrieved(): boolean {
    return this.toolsRetrieved && this.currentTools.length > 0;
  }

  /**
   * Check if a specific server has tools
   */
  serverHasTools(server: McpServer): boolean {
    return server.tools && Array.isArray(server.tools) && server.tools.length > 0;
  }

  /**
   * Check if currently loading tools for a specific server
   */
  isLoadingForServer(serverUrl: string): boolean {
    return this.isLoadingTools && this.loadingServerUrl === serverUrl;
  }

  /**
   * Check if current server has tools
   */
  currentServerHasTools(): boolean {
    return this.currentServer.tools && Array.isArray(this.currentServer.tools) && this.currentServer.tools.length > 0;
  }

  /**
   * Get tools count for current server
   */
  getCurrentServerToolsCount(): number {
    return this.currentServer.tools && Array.isArray(this.currentServer.tools) ? this.currentServer.tools.length : 0;
  }

  /**
   * View tools for current server being edited
   */
  viewCurrentServerTools(): void {
    if (this.currentServerHasTools() && this.currentServer.url) {
      this.openToolsModal(this.currentServer.tools, this.currentServer.url);
    }
  }

  /**
   * Refresh tools for current server being edited
   */
  refreshCurrentServerTools(): void {
    if (!this.currentServer.url) {
      this.notify.showWidgetStyleUpdateNotification('Server URL is missing', 3, 'error');
      return;
    }

    this.isLoadingTools = true;
    this.loadingServerUrl = this.currentServer.url;

    this.logger.log('[INT-MCP] Refreshing tools for current server:', this.currentServer.url);

    const currentOauth = this.currentServer.oauth && this.currentServer.oauth.connection_id
      ? this.currentServer.oauth
      : undefined;
    const currentToolsRequest = currentOauth
      ? this.integrationService.getMcpTools(this.currentServer.url, currentOauth)
      : this.integrationService.getMcpTools(this.currentServer.url);

    currentToolsRequest.subscribe(
      (response: any) => {
        this.logger.log('[INT-MCP] Tools refreshed:', response);
        
        // Handle response
        let rawTools: any[] = [];
        if (Array.isArray(response)) {
          rawTools = response;
        } else if (response && Array.isArray(response.tools)) {
          rawTools = response.tools;
        } else if (response && response.data && Array.isArray(response.data)) {
          rawTools = response.data;
        }

        // Normalize tools to ensure only name and description are present
        const tools = this.normalizeTools(rawTools);

        // Update normalized tools for current server
        this.currentServer.tools = tools;
        
        // Update in the servers array
        if (this.isEditing && this.editingIndex >= 0) {
          this.integration.value.servers[this.editingIndex].tools = tools;
        }
        
        // Save integration
        this.saveIntegration();
        
        // Show tools modal
        if (tools && tools.length > 0) {
          this.openToolsModal(tools, this.currentServer.url);
          this.notify.showWidgetStyleUpdateNotification('Tools refreshed successfully', 2, 'done');
        } else {
          this.notify.showWidgetStyleUpdateNotification('No tools found for this server', 3, 'warning');
        }
        
        this.isLoadingTools = false;
        this.loadingServerUrl = '';
      },
      (error) => {
        this.logger.error('[INT-MCP] Error refreshing tools:', error);
        this.isLoadingTools = false;
        this.loadingServerUrl = '';
        
        this.finishMcpToolsError(error, this.currentServer, 'Failed to refresh tools');
      }
    );
  }

  private authorizeBody(): McpOAuthAuthorizeBody {
    const body: McpOAuthAuthorizeBody = {
      mode: this.authType as McpOAuthMode,
      server_url: this.currentServer.url
    };
    if (this.currentServer.name) {
      body.name = this.currentServer.name;
    }
    if (this.authType === 'google' || this.authType === 'manual') {
      const scopes = this.parseScopes(this.scopesText);
      if (scopes.length) {
        body.scopes = scopes;
      }
    }
    if (this.authType === 'manual') {
      body.manual = {
        authorization_endpoint: this.manualAuthorizationUrl,
        token_endpoint: this.manualTokenUrl,
        client_id: this.manualClientId
      };
      if (this.manualClientSecret) {
        body.manual.client_secret = this.manualClientSecret;
      }
      if (this.manualRevocationUrl) {
        body.manual.revocation_endpoint = this.manualRevocationUrl;
      }
    }
    return body;
  }

  private parseScopes(value: string): string[] {
    if (!value) {
      return [];
    }
    return value.split(/[\s,]+/).map((scope) => scope.trim()).filter((scope) => !!scope);
  }

  /** Scopes stored on the OAuth connection, shown in the Google/manual field. */
  private scopesTextForServer(server: McpServer): string {
    const connectionId = server && server.oauth && server.oauth.connection_id;
    if (!connectionId) {
      return '';
    }
    const connection = this.oauthConnections[connectionId];
    const scopes = connection && connection.scopes;
    if (!scopes || !scopes.length) {
      return '';
    }
    return scopes.join(' ');
  }

  private notifyAuthorizationFailure(result: McpOAuthResult): void {
    if (result.ok !== false) {
      return;
    }
    const failure = result as { reason: string; message?: string; code?: string };
    let message: string;
    if (failure.reason === 'popup_blocked') {
      message = this.translate.instant('Integration.AllowPopups');
    } else if (failure.reason === 'closed') {
      message = this.translate.instant('Integration.AuthorizationCancelled');
    } else if (failure.reason === 'timeout') {
      message = this.translate.instant('Integration.AuthorizationExpired');
    } else if (failure.code === 'not_configured') {
      message = this.translate.instant('Integration.OAuthNotAvailable');
    } else {
      message = failure.message || this.translate.instant('Integration.OAuthNotAvailable');
    }
    this.notify.showWidgetStyleUpdateNotification(message, 4, 'error');
  }

  private revokeConnectionIfUnused(connectionId: string | null | undefined): void {
    if (!connectionId) {
      return;
    }
    const stillUsed = (this.integration.value.servers || []).some((server: McpServer) =>
      server.oauth && server.oauth.connection_id === connectionId
    );
    if (stillUsed) {
      return;
    }
    this.mcpOAuthService.deleteConnection(connectionId).subscribe(() => {
      this.logger.log('[INT-MCP] OAuth connection revoked', connectionId);
      this.loadOAuthConnections();
    }, (error) => {
      if (error && error.status !== 404 && error.status !== 503) {
        this.logger.error('[INT-MCP] delete connection error', error);
      }
    });
  }

  reconnectServer(server: McpServer): void {
    const mode = (server.oauth && server.oauth.mode) || 'mcp';
    if (mode === 'manual') {
      this.onSelectServer(server);
      this.authType = 'manual';
      return;
    }

    const popup = this.mcpOAuthService.openPopup();
    this.oauthPopup = popup;
    this.waitingForAuthorization = true;
    const body: McpOAuthAuthorizeBody = {
      mode: mode as McpOAuthMode,
      server_url: server.url
    };
    if (server.name) {
      body.name = server.name;
    }
    if (mode === 'google' && server.oauth) {
      const connection = this.oauthConnections[server.oauth.connection_id];
      body.scopes = connection && connection.scopes ? connection.scopes : [];
    }

    const savedOAuth = server.oauth ? { ...server.oauth } : null;
    this.mcpOAuthService.connect(body, popup).then((result) => {
      this.waitingForAuthorization = false;
      this.oauthPopup = null;
      if (!result.ok) {
        this.notifyAuthorizationFailure(result);
        return;
      }
      server.oauth = savedOAuth;
      if (savedOAuth && savedOAuth.connection_id) {
        const next = { ...this.reconnectRequired };
        next[savedOAuth.connection_id] = false;
        this.reconnectRequired = next;
      }
      this.loadOAuthConnections();
      this.refreshTools(server);
    });
  }

  loadOAuthConnections(): void {
    const servers = (this.integration && this.integration.value && this.integration.value.servers) || [];
    const hasOAuth = servers.some((server: McpServer) => server.oauth && server.oauth.connection_id);
    if (!hasOAuth) {
      this.oauthConnections = {};
      return;
    }
    this.mcpOAuthService.listConnections().subscribe((connections) => {
      const map: { [id: string]: McpOAuthConnection } = {};
      (connections || []).forEach((connection) => {
        map[connection._id] = connection;
      });
      this.oauthConnections = map;
      this.oauthStatusUnavailable = false;
      // The list can arrive after the row click or the popup. Fill scopes only while the field is still empty.
      if (!this.scopesText) {
        this.scopesText = this.scopesTextForServer(this.currentServer);
      }
    }, (error) => {
      if (error && error.status === 503) {
        this.oauthStatusUnavailable = true;
        return;
      }
      this.logger.error('[INT-MCP] list OAuth connections error', error);
    });
  }

  private mcpToolsErrorMessage(error: any, server: McpServer, fallback: string): string | null {
    if (error && error.status === 409 && server && server.oauth && server.oauth.connection_id) {
      this.reconnectRequired = { ...this.reconnectRequired, [server.oauth.connection_id]: true };
      this.notify.showWidgetStyleUpdateNotification(
        this.translate.instant('Integration.AuthorizationExpiredReconnect'),
        4,
        'error'
      );
      return null;
    }
    return (error && error.error && (error.error.error || error.error.message)) || (error && error.message) || fallback;
  }

  private finishMcpToolsError(error: any, server: McpServer, fallback: string): void {
    const errorMessage = this.mcpToolsErrorMessage(error, server, fallback);
    if (errorMessage) {
      this.notify.showWidgetStyleUpdateNotification(errorMessage, 3, 'error');
    }
  }

  // Get display value for transport
  getTransportDisplay(transport: string): string {
    // Currently only one transport type is supported
    return transport === 'streamable_http' ? 'HTTP Streamable' : transport;
  }

  saveIntegration() {
    let data = {
      integration: this.integration,
    }
    this.logger.log("[INT-MCP] saveIntegration ", this.integration)
    this.onUpdateIntegration.emit(data);
  }

  deleteIntegration() {
    this.onDeleteIntegration.emit(this.integration);
  }

  resetValues() {
    this.integration.value = {
      servers: []
    }
    this.resetForm();
  }

}

