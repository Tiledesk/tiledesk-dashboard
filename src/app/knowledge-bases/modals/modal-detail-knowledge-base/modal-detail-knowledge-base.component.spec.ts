import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { OverlayModule } from '@angular/cdk/overlay';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { ModalDetailKnowledgeBaseComponent } from './modal-detail-knowledge-base.component';
import { LoggerService } from 'app/services/logger/logger.service';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { BrandService } from 'app/services/brand.service';
import { KbSourcesService } from 'app/services/kb-sources.service';
import { NotifyService } from 'app/core/notify.service';

@Pipe({ name: 'selectOptionsTranslate' })
class SelectOptionsStubPipe implements PipeTransform { transform(v: any) { return v; } }

const folder: any = {
  _id: 'f1', type: 'ms365_folder', name: '/Sales/Docs', status: 0, refresh_rate: 'weekly', id_project: 'p', namespace: 'n',
  external: { provider: 'microsoft365', connection_id: 'c1', site_name: 'Team Site', sync: { state: 'idle', counts: { files: 12 } } },
};
const child: any = {
  _id: 'k1', type: 'pdf', name: 'a.pdf', status: 300, id_project: 'p', namespace: 'n', source_origin_id: 'f1',
  external: { provider: 'microsoft365', connection_id: 'c1' },
};

