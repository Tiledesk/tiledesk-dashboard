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
    kbSources = jasmine.createSpyObj('kbSources', ['syncFolder']);
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
});
