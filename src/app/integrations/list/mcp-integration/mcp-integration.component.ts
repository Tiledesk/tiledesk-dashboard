import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IntegrationService } from 'app/services/integration.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { McpServer, McpTool } from './mcp-server-table/mcp-server-table.component';
import { MatDialog } from '@angular/material/dialog';
import { NotifyService } from 'app/core/notify.service';
import { McpToolsModalComponent } from './mcp-tools-modal/mcp-tools-modal.component';
import { TranslateService } from '@ngx-translate/core';

const Swal = require('sweetalert2');

@Component({
  selector: 'mcp-integration',
  templateUrl: './mcp-integration.component.html',
  styleUrls: ['./mcp-integration.component.scss']
})
export class McpIntegrationComponent implements OnInit {

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
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.logger.log("[INT-MCP] integration ", this.integration)
    this.translateparams = { intname: 'MCP' };
    
    // Initialize servers array if not set
    if (!this.integration.value.servers) {
      this.integration.value.servers = [];
    }
  }

  addOrUpdateServer(): void {
    this.logger.log('[INT-MCP] addOrUpdateServer', this.currentServer, 'isEditing:', this.isEditing);
    
    // Validation
    if (!this.currentServer.name || !this.currentServer.url || !this.currentServer.transport) {
      this.logger.error('[INT-MCP] Missing required fields');
      return;
    }

    // Preserve tools if they were retrieved
    const toolsToPreserve = this.currentServer.tools || [];

    if (this.isEditing && this.editingIndex >= 0) {
      // Update existing server - preserve existing tools if no new ones were retrieved
      const existingServer = this.integration.value.servers[this.editingIndex];
      const serverToSave: McpServer = { 
        ...this.currentServer,
        tools: toolsToPreserve.length > 0 ? toolsToPreserve : existingServer.tools
      };
      this.integration.value.servers[this.editingIndex] = serverToSave;
      this.logger.log('[INT-MCP] Updated server at index', this.editingIndex);
    } else {
      // Add new server with tools if available
      const serverToAdd: McpServer = { 
        ...this.currentServer,
        tools: toolsToPreserve
      };
      this.integration.value.servers.push(serverToAdd);
      this.logger.log('[INT-MCP] Added new server');
    }

    this.resetForm();
    this.saveIntegration();
  }

  onSelectServer(server: McpServer): void {
    this.logger.log('[INT-MCP] Server selected:', server);
    const index = this.integration.value.servers.findIndex(s => 
      s.name === server.name && s.url === server.url && s.transport === server.transport
    );
    
    if (index >= 0) {
      this.currentServer = { ...server };
      this.isEditing = true;
      this.editingIndex = index;
    }
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
   * Connect to MCP server and retrieve tools
   */
  connectToServer(): void {
    // Validation
    if (!this.currentServer.url) {
      this.notify.showWidgetStyleUpdateNotification('Please enter a server URL', 3, 'error');
      return;
    }

    this.isLoadingTools = true;
    this.loadingServerUrl = this.currentServer.url;
    this.toolsRetrieved = false;

    this.logger.log('[INT-MCP] Connecting to server:', this.currentServer.url);

    this.integrationService.getMcpTools(this.currentServer.url).subscribe(
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
        
        const errorMessage = error?.error?.message || error?.message || 'Failed to retrieve tools from server';
        this.notify.showWidgetStyleUpdateNotification(errorMessage, 3, 'error');
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

    this.integrationService.getMcpTools(server.url).subscribe(
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
        
        const errorMessage = error?.error?.message || error?.message || 'Failed to refresh tools';
        this.notify.showWidgetStyleUpdateNotification(errorMessage, 3, 'error');
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

    this.integrationService.getMcpTools(this.currentServer.url).subscribe(
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
        
        const errorMessage = error?.error?.message || error?.message || 'Failed to refresh tools';
        this.notify.showWidgetStyleUpdateNotification(errorMessage, 3, 'error');
      }
    );
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