describe('ModalDetailKnowledgeBaseComponent (Microsoft 365)', () => {
  let fixture: ComponentFixture<ModalDetailKnowledgeBaseComponent>;
  let component: ModalDetailKnowledgeBaseComponent;
  let kbSources: jasmine.SpyObj<KbSourcesService>;
  let kbService: jasmine.SpyObj<KnowledgeBaseService>;
  let notify: jasmine.SpyObj<NotifyService>;
  let dialogRef: { close: jasmine.Spy };

  function setup(kb: any, extra: any = {}) {
    kbSources = jasmine.createSpyObj('KbSourcesService', ['updateFolderRefreshRate']);
    kbService = jasmine.createSpyObj('KnowledgeBaseService', ['getContentChuncks', 'updateKbContent']);
    kbService.getContentChuncks.and.returnValue(of({ matches: [] }));
    notify = jasmine.createSpyObj('NotifyService', ['showWidgetStyleUpdateNotification']);
    dialogRef = { close: jasmine.createSpy('close') };
    TestBed.configureTestingModule({
      declarations: [ModalDetailKnowledgeBaseComponent, SelectOptionsStubPipe],
      imports: [FormsModule, OverlayModule, NoopAnimationsModule, NgSelectModule, TranslateModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { kb: { ...kb }, refreshRateIsEnabled: true, isAvailableRefreshRateFeature: true, payIsVisible: true, ...extra } },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MatDialog, useValue: {} },
        { provide: LoggerService, useValue: { log: () => {}, error: () => {}, warn: () => {} } },
        { provide: KnowledgeBaseService, useValue: kbService },
        { provide: BrandService, useValue: { getBrand: () => ({ DOCS: false }) } },
        { provide: KbSourcesService, useValue: kbSources },
        { provide: NotifyService, useValue: notify },
      ],
    });
    fixture = TestBed.createComponent(ModalDetailKnowledgeBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }
  const q = (sel: string) => fixture.nativeElement.querySelector(sel);

  it('a folder shows the refresh-rate select and file count, and loads no chunks', () => {
    setup(folder);
    expect(q('.ms365-refresh-select')).not.toBeNull();
    expect(q('.ms365-count').textContent).toContain('KbPage.Ms365FilesCount');
    expect(kbService.getContentChuncks).not.toHaveBeenCalled();
    expect(q('.ms365-save-btn')).not.toBeNull();
  });

  it('saving a folder rate calls updateFolderRefreshRate and never updateKb / PUT', () => {
    setup(folder);
    kbSources.updateFolderRefreshRate.and.returnValue(of({ ...folder, refresh_rate: 'daily' }));
    component.onSelectRefreshRate('daily');
    component.onSaveMs365FolderRefreshRate();
    expect(kbSources.updateFolderRefreshRate).toHaveBeenCalledWith('f1', 'daily');
    expect(kbService.updateKbContent).not.toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledWith(jasmine.objectContaining({ method: 'ms365-refresh-saved' }));
    expect(notify.showWidgetStyleUpdateNotification.calls.mostRecent().args[1]).toBe(2);
  });

  it('schedule_pending shows a warning toast', () => {
    setup(folder);
    kbSources.updateFolderRefreshRate.and.returnValue(of({ ...folder, schedule_pending: true, last_error: { code: 'schedule_failed' } }));
    component.onSaveMs365FolderRefreshRate();
    expect(notify.showWidgetStyleUpdateNotification.calls.mostRecent().args[1]).toBe(3);
  });

  it('a failed save keeps the dialog open and shows an error toast', () => {
    setup(folder);
    kbSources.updateFolderRefreshRate.and.returnValue(throwError({ status: 400, error: { error: 'refresh_not_available' } }));
    component.onSaveMs365FolderRefreshRate();
    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(notify.showWidgetStyleUpdateNotification.calls.mostRecent().args[1]).toBe(4);
  });

  it('a refresh-rate change is restored on the row after a failed PATCH', () => {
    const row = { ...folder, refresh_rate: 'weekly' };
    setup(row);
    kbSources.updateFolderRefreshRate.and.returnValue(throwError({ status: 500, error: {} }));
    component.onSelectRefreshRate('daily');
    expect(component.kb.refresh_rate).toBe('daily');
    component.onSaveMs365FolderRefreshRate();
    expect(component.kb.refresh_rate).toBe('weekly');
    expect(component.selectedRefreshRate).toBe('weekly');
  });

  it('a refresh-rate change is restored when the dialog closes without saving', () => {
    const row = { ...folder, refresh_rate: 'weekly' };
    setup(row);
    component.onSelectRefreshRate('daily');
    component.onCloseBaseModal();
    expect(component.kb.refresh_rate).toBe('weekly');
    component.onSelectRefreshRate('monthly');
    fixture.destroy();
    expect(component.kb.refresh_rate).toBe('weekly');
  });

  it('a saved refresh-rate change survives the dialog closing', () => {
    const row = { ...folder, refresh_rate: 'weekly' };
    setup(row);
    kbSources.updateFolderRefreshRate.and.returnValue(of({}));
    component.onSelectRefreshRate('daily');
    component.onSaveMs365FolderRefreshRate();
    fixture.destroy();
    expect(component.kb.refresh_rate).toBe('daily');
  });

  it('onUpdateKnowledgeBase never closes with an update for a Microsoft 365 folder', () => {
    setup(folder);
    component.onUpdateKnowledgeBase();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('onUpdateKnowledgeBase never closes with an update for a Microsoft 365 file', () => {
    setup(child);
    component.onUpdateKnowledgeBase();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('a child keeps the read-only file view (no refresh select, name disabled)', async () => {
    setup(child);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(q('.ms365-refresh-select')).toBeNull();
    expect(component.isImportedFileDetailReadonly).toBe(true);
    expect(q('input[name="name"]').disabled).toBe(true);
  });

  it('a child with no source renders without errors', async () => {
    expect(() => setup({ ...child, status: 400, source: undefined })).not.toThrow();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(q('input[name="name"]').value).toBe('a.pdf');
  });

  it('a Google folder shows the refresh-rate select, provider label and loads no chunks', () => {
    setup({ ...folder, type: 'gdrive_folder', external: { provider: 'googledrive', connection_id: 'c2', sync: { state: 'idle', counts: { files: 2 } } } });
    expect(q('.ms365-refresh-select')).not.toBeNull();
    expect(q('.ms365-provider').textContent).toContain('KbPage.GdriveCard');
    expect(q('.ms365-provider').textContent).toContain('add_to_drive');
    expect(kbService.getContentChuncks).not.toHaveBeenCalled();
    expect(q('.ms365-save-btn')).not.toBeNull();
  });

  it('a Google child keeps the read-only file view like a Microsoft one', async () => {
    setup({ ...child, external: { provider: 'googledrive', connection_id: 'c2' } });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(q('.ms365-refresh-select')).toBeNull();
    expect(component.isImportedFileDetailReadonly).toBe(true);
    expect(q('input[name="name"]').disabled).toBe(true);
  });
});
