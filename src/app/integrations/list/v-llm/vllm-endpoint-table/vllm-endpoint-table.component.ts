import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { LoggerService } from 'app/services/logger/logger.service';

export interface VllmEndpoint {
  name: string;
  url: string;
  apikey?: string;
  models: string[];
}

@Component({
  selector: 'vllm-endpoint-table',
  templateUrl: './vllm-endpoint-table.component.html',
  styleUrls: ['./vllm-endpoint-table.component.scss']
})
export class VllmEndpointTableComponent implements OnInit, OnChanges {
  @Input() endpoints: VllmEndpoint[] = [];
  @Output() onSelectEndpoint = new EventEmitter<VllmEndpoint>();
  @Output() onDeleteEndpoint = new EventEmitter<VllmEndpoint>();

  filteredEndpoints: VllmEndpoint[] = [];
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

  onRowClick(endpoint: VllmEndpoint): void {
    this.logger.log('[VLLM-TABLE] Row clicked:', endpoint);
    this.onSelectEndpoint.emit(endpoint);
  }

  onDelete(endpoint: VllmEndpoint, event: Event): void {
    event.stopPropagation();
    this.logger.log('[VLLM-TABLE] Delete endpoint:', endpoint);
    this.onDeleteEndpoint.emit(endpoint);
  }

  getSortIcon(field: 'name' | 'url'): string {
    if (this.sortField !== field) {
      return 'unfold_more';
    }
    return this.sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  hasApiKey(endpoint: VllmEndpoint): boolean {
    return !!String(endpoint.apikey || '').trim();
  }

  getModelsCount(endpoint: VllmEndpoint): number {
    return Array.isArray(endpoint.models) ? endpoint.models.length : 0;
  }
}
