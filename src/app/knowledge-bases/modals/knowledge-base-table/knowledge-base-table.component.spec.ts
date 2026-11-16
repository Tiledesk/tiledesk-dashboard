import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgSelectModule } from '@ng-select/ng-select';
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
    TestBed.overrideComponent(KnowledgeBaseTableComponent, { set: { changeDetection: 0 as any } });
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
    expect(text()).toContain('Microsoft 365');
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

  it('Reconnect calls connect(connectionId) from the click and then syncs the folder', fakeAsync(() => {
    setup([folder]);
    kbSources.connect.and.returnValue(Promise.resolve({ status: 'connected', connection_id: 'c1' }));
    const spy = jasmine.createSpy('sync');
    component.ms365SyncNow.subscribe(spy);
    const ev = jasmine.createSpyObj('ev', ['stopPropagation']);
    component.onMs365Reconnect(folder, ev);
    expect(kbSources.connect).toHaveBeenCalledWith('c1');
    expect(ev.stopPropagation).toHaveBeenCalled();
    flush();
    expect(spy).toHaveBeenCalledWith(folder);
  }));

  it('Reconnect failure shows an error toast and does not sync', fakeAsync(() => {
    setup([folder]);
    kbSources.connect.and.returnValue(Promise.resolve({ status: 'error', reason: 'access_denied' }));
    const spy = jasmine.createSpy('sync');
    component.ms365SyncNow.subscribe(spy);
    component.onMs365Reconnect(folder);
    flush();
    expect(spy).not.toHaveBeenCalled();
    expect(notify.showWidgetStyleUpdateNotification).toHaveBeenCalled();
  }));
});
