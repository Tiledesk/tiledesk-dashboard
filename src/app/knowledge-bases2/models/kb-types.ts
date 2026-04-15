// Feature-local types for knowledge-bases2.
// Keep these intentionally minimal and permissive: the backend payloads evolve and
// we want incremental typing without breaking behavior.

export interface KbNamespace {
  id: string;
  name: string;
  default?: boolean;
  hybrid?: boolean;
  count?: number;
  [key: string]: any;
}

export interface KbQuotas {
  kbs?: number;
  [key: string]: any;
}

export interface KbListItem {
  _id?: string;
  id?: string;
  name?: string;
  type?: string;
  status?: string;
  updatedAt?: string | number | Date;
  createdAt?: string | number | Date;
  [key: string]: any;
}

