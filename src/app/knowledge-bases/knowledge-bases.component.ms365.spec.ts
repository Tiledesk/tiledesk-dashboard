import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { KnowledgeBasesComponent } from './knowledge-bases.component';

/**
 * The page is too tangled for a TestBed spec (dozens of services), so the Microsoft 365
 * handlers are exercised on an object that has the component prototype and only the
 * collaborators they use.
 */
describe('KnowledgeBasesComponent (Microsoft 365 handlers)', () => {
  let page: any;
  let notify: jasmine.SpyObj<any>;
  let kbSources: jasmine.SpyObj<any>;
  let kbService: jasmine.SpyObj<any>;
  const folder = { _id: 'f1', type: 'ms365_folder', name: '/Sales', namespace: 'n', external: { provider: 'microsoft365' } };
  const child = { _id: 'k1', type: 'pdf', name: 'a.pdf', namespace: 'n', source_origin_id: 'f1', external: { provider: 'microsoft365' } };

  beforeEach(() => {
    page = Object.create(KnowledgeBasesComponent.prototype);
    notify = jasmine.createSpyObj('notify', ['showWidgetStyleUpdateNotification']);
    kbSources = jasmine.createSpyObj('kbSources', ['syncFolder', 'getConnections']);
    kbService = jasmine.createSpyObj('kbService', ['deleteKb']);
    page.notify = notify;
    page.kbSources = kbSources;
    page.kbService = kbService;
    page.translate = { instant: (k: string) => k };
    page.logger = { log: () => {}, error: () => {} };
    page.scheduleMs365Reloads = jasmine.createSpy('scheduleMs365Reloads');
    page.getAllNamespaces = jasmine.createSpy('getAllNamespaces');
    page.trackUserActioOnKB = () => {};
    page.kbsList = [folder, child];
    page.kbsListCount = 2;
    page.kbsContentTotalCount = 2;
    page.syncNamespaceContentCount = () => {};
  });

  it('Sync now calls syncFolder, toasts and schedules the reloads on 202', () => {
    kbSources.syncFolder.and.returnValue(of({ success: true }));
    page.onMs365SyncNow(folder);
    expect(kbSources.syncFolder).toHaveBeenCalledWith('f1');
    expect(page.scheduleMs365Reloads).toHaveBeenCalled();
    expect(notify.showWidgetStyleUpdateNotification.calls.mostRecent().args).toEqual(['KbPage.Ms365SyncStarted', 2, 'done']);
  });

  it('409 sync_running toasts "already syncing" and does not schedule reloads', () => {
    kbSources.syncFolder.and.returnValue(throwError({ status: 409, error: { error: 'sync_running' } }));
    page.onMs365SyncNow(folder);
    expect(page.scheduleMs365Reloads).not.toHaveBeenCalled();
    expect(notify.showWidgetStyleUpdateNotification.calls.mostRecent().args[0]).toBe('KbPage.Ms365AlreadySyncing');
  });

  it('other sync errors toast a failure', () => {
    kbSources.syncFolder.and.returnValue(throwError({ status: 500, error: {} }));
    page.onMs365SyncNow(folder);
    expect(notify.showWidgetStyleUpdateNotification.calls.mostRecent().args[0]).toBe('KbPage.Ms365SyncFailed');
  });

  it('after a reconnect a 409 sync_running is silent and the accounts are reloaded', () => {
    kbSources.getConnections.and.returnValue(of([]));
    kbSources.syncFolder.and.returnValue(throwError({ status: 409, error: { error: 'sync_running' } }));
    page.onMs365Reconnected(folder);
    expect(kbSources.syncFolder).toHaveBeenCalledWith('f1');
    expect(kbSources.getConnections).toHaveBeenCalled();
    expect(notify.showWidgetStyleUpdateNotification).not.toHaveBeenCalled();
  });

  it('accounts load once for lists with a folder and map connection_id to "name — upn"', () => {
    page.ms365Accounts = {};
    kbSources.getConnections.and.returnValue(of([{ _id: 'c1', account: { display_name: 'Ann', upn: 'ann@x.com' } }]));
    page.loadMs365Accounts();
    page.loadMs365Accounts();
    expect(kbSources.getConnections).toHaveBeenCalledTimes(1);
    expect(page.ms365Accounts).toEqual({ c1: 'Ann — ann@x.com' });
  });

  it('no folder in the list: connections are not requested; a 403 shows nothing and no toast', () => {
    page.ms365Accounts = {};
    page.kbsList = [child];
    page.loadMs365Accounts();
    expect(kbSources.getConnections).not.toHaveBeenCalled();
    page.kbsList = [folder];
    kbSources.getConnections.and.returnValue(throwError({ status: 403 }));
    page.loadMs365Accounts();
    expect(page.ms365Accounts).toEqual({});
    expect(notify.showWidgetStyleUpdateNotification).not.toHaveBeenCalled();
  });

  it('a folder delete uses the cascade Swal with the Microsoft 365 text; a child uses Ms365DeleteChild', () => {
    page.presentDialogComfimDeleteSitemap = jasmine.createSpy('swal');
    page.dialog = { open: jasmine.createSpy('open') };
    page.onOpenBaseModalDelete({ ...folder });
    expect(page.presentDialogComfimDeleteSitemap.calls.mostRecent().args[1]).toBe('KbPage.Ms365DeleteFolder');
    page.onOpenBaseModalDelete({ ...child });
    expect(page.presentDialogComfimDeleteSitemap.calls.mostRecent().args[1]).toBe('KbPage.Ms365DeleteChild');
    expect(page.dialog.open).not.toHaveBeenCalled();
  });

  it('409 remove_failed / sync_running on delete toasts an error and leaves the list unchanged', () => {
    const swal = spyOn(Swal, 'fire');
    for (const [code, key] of [['remove_failed', 'KbPage.Ms365DeleteRemoveFailed'], ['sync_running', 'KbPage.Ms365DeleteSyncRunning']]) {
      kbService.deleteKb.and.returnValue(throwError({ status: 409, error: { error: code, failed: 1, removed: 0 } }));
      const kb = { ...child };
      page.onDeleteKb(kb);
      expect(notify.showWidgetStyleUpdateNotification.calls.mostRecent().args).toEqual([key, 4, 'report_problem']);
      expect(page.kbsList.length).toBe(2);
      expect(kb['deleting']).toBe(false);
    }
    expect(swal).not.toHaveBeenCalled();
  });

  it('409 remove_failed on a folder with removed > 0 toasts both counts and reloads the list', () => {
    const swal = spyOn(Swal, 'fire');
    kbService.deleteKb.and.returnValue(throwError({ status: 409, error: { error: 'remove_failed', failed: 2, removed: 5 } }));
    page.translate = { instant: (k: string, p?: any) => k + JSON.stringify(p || {}) };
    page.onDeleteKb({ ...folder });
    expect(notify.showWidgetStyleUpdateNotification.calls.mostRecent().args)
      .toEqual(['KbPage.Ms365DeleteRemovePartial{"failed":2,"removed":5}', 4, 'report_problem']);
    expect(page.scheduleMs365Reloads).toHaveBeenCalled();
    expect(swal).not.toHaveBeenCalled();
  });

  it('after the import modal closes (any result) the connections section reloads', () => {
    page.dialog = { open: () => ({ afterClosed: () => of(undefined) }) };
    page.selectedNamespace = { id: 'n' };
    page.ms365Connections = { load: jasmine.createSpy('load') };
    page.presentModalImportMs365();
    expect(page.ms365Connections.load).toHaveBeenCalled();
    expect(page.scheduleMs365Reloads).not.toHaveBeenCalled();
    page.dialog = { open: () => ({ afterClosed: () => of({ contents: [{}] }) }) };
    page.presentModalImportMs365();
    expect(page.ms365Connections.load).toHaveBeenCalledTimes(2);
    expect(page.scheduleMs365Reloads).toHaveBeenCalled();
  });

  it('connections changed: accounts reload; the KB list only after a cascade', () => {
    page.loadMs365Accounts = jasmine.createSpy('loadMs365Accounts');
    page.onMs365ConnectionsChanged({ cascade: false });
    expect(page.loadMs365Accounts).toHaveBeenCalledWith(true);
    expect(page.scheduleMs365Reloads).not.toHaveBeenCalled();
    page.onMs365ConnectionsChanged({ cascade: true });
    expect(page.scheduleMs365Reloads).toHaveBeenCalled();
  });
});
