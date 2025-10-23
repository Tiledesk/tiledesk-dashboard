import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IntegrationService } from 'app/services/integration.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { McpServer } from './mcp-server-table/mcp-server-table.component';

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
  typeOptions: string[] = ['HTTP Streamable'];
  
  // Form fields
  currentServer: McpServer = {
    name: '',
    url: '',
    type: 'HTTP Streamable'
  };
  
  isEditing: boolean = false;
  editingIndex: number = -1;

  constructor(
    private integrationService: IntegrationService,
    private logger: LoggerService
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
    if (!this.currentServer.name || !this.currentServer.url || !this.currentServer.type) {
      this.logger.error('[INT-MCP] Missing required fields');
      return;
    }

    if (this.isEditing && this.editingIndex >= 0) {
      // Update existing server
      this.integration.value.servers[this.editingIndex] = { ...this.currentServer };
      this.logger.log('[INT-MCP] Updated server at index', this.editingIndex);
    } else {
      // Add new server
      this.integration.value.servers.push({ ...this.currentServer });
      this.logger.log('[INT-MCP] Added new server');
    }

    this.resetForm();
    this.saveIntegration();
  }

  onSelectServer(server: McpServer): void {
    this.logger.log('[INT-MCP] Server selected:', server);
    const index = this.integration.value.servers.findIndex(s => 
      s.name === server.name && s.url === server.url && s.type === server.type
    );
    
    if (index >= 0) {
      this.currentServer = { ...server };
      this.isEditing = true;
      this.editingIndex = index;
    }
  }

  onDeleteServer(server: McpServer): void {
    this.logger.log('[INT-MCP] Delete server:', server);
    const index = this.integration.value.servers.findIndex(s => 
      s.name === server.name && s.url === server.url && s.type === server.type
    );
    
    if (index >= 0) {
      this.integration.value.servers.splice(index, 1);
      
      // If we were editing this server, reset the form
      if (this.isEditing && this.editingIndex === index) {
        this.resetForm();
      }
      
      this.saveIntegration();
    }
  }

  resetForm(): void {
    this.currentServer = {
      name: '',
      url: '',
      type: 'HTTP Streamable'
    };
    this.isEditing = false;
    this.editingIndex = -1;
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

