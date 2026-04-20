import { Injectable } from '@angular/core';
import { KB_DEFAULT_PARAMS } from 'app/utils/util';

export type SortDirection = 'asc' | 'desc';

export interface KbListQueryParams {
  limit?: number;
  page?: number;
  sortField?: string;
  direction?: SortDirection;
  namespace?: string;
  status?: string;
  type?: string;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class KbListQueryParamsService {
  build(params: KbListQueryParams): string {
    const direction = this.normalizeDirection(params.direction ?? KB_DEFAULT_PARAMS.DIRECTION);
    const q: KbListQueryParams = {
      limit: params.limit ?? KB_DEFAULT_PARAMS.LIMIT,
      page: params.page ?? KB_DEFAULT_PARAMS.NUMBER_PAGE,
      sortField: params.sortField ?? KB_DEFAULT_PARAMS.SORT_FIELD,
      direction,
      namespace: params.namespace,
      status: params.status,
      type: params.type,
      search: params.search,
    };

    const entries: Array<[string, string]> = [];
    if (q.limit !== undefined) entries.push(['limit', String(q.limit)]);
    if (q.page !== undefined) entries.push(['page', String(q.page)]);
    if (q.sortField) entries.push(['sortField', q.sortField]);
    if (q.direction) entries.push(['direction', q.direction]);
    if (q.namespace) entries.push(['namespace', q.namespace]);
    if (q.status) entries.push(['status', q.status]);
    if (q.type) entries.push(['type', q.type]);
    if (q.search) entries.push(['search', q.search]);

    return `?${entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')}`;
  }

  private normalizeDirection(direction: unknown): SortDirection {
    // Backend might accept either 'asc'|'desc' or numeric -1|1 (legacy).
    if (direction === 'asc' || direction === 1 || direction === '1') return 'asc';
    return 'desc';
  }

  defaultSortField(): string {
    return KB_DEFAULT_PARAMS.SORT_FIELD;
  }

  defaultDirection(): SortDirection {
    return this.normalizeDirection(KB_DEFAULT_PARAMS.DIRECTION);
  }
}

