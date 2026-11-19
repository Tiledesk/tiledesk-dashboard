import { KbSourceProviderId } from 'app/models/kb-sources.model';
import { sourceMessageKey } from '../../utils/kb-source-keys';

/**
 * Pure helpers for rendering and managing Microsoft 365 contents (folders `ms365_folder`
 * and the files imported from them / on their own) in the KB contents table and detail modal.
 */

export interface Ms365Warning {
  code: string;
  /** i18n key of the short text shown in the warning chip. */
  key: string;
  /** true when the user can fix it by signing in again. */
  reconnect: boolean;
}

const WARNING_KEYS: { [code: string]: string } = {
  needs_reconnect: 'KbPage.Ms365NeedsReconnect',
  connection_needs_reconnect: 'KbPage.Ms365NeedsReconnect',
  folder_not_found: 'KbPage.Ms365WarnFolderNotFound',
  plan_limit: 'KbPage.Ms365WarnPlanLimit',
  remove_failed: 'KbPage.Ms365WarnRemoveFailed',
  schedule_failed: 'KbPage.Ms365WarnScheduleFailed',
  sync_failed: 'KbPage.Ms365WarnSyncFailed',
};

/** A folder source of any provider (`ms365_folder` or `gdrive_folder`). */
export function isSourceFolder(kb: any): boolean {
  return kb?.type === 'ms365_folder' || kb?.type === 'gdrive_folder';
}

/** Provider of a source content (folder by type, file by `external.provider`), or null. */
export function sourceProviderOf(kb: any): KbSourceProviderId | null {
  if (kb?.type === 'ms365_folder') return 'microsoft365';
  if (kb?.type === 'gdrive_folder') return 'googledrive';
  const p = kb?.external?.provider;
  return p === 'microsoft365' || p === 'googledrive' ? p : null;
}

/** i18n key of the provider name shown in the chips and pills. */
export function sourceLabelKey(kb: any): 'KbPage.Ms365Card' | 'KbPage.GdriveCard' {
  return sourceProviderOf(kb) === 'googledrive' ? 'KbPage.GdriveCard' : 'KbPage.Ms365Card';
}

/** Material icon of the provider. */
export function sourceIconOf(kb: any): string {
  return sourceProviderOf(kb) === 'googledrive' ? 'add_to_drive' : 'cloud_sync';
}

/** Kept under its old name: a folder of any provider (Microsoft 365 or Google Drive). */
export const isMs365Folder = isSourceFolder;

/** A file that comes from a source provider (inside a folder, or imported on its own). */
export function isMs365File(kb: any): boolean {
  return !!kb?.external?.provider && !isSourceFolder(kb);
}

export function isMs365Content(kb: any): boolean {
  return isMs365Folder(kb) || isMs365File(kb);
}

/** File imported on its own (not owned by a folder): it has its own refresh rate. */
export function isMs365StandaloneFile(kb: any): boolean {
  return isMs365File(kb) && !kb?.source_origin_id;
}

export function isMs365Syncing(kb: any): boolean {
  const state = kb?.external?.sync?.state;
  return isMs365Folder(kb) && (state === 'importing' || state === 'syncing');
}

/** Warning to show for `last_error`, or null. Unknown codes get the generic sync text. */
export function getMs365Warning(kb: any): Ms365Warning | null {
  if (!isMs365Content(kb)) {
    return null;
  }
  const code = kb?.last_error?.code;
  if (!code) {
    return null;
  }
  const reconnect = WARNING_KEYS[code] === WARNING_KEYS['needs_reconnect'];
  let key = WARNING_KEYS[code] || WARNING_KEYS['sync_failed'];
  // the texts that name the product have a Google Drive variant
  if (reconnect) { key = sourceMessageKey(sourceProviderOf(kb), 'NeedsReconnect'); }
  else if (code === 'folder_not_found') { key = sourceMessageKey(sourceProviderOf(kb), 'WarnFolderNotFound'); }
  return { code, key, reconnect };
}

export function ms365FileCount(kb: any): number {
  return Number(kb?.external?.sync?.counts?.files) || 0;
}

export function ms365LastSync(kb: any): any {
  return kb?.last_refresh || kb?.external?.sync?.last_sync_at || null;
}

/** Whether the refresh-rate column shows a value (url, sitemap, folder, standalone file). */
export function showsRefreshRate(kb: any): boolean {
  return kb?.type === 'url' || kb?.type === 'sitemap' || isMs365Folder(kb) || isMs365StandaloneFile(kb);
}

/** Server error body code of an HttpErrorResponse (`{ error: 'sync_running' }`), if any. */
export function ms365ErrorCode(err: any): string | null {
  const body = err?.error;
  if (body && typeof body.error === 'string') {
    return body.error;
  }
  return null;
}

/** i18n key of the toast for a refused delete (409), or null for any other failure. */
export function ms365DeleteErrorKey(err: any): string | null {
  if (err?.status !== 409) {
    return null;
  }
  const code = ms365ErrorCode(err);
  if (code === 'remove_failed') return 'KbPage.Ms365DeleteRemoveFailed';
  if (code === 'sync_running') return 'KbPage.Ms365DeleteSyncRunning';
  return null;
}

/** connection_id -> "display_name — upn" from GET /kb/sources/connections. */
export function buildMs365AccountMap(connections: any[]): { [connectionId: string]: string } {
  const map: { [connectionId: string]: string } = {};
  (connections || []).forEach(c => {
    if (!c || !c._id) return;
    const name = c.account?.display_name;
    const upn = c.account?.upn;
    const label = name && upn ? name + ' — ' + upn : (name || upn || '');
    if (label) map[c._id] = label;
  });
  return map;
}

export function ms365AccountLabel(kb: any, map: { [connectionId: string]: string } | null | undefined): string {
  const id = kb?.external?.connection_id;
  return (id && map && map[id]) || '';
}

/** The provider origin pill is only for source files that carry a source_origin. */
export function showsMs365Origin(kb: any): boolean {
  return isMs365File(kb) && !!sourceProviderOf(kb) && !!kb?.source_origin;
}
