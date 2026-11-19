import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgSelectModule, NgSelectComponent } from '@ng-select/ng-select';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';

import { KnowledgeBaseTableComponent } from './knowledge-base-table.component';
import { LoggerService } from 'app/services/logger/logger.service';
import { BrandService } from 'app/services/brand.service';
import { RolesService } from 'app/services/roles.service';
import { NotifyService } from 'app/core/notify.service';
import { KbSourcesService } from 'app/services/kb-sources.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';

@Pipe({ name: 'amTimeAgo' })
class AmTimeAgoStubPipe implements PipeTransform { transform(v: any) { return 'ago:' + v; } }

const folder = {
  _id: 'f1', type: 'ms365_folder', name: '/Sales/Docs', status: 0, refresh_rate: 'weekly', last_refresh: '2026-11-10',
  external: { provider: 'microsoft365', connection_id: 'c1', site_name: 'Team Site', path: '/Sales/Docs',
    sync: { state: 'idle', counts: { files: 12 } } },
};
const child = {
  _id: 'k1', type: 'pdf', name: 'a.pdf', status: 300, refresh_rate: 'never', source_origin_id: 'f1', source_origin: '/Sales/Docs',
  external: { provider: 'microsoft365', connection_id: 'c1' },
};

describe('KnowledgeBaseTableComponent (Microsoft 365 rows)', () => {
  let fixture: ComponentFixture<KnowledgeBaseTableComponent>;
  let component: KnowledgeBaseTableComponent;
  let notify: jasmine.SpyObj<NotifyService>;
  let kbSources: jasmine.SpyObj<KbSourcesService>;

  function setup(list: any[]) {
    notify = jasmine.createSpyObj('NotifyService', ['presentDialogNoPermissionToPermomfAction', 'showWidgetStyleUpdateNotification']);
    kbSources = jasmine.createSpyObj('KbSourcesService', ['connect']);
    TestBed.configureTestingModule({
      declarations: [KnowledgeBaseTableComponent, AmTimeAgoStubPipe],
      imports: [FormsModule, NgSelectModule, NoopAnimationsModule, MatMenuModule, MatTooltipModule, TranslateModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: LoggerService, useValue: { log: () => {}, error: () => {}, warn: () => {} } },
        { provide: BrandService, useValue: { getBrand: () => ({ DOCS: false, BRAND_NAME: 'x' }) } },
        { provide: RolesService, useValue: { listenToProjectUserPermissions: () => {}, getUpdateRequestPermission: () => new Subject() } },
        { provide: NotifyService, useValue: notify },
        { provide: KbSourcesService, useValue: kbSources },
        { provide: LiveAnnouncer, useValue: {} },
      ],
    });
    TestBed.overrideComponent(KnowledgeBaseTableComponent, { set: { changeDetection: 1 as any } });
    fixture = TestBed.createComponent(KnowledgeBaseTableComponent);
    component = fixture.componentInstance;
    component.kbsList = list as any;
    component.kbsListCount = list.length;
    component.getKbCompleted = true;
    component.showKBTableSpinner = false;
    component.PERMISSION_TO_REINDEX_CONTENT = true;
    component.PERMISSION_TO_UPDATE_CONTENT = true;
    component.SHOW_TABLE = true;
    fixture.detectChanges();
  }
  const text = () => fixture.nativeElement.textContent;
  const q = (sel: string) => fixture.nativeElement.querySelector(sel);

  it('a folder row renders the chip, path, site and file count', () => {
    setup([folder]);
    expect(text()).toContain('KbPage.Ms365Card');
    expect(q('.ms365-chip .source-chip-icon').textContent).toContain('cloud_sync');
    expect(text()).toContain('/Sales/Docs');
    expect(text()).toContain('Team Site');
    expect(q('.ms365-file-count').textContent).toContain('KbPage.Ms365FilesCount');
    expect(text()).toContain('ago:2026-11-10');
    expect(q('.ms365-warning')).toBeNull();
  });

  it('needs_reconnect renders the warning and a Reconnect button', () => {
    setup([{ ...folder, last_error: { code: 'needs_reconnect', message: 'm', at: 'x' } }]);
    expect(q('.ms365-warning-chip').textContent).toContain('KbPage.Ms365NeedsReconnect');
    expect(q('.ms365-reconnect-btn')).not.toBeNull();
  });

  it('other codes warn without a Reconnect button', () => {
    setup([{ ...folder, last_error: { code: 'folder_not_found' } }]);
    expect(q('.ms365-warning-chip').textContent).toContain('KbPage.Ms365WarnFolderNotFound');
    expect(q('.ms365-reconnect-btn')).toBeNull();
  });

  it('syncing folders show the Syncing label', () => {
    setup([{ ...folder, external: { ...folder.external, sync: { state: 'syncing', counts: { files: 0 } } } }]);
    expect(q('.ms365-syncing').textContent).toContain('KbPage.Ms365Syncing');
  });

  it('a child row renders the origin pill and has no Re-index entry', () => {
    setup([child]);
    expect(q('.ms365-origin-pill').textContent).toContain('KbPage.Ms365Card');
    expect(q('.ms365-origin').textContent).toContain('/Sales/Docs');
    expect(text()).not.toContain('KbPage.ReIndex');
  });

  it('a child with no source (failed add) renders without errors', () => {
    const noSource = { ...child, source: undefined, content: undefined, status: 400 };
    expect(() => setup([noSource])).not.toThrow();
    expect(text()).toContain('a.pdf');
  });

  it('Sync now (row menu action) emits ms365SyncNow with the folder', () => {
    setup([folder]);
    const spy = jasmine.createSpy('sync');
    component.ms365SyncNow.subscribe(spy);
    component.onMs365SyncNow(folder);
    expect(spy).toHaveBeenCalledWith(folder);
  });

  it('Sync now without permission does not emit', () => {
    setup([folder]);
    component.PERMISSION_TO_REINDEX_CONTENT = false;
    const spy = jasmine.createSpy('sync');
    component.ms365SyncNow.subscribe(spy);
    component.onMs365SyncNow(folder);
    expect(spy).not.toHaveBeenCalled();
    expect(notify.presentDialogNoPermissionToPermomfAction).toHaveBeenCalled();
  });

  it('the folder row shows the account; a missing mapping renders fine', () => {
    setup([folder]);
    component.ms365Accounts = { c1: 'Ann Lee — ann@x.com' };
    fixture.detectChanges();
    expect(q('.ms365-account').textContent).toContain('Ann Lee — ann@x.com');
    component.ms365Accounts = {};
    fixture.detectChanges();
    expect(q('.ms365-account')).toBeNull();
    expect(text()).toContain('Team Site');
  });

  it('the Microsoft 365 pill needs external.provider: a url row with source_origin gets none', () => {
    setup([{ _id: 'u1', type: 'url', name: 'u', source: 'http://x', source_origin: 'http://x/sitemap.xml' }]);
    expect(q('.ms365-origin-pill')).toBeNull();
    expect(q('.ms365-origin')).toBeNull();
  });

  it('Reconnect calls connect(connectionId) from the click and then reports it', fakeAsync(() => {
    setup([folder]);
    kbSources.connect.and.returnValue(Promise.resolve({ status: 'connected', connection_id: 'c1' }));
    const spy = jasmine.createSpy('sync');
    component.ms365Reconnected.subscribe(spy);
    const ev = jasmine.createSpyObj('ev', ['stopPropagation']);
    component.onMs365Reconnect(folder, ev);
    expect(kbSources.connect).toHaveBeenCalledWith('microsoft365', 'c1');
    expect(ev.stopPropagation).toHaveBeenCalled();
    flush();
    expect(spy).toHaveBeenCalledWith(folder);
  }));

  it('Reconnect blocked/closed shows the open-sign-in-again message', fakeAsync(() => {
    setup([folder]);
    kbSources.connect.and.returnValue(Promise.resolve({ status: 'blocked' }));
    component.onMs365Reconnect(folder);
    flush();
    expect(notify.showWidgetStyleUpdateNotification.calls.mostRecent().args[0]).toBe('KbPage.Ms365OpenAgain');
  }));

  it('Reconnect that rejects shows a generic error toast', fakeAsync(() => {
    setup([folder]);
    kbSources.connect.and.returnValue(Promise.reject(new Error('x')));
    component.onMs365Reconnect(folder);
    flush();
    expect(notify.showWidgetStyleUpdateNotification.calls.mostRecent().args[0]).toBe('KbPage.Ms365ErrConnect');
  }));

  it('Reconnect failure shows an error toast and does not sync', fakeAsync(() => {
    setup([folder]);
    kbSources.connect.and.returnValue(Promise.resolve({ status: 'error', reason: 'access_denied' }));
    const spy = jasmine.createSpy('sync');
    component.ms365Reconnected.subscribe(spy);
    component.onMs365Reconnect(folder);
    flush();
    expect(spy).not.toHaveBeenCalled();
    expect(notify.showWidgetStyleUpdateNotification).toHaveBeenCalled();
  }));

  describe('Google Drive rows', () => {
    const gFolder = {
      _id: 'g1', type: 'gdrive_folder', name: 'My Drive/Docs', status: 0, refresh_rate: 'weekly', last_refresh: '2026-11-10',
      external: { provider: 'googledrive', connection_id: 'c2', path: 'My Drive/Docs', sync: { state: 'idle', counts: { files: 3 } } },
    };
    const gChild = {
      _id: 'k2', type: 'pdf', name: 'b.pdf', status: 300, refresh_rate: 'never', source_origin_id: 'g1', source_origin: 'My Drive/Docs',
      external: { provider: 'googledrive', connection_id: 'c2' },
    };

    it('a gdrive_folder row renders the Drive chip and the Syncing label like a Microsoft one', () => {
      setup([gFolder]);
      expect(q('.ms365-chip').textContent).toContain('KbPage.GdriveCard');
      expect(q('.ms365-chip .source-chip-icon').textContent).toContain('add_to_drive');
      expect(q('.ms365-file-count').textContent).toContain('KbPage.Ms365FilesCount');
      expect(q('.status-icon')).not.toBeNull();
    });

    it('Reconnect on a gdrive_folder connects with googledrive', fakeAsync(() => {
      setup([{ ...gFolder, last_error: { code: 'needs_reconnect' } }]);
      kbSources.connect.and.returnValue(Promise.resolve({ status: 'connected', connection_id: 'c2' }));
      const spy = jasmine.createSpy('sync');
      component.ms365Reconnected.subscribe(spy);
      (q('.ms365-reconnect-btn') as HTMLElement).click();
      expect(kbSources.connect).toHaveBeenCalledWith('googledrive', 'c2');
      flush();
      expect(spy).toHaveBeenCalled();
    }));

    it('a Google child renders the Drive origin pill', () => {
      setup([gChild]);
      expect(q('.ms365-origin-pill').textContent).toContain('KbPage.GdriveCard');
      expect(q('.ms365-origin').textContent).toContain('My Drive/Docs');
    });

    it('the row menu has Sync now and Delete, and no check-status entry', async () => {
      setup([gFolder]);
      const trigger = fixture.nativeElement.querySelector('[aria-haspopup="menu"]') as HTMLElement;
      trigger.click();
      fixture.detectChanges();
      await fixture.whenStable();
      const menu = document.querySelector('.mat-menu-panel, .mat-mdc-menu-panel');
      expect(menu.querySelector('.ms365-sync-now')).not.toBeNull();
      expect(menu.textContent).toContain('delete');
      expect(menu.textContent).not.toContain('KbPage.RunCheckStatus');
    });

    it('the type filter offers gdrive_folder', () => {
      setup([gFolder]);
      const typeSelect = fixture.debugElement.queryAll(By.directive(NgSelectComponent))
        .map(d => d.componentInstance as NgSelectComponent)
        .find(c => c.itemsList.items.some(i => i.value === 'url'));
      const values = typeSelect.itemsList.items.map(i => i.value);
      expect(values).toContain('ms365_folder');
      expect(values).toContain('gdrive_folder');
    });
  });
});
