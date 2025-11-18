import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { LoggerService } from 'app/services/logger/logger.service';

export interface McpServer {
  id?: string;
  name: string;
  url: string;
  transport: string;
}

@Component({
  selector: 'mcp-server-table',
  templateUrl: './mcp-server-table.component.html',
  styleUrls: ['./mcp-server-table.component.scss']
})
export class McpServerTableComponent implements OnInit {
  @Input() mcpServers: McpServer[] = [];
  @Output() onSelectServer = new EventEmitter<McpServer>();
  @Output() onDeleteServer = new EventEmitter<McpServer>();

  filteredServers: McpServer[] = [];
  filterText: string = '';
  sortField: 'name' | 'url' | 'transport' = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private logger: LoggerService) { }

  ngOnInit(): void {
    this.applyFilter();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mcpServers']) {
      this.applyFilter();
    }
  }

  applyFilter(): void {
    this.logger.log('[MCP-TABLE] applyFilter - filterText:', this.filterText);
    
    // Filter
    if (!this.filterText || this.filterText.trim() === '') {
      this.filteredServers = [...this.mcpServers];
    } else {
      const searchTerm = this.filterText.toLowerCase().trim();
      this.filteredServers = this.mcpServers.filter(server =>
        server.name?.toLowerCase().includes(searchTerm) ||
        server.url?.toLowerCase().includes(searchTerm) ||
        server.transport?.toLowerCase().includes(searchTerm)
      );
    }

    // Sort
    this.sortServers();
  }

  onFilterChange(value: string): void {
    this.filterText = value;
    this.applyFilter();
  }

  onSort(field: 'name' | 'url' | 'transport'): void {
    if (this.sortField === field) {
      // Toggle direction
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.sortServers();
  }

  sortServers(): void {
    this.filteredServers.sort((a, b) => {
      const aValue = (a[this.sortField] || '').toLowerCase();
      const bValue = (b[this.sortField] || '').toLowerCase();
      
      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  onRowClick(server: McpServer): void {
    this.logger.log('[MCP-TABLE] Row clicked:', server);
    this.onSelectServer.emit(server);
  }

  onDelete(server: McpServer, event: Event): void {
    event.stopPropagation();
    this.logger.log('[MCP-TABLE] Delete server:', server);
    this.onDeleteServer.emit(server);
  }

  getSortIcon(field: 'name' | 'url' | 'transport'): string {
    if (this.sortField !== field) {
      return 'unfold_more';
    }
    return this.sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  // Get display value for transport
  getTransportDisplay(transport: string): string {
    // const transportMap: { [key: string]: string } = {
    //     'streamable_http': 'HTTP Streamable'
    //   };
    //   return transportMap[transport] || transport;
    // Currently only one transport type is supported
    return transport === 'streamable_http' ? 'HTTP Streamable' : transport;
  }
}

