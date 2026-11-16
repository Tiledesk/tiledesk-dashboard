/** Error codes returned as `{ success: false, error: <code>, ... }` by the import/sync routes. */
export type KbSourceErrorCode =
  | 'connection_needs_reconnect'
  | 'already_imported'
  | 'owned_by_other_folder'
  | 'too_many_files'
  | 'plan_limit'
  | 'refresh_not_available'
  | 'in_use'
  | 'sync_running';

export interface KbSourceError {
  success: false;
  error: KbSourceErrorCode | string;
  limit?: number;          // too_many_files (5000)
  plan_limit?: number;     // plan_limit
  count?: number;          // plan_limit
  folders_count?: number;  // in_use (DELETE /connections/:id -> 409)
}

export interface KbSourceProvider {
  id: string;
  available: boolean;
}

export interface KbSourceProviders {
  providers: KbSourceProvider[];
  kb_max_file_size: number;
  supported_extensions: string[];
}

export interface KbSourceConnection {
  _id: string;
  provider: string;
  account: { display_name: string; upn: string; tenant_id: string };
  created_by: { id: string; name: string };
  status: string;
  last_error?: string;
  folders_count: number;
}

export type KbSourceItemKind = 'site' | 'onedrive' | 'drive' | 'folder' | 'file';

export interface KbSourceItem {
  kind: KbSourceItemKind;
  id: string;
  name: string;
  drive_id?: string;   // onedrive roots
  size?: number;       // folder/file children
  supported?: boolean; // folder/file children
  reason?: string;     // why a child is not supported
}

export interface KbSourceItems {
  items: KbSourceItem[];
  next_page?: string;
}

export interface KbImportRequest {
  namespace: string;
  connection_id: string;
  items: { drive_id: string; item_id: string; kind: 'folder' | 'file' }[];
  refresh_rate: string;
  tags?: string[];
}

export interface KbImportResponse {
  contents: { _id: string; type: string; name: string }[];
}

export interface Ms365ConnectResult {
  status: 'connected' | 'error' | 'blocked' | 'closed';
  reason?: string;
  connection_id?: string;
}
