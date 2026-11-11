import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ExecutionsModule } from '../executions.module';
import { DataAccessDialogComponent } from './data-access-dialog.component';
import { StopDialogComponent } from './stop-dialog.component';
import { ExecutionsService } from '../../../services/executions.service';
import { LoggerService } from '../../../services/logger/logger.service';

/** The dialogs use mat-button: the module must import MatButtonModule, or the buttons render unstyled and tiny. */
describe('ExecutionsModule dialog buttons', () => {
  function setup(data: any) {
    TestBed.configureTestingModule({
      imports: [ExecutionsModule, RouterTestingModule, NoopAnimationsModule, TranslateModule.forRoot()],
      providers: [
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: ExecutionsService, useValue: { requestDataAccess: () => of(null), revokeDataAccess: () => of(null) } },
        { provide: LoggerService, useValue: { log() {}, debug() {}, warn() {}, error() {} } },
      ],
    });
  }

  it('data access dialog buttons are Material buttons', fakeAsync(() => {
    setup({ projectId: 'p1', executionId: 'e1', stepSeq: null, blockName: null, retentionDays: 30 });
    const f = TestBed.createComponent(DataAccessDialogComponent);
    f.detectChanges();
    tick();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('.da-confirm').classList).toContain('mat-mdc-button');
    expect(el.querySelector('.da-cancel').classList).toContain('mat-mdc-button');
    f.destroy();
  }));

  it('stop dialog buttons are Material buttons (Phase 2 dialogs too)', fakeAsync(() => {
    setup({ action: null, hardOnly: false });
    const f = TestBed.createComponent(StopDialogComponent);
    f.detectChanges();
    tick();
    const buttons = Array.from((f.nativeElement as HTMLElement).querySelectorAll('button[mat-button]'));
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach(b => expect(b.classList).toContain('mat-mdc-button'));
    f.destroy();
  }));
});
