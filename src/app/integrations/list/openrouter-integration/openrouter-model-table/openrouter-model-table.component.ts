import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { LoggerService } from 'app/services/logger/logger.service';

export type OpenRouterSort = 'price' | 'throughput' | 'latency' | null;

export interface OpenRouterModelConfig {
  /** Full OpenRouter model id, e.g. "openai/gpt-4o". */
  id: string;
  /** Human readable model name as returned by OpenRouter. */
  name: string;
  /** Ordered provider slugs (OpenRouter endpoint "tag"), best first. */
  providers: string[];
  /** Allow OpenRouter to route outside the selected providers. */
  allow_fallbacks: boolean;
  /** Provider sort preference, applied when no explicit order is set. */
  sort: OpenRouterSort;
}

@Component({
  selector: 'openrouter-model-table',
  templateUrl: './openrouter-model-table.component.html',
  styleUrls: ['./openrouter-model-table.component.scss']
})
export class OpenRouterModelTableComponent implements OnInit, OnChanges {
  @Input() models: OpenRouterModelConfig[] = [];
  @Output() onSelectModel = new EventEmitter<OpenRouterModelConfig>();
  @Output() onDeleteModel = new EventEmitter<OpenRouterModelConfig>();

  filteredModels: OpenRouterModelConfig[] = [];
  filterText = '';
  sortField: 'name' | 'id' = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private logger: LoggerService) { }

  ngOnInit(): void {
    this.applyFilter();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['models']) {
      this.applyFilter();
    }
  }

  applyFilter(): void {
    if (!this.filterText || this.filterText.trim() === '') {
      this.filteredModels = [...(this.models || [])];
    } else {
      const searchTerm = this.filterText.toLowerCase().trim();
      this.filteredModels = (this.models || []).filter((model) =>
        model.name?.toLowerCase().includes(searchTerm) ||
        model.id?.toLowerCase().includes(searchTerm) ||
        model.providers?.some((provider) => provider.toLowerCase().includes(searchTerm))
      );
    }

    this.sortModels();
  }

  onFilterChange(value: string): void {
    this.filterText = value;
    this.applyFilter();
  }

  onSort(field: 'name' | 'id'): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.sortModels();
  }

  sortModels(): void {
    this.filteredModels.sort((a, b) => {
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

  onRowClick(model: OpenRouterModelConfig): void {
    this.logger.log('[OPENROUTER-TABLE] Row clicked:', model);
    this.onSelectModel.emit(model);
  }

  onDelete(model: OpenRouterModelConfig, event: Event): void {
    event.stopPropagation();
    this.logger.log('[OPENROUTER-TABLE] Delete model:', model);
    this.onDeleteModel.emit(model);
  }

  getSortIcon(field: 'name' | 'id'): string {
    if (this.sortField !== field) {
      return 'unfold_more';
    }
    return this.sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  getProviders(model: OpenRouterModelConfig): string[] {
    return Array.isArray(model?.providers) ? model.providers : [];
  }

  /** Short summary of the routing options, shown next to the providers. */
  getRoutingSummary(model: OpenRouterModelConfig): string {
    const parts: string[] = [];

    if (model?.sort) {
      parts.push(model.sort);
    }
    parts.push(model?.allow_fallbacks ? 'fallbacks on' : 'fallbacks off');

    return parts.join(' · ');
  }

  hasActiveSearch(): boolean {
    return !!this.filterText?.trim();
  }

  get emptyStateMessageKey(): string {
    return this.hasActiveSearch()
      ? 'Integration.NoOpenRouterModelsFound'
      : 'Integration.NoOpenRouterModels';
  }
}
