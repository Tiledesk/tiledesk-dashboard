/** Types aligned with `.cursor/rules/data-tables.openapi.yaml` */

export const COLUMN_NAME_PATTERN = /^[a-zA-Z0-9_]+$/;

export type ColumnType = 'string' | 'number' | 'boolean' | 'datetime';

export type MatchMode = 'all' | 'any';

export type ConditionOperator =
  | 'equal'
  | 'not_equal'
  | 'contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'greater_or_equal'
  | 'less_than'
  | 'less_or_equal'
  | 'exists'
  | 'not_exists';

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  index: number;
}

export interface ColumnInput {
  name: string;
  type: ColumnType;
  index?: number;
}

export interface RenameColumnRequest {
  name: string;
}

export interface DataTable {
  _id?: string;
  id_project?: string;
  name?: string;
  schema?: Column[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TableWithRows extends DataTable {
  /** Preview rows from GET table — flat, no `_id`, missing values = null. Max 100. */
  rows?: RowPreview[];
}

export interface CreateTableRequest {
  name: string;
  schema?: ColumnInput[];
}

/** Existing column (with id) or new column (without id). */
export type UpdateTableSchemaItem =
  | ColumnInput
  | (ColumnInput & { id: string });

export interface UpdateTableRequest {
  name?: string;
  schema?: UpdateTableSchemaItem[];
}

export type RowData = Record<string, unknown>;

/** Flat row from GET /rows/list — `_id` + schema fields at top level. */
export interface RowListItem {
  _id?: string;
  [key: string]: unknown;
}

/** Preview row from GET /tables/{id} — schema fields only, no `_id`. */
export type RowPreview = RowData;

export interface RowDocument {
  _id?: string;
  id_project?: string;
  id_table?: string;
  data?: RowData;
  createdAt?: string;
  updatedAt?: string;
}

export interface InsertRowRequest {
  data: RowData;
  id_row?: string;
}

export interface RowCondition {
  column: string;
  operator: ConditionOperator;
  value?: string | number | boolean;
}

export interface RowSearchRequest {
  must_match?: MatchMode;
  match?: MatchMode;
  conditions?: RowCondition[];
}

export interface UpdateRowRequest {
  id_row?: string;
  must_match?: MatchMode;
  match?: MatchMode;
  conditions?: RowCondition[];
  data: RowData;
}

export interface UpsertRowRequest extends UpdateRowRequest {
  multi?: boolean;
}

export interface DeleteRowRequest {
  id_row?: string;
  must_match?: MatchMode;
  match?: MatchMode;
  conditions?: RowCondition[];
}

export interface ApiSuccessMessage {
  success?: boolean;
  message?: string;
}

export interface ApiErrorResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

export function isValidColumnName(name: string): boolean {
  return COLUMN_NAME_PATTERN.test((name || '').trim());
}

export function sortColumns(schema: Column[] | undefined): Column[] {
  if (!schema?.length) { return []; }
  return [...schema].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
}
