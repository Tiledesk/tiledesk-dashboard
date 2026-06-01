/** Types aligned with `.cursor/openapi-tables.yaml` */

export type TableSchema = Record<string, string>;

export interface DataTable {
  _id?: string;
  id_project?: string;
  name?: string;
  schema?: TableSchema;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DataTableWithRows extends DataTable {
  rows?: RowData[];
}

export interface CreateTableRequest {
  name: string;
  schema: TableSchema;
}

export interface UpdateTableRequest {
  name?: string;
  schema?: TableSchema;
}

export type RowData = Record<string, unknown>;

export interface TableRow {
  _id?: string;
  id_project?: string;
  id_table?: string;
  data?: RowData;
  createdAt?: string;
  updatedAt?: string;
}

export interface InsertRowRequest {
  data: RowData;
}

export type ConditionOperator =
  | 'Equal'
  | 'Not equal'
  | 'Greater than'
  | 'Greater or equal'
  | 'Less than'
  | 'Less or equal'
  | 'Contains';

export type MustMatch = 'all' | 'any';

export interface RowCondition {
  column: string;
  condition: ConditionOperator;
  value: string | number | boolean;
}

export interface RowMutationRequest {
  data: RowData;
  id_row?: string;
  must_match?: MustMatch;
  conditions?: RowCondition[];
}

export interface UpsertRowRequest extends RowMutationRequest {
  multi?: boolean;
}

export interface ApiSuccessMessage {
  success?: boolean;
  message?: string;
}

export interface ApiErrorResponse {
  success?: boolean;
  error?: string;
}
