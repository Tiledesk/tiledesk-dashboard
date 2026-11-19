import {
  getMs365Warning, isMs365Content, isMs365File, isMs365Folder, isMs365StandaloneFile, isMs365Syncing,
  ms365DeleteErrorKey, ms365ErrorCode, ms365FileCount, ms365LastSync, showsRefreshRate,
  isSourceFolder, sourceProviderOf, sourceLabelKey, sourceIconOf, showsMs365Origin
} from './kb-ms365-row.util';

describe('kb-ms365-row.util', () => {
  const folder = { type: 'ms365_folder', external: { provider: 'microsoft365', sync: { state: 'idle', counts: { files: 7 } } } };
  const child = { type: 'pdf', source_origin_id: 'f1', external: { provider: 'microsoft365' } };

  it('classifies folders, files and standalone files', () => {
    expect(isMs365Folder(folder)).toBe(true);
    expect(isMs365File(folder)).toBe(false);
    expect(isMs365File(child)).toBe(true);
    expect(isMs365StandaloneFile(child)).toBe(false);
    expect(isMs365StandaloneFile({ type: 'pdf', external: { provider: 'microsoft365' } })).toBe(true);
    expect(isMs365Content({ type: 'pdf' })).toBe(false);
    expect(isMs365Content(null)).toBe(false);
  });

  it('syncing only for importing|syncing folders', () => {
    expect(isMs365Syncing({ ...folder, external: { sync: { state: 'importing' } } })).toBe(true);
    expect(isMs365Syncing({ ...folder, external: { sync: { state: 'syncing' } } })).toBe(true);
    expect(isMs365Syncing(folder)).toBe(false);
    expect(isMs365Syncing(child)).toBe(false);
  });

  it('maps last_error codes to warnings; needs_reconnect can reconnect', () => {
    const w = getMs365Warning({ ...folder, last_error: { code: 'needs_reconnect' } });
    expect(w).toEqual({ code: 'needs_reconnect', key: 'KbPage.Ms365NeedsReconnect', reconnect: true });
    for (const code of ['folder_not_found', 'plan_limit', 'remove_failed', 'schedule_failed', 'sync_failed']) {
      const x = getMs365Warning({ ...folder, last_error: { code } });
      expect(x.reconnect).toBe(false);
      expect(x.key).toContain('KbPage.Ms365Warn');
    }
    expect(getMs365Warning({ ...folder, last_error: { code: 'weird' } }).key).toBe('KbPage.Ms365WarnSyncFailed');
    expect(getMs365Warning(folder)).toBeNull();
    expect(getMs365Warning({ type: 'url', last_error: { code: 'x' } })).toBeNull();
  });

  it('counts, last sync and refresh rate column', () => {
    expect(ms365FileCount(folder)).toBe(7);
    expect(ms365FileCount({})).toBe(0);
    expect(ms365LastSync({ last_refresh: 'a', external: { sync: { last_sync_at: 'b' } } })).toBe('a');
    expect(ms365LastSync({ external: { sync: { last_sync_at: 'b' } } })).toBe('b');
    expect(showsRefreshRate(folder)).toBe(true);
    expect(showsRefreshRate(child)).toBe(false);
    expect(showsRefreshRate({ type: 'url' })).toBe(true);
    expect(showsRefreshRate({ type: 'pdf' })).toBe(false);
  });

  it('delete errors', () => {
    expect(ms365ErrorCode({ error: { error: 'x' } })).toBe('x');
    expect(ms365ErrorCode({})).toBeNull();
    expect(ms365DeleteErrorKey({ status: 409, error: { error: 'remove_failed', failed: 1, removed: 0 } })).toBe('KbPage.Ms365DeleteRemoveFailed');
    expect(ms365DeleteErrorKey({ status: 409, error: { error: 'sync_running' } })).toBe('KbPage.Ms365DeleteSyncRunning');
    expect(ms365DeleteErrorKey({ status: 500, error: {} })).toBeNull();
    expect(ms365DeleteErrorKey({ status: 409, error: { error: 'other' } })).toBeNull();
  });

  describe('Google Drive', () => {
    const gFolder = { type: 'gdrive_folder', external: { provider: 'googledrive' } };
    const gChild = { type: 'pdf', source_origin: '/Docs', source_origin_id: 'g1', external: { provider: 'googledrive' } };

    it('isSourceFolder covers both folder types; the old names are aliases', () => {
      expect(isSourceFolder(gFolder)).toBe(true);
      expect(isSourceFolder(folder)).toBe(true);
      expect(isSourceFolder(gChild)).toBe(false);
      expect(isMs365Folder(gFolder)).toBe(true);
      expect(isMs365File(gFolder)).toBe(false);
      expect(isMs365File(gChild)).toBe(true);
      expect(isMs365Content(gFolder)).toBe(true);
      expect(isMs365StandaloneFile({ type: 'pdf', external: { provider: 'googledrive' } })).toBe(true);
      expect(showsRefreshRate(gFolder)).toBe(true);
    });

    it('sourceProviderOf, sourceLabelKey and sourceIconOf', () => {
      expect(sourceProviderOf(gFolder)).toBe('googledrive');
      expect(sourceProviderOf(folder)).toBe('microsoft365');
      expect(sourceProviderOf(gChild)).toBe('googledrive');
      expect(sourceProviderOf(child)).toBe('microsoft365');
      expect(sourceProviderOf({ type: 'url' })).toBeNull();
      expect(sourceLabelKey(gFolder)).toBe('KbPage.GdriveCard');
      expect(sourceLabelKey(folder)).toBe('KbPage.Ms365Card');
      expect(sourceIconOf(gFolder)).toBe('add_to_drive');
      expect(sourceIconOf(folder)).toBe('cloud_sync');
    });

    it('origin pill and syncing work for Google', () => {
      expect(showsMs365Origin(gChild)).toBe(true);
      expect(isMs365Syncing({ type: 'gdrive_folder', external: { sync: { state: 'syncing' } } })).toBe(true);
    });
  });
});
