import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { LoggerService } from 'app/services/logger/logger.service';

export interface AgentPlatformEndpoint {
  name: string;
  url: string;
  apikey?: string;
  models: string[];
  project?: string;
  location?: string;
}

@Component({
  selector: 'agentplatform-endpoint-table',
  templateUrl: './agentplatform-endpoint-table.component.html',
  styleUrls: ['./agentplatform-endpoint-table.component.scss']
})
export class AgentPlatformEndpointTableComponent implements OnInit, OnChanges {
  @Input() endpoints: AgentPlatformEndpoint[] = [];
  @Output() onSelectEndpoint = new EventEmitter<AgentPlatformEndpoint>();
  @Output() onDeleteEndpoint = new EventEmitter<AgentPlatformEndpoint>();

  filteredEndpoints: AgentPlatformEndpoint[] = [];
  filterText = '';
  sortField: 'name' | 'url' = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  readonly apiKeyPlaceholder = '●●●●●●';

  constructor(private logger: LoggerService) { }

  ngOnInit(): void {
    this.applyFilter();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['endpoints']) {
      this.applyFilter();
    }
  }

  applyFilter(): void {
    if (!this.filterText || this.filterText.trim() === '') {
      this.filteredEndpoints = [...this.endpoints];
    } else {
      const searchTerm = this.filterText.toLowerCase().trim();
      this.filteredEndpoints = this.endpoints.filter((endpoint) =>
        endpoint.name?.toLowerCase().includes(searchTerm) ||
        endpoint.url?.toLowerCase().includes(searchTerm) ||
        endpoint.project?.toLowerCase().includes(searchTerm) ||
        endpoint.location?.toLowerCase().includes(searchTerm) ||
        endpoint.models?.some((model) => model.toLowerCase().includes(searchTerm))
      );
    }

    this.sortEndpoints();
  }

  onFilterChange(value: string): void {
    this.filterText = value;
    this.applyFilter();
  }

  onSort(field: 'name' | 'url'): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.sortEndpoints();
  }

  sortEndpoints(): void {
    this.filteredEndpoints.sort((a, b) => {
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

  onRowClick(endpoint: AgentPlatformEndpoint): void {
    this.logger.log('[AGENTPLATFORM-TABLE] Row clicked:', endpoint);
    this.onSelectEndpoint.emit(endpoint);
  }

  onDelete(endpoint: AgentPlatformEndpoint, event: Event): void {
    event.stopPropagation();
    this.logger.log('[AGENTPLATFORM-TABLE] Delete endpoint:', endpoint);
    this.onDeleteEndpoint.emit(endpoint);
  }

  getSortIcon(field: 'name' | 'url'): string {
    if (this.sortField !== field) {
      return 'unfold_more';
    }
    return this.sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  hasApiKey(endpoint: AgentPlatformEndpoint): boolean {
    return !!String(endpoint.apikey || '').trim();
  }

  getModelsCount(endpoint: AgentPlatformEndpoint): number {
    return Array.isArray(endpoint.models) ? endpoint.models.length : 0;
  }

  hasActiveSearch(): boolean {
    return !!this.filterText?.trim();
  }

  get emptyStateMessageKey(): string {
    return this.hasActiveSearch()
      ? 'Integration.NoAgentPlatformEndpointsFound'
      : 'Integration.NoAgentPlatformEndpoints';
  }
}
