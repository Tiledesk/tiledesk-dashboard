import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DestroyDialogComponent } from './destroy-dialog.component';
import * as enJson from '../../../../assets/i18n/en.json';

const EN = (enJson as any).default || enJson;
const EXEC_ID = '0193a2f4-0000-7000-8000-000000000001';

describe('DestroyDialogComponent', () => {
  let fixture: ComponentFixture<DestroyDialogComponent>;
  let ref: { close: jasmine.Spy };

  function setup() {
    ref = { close: jasmine.createSpy('close') };
    TestBed.configureTestingModule({
      declarations: [DestroyDialogComponent],
      imports: [TranslateModule.forRoot(), FormsModule, MatDialogModule],
      providers: [
        { provide: MatDialogRef, useValue: ref },
        { provide: MAT_DIALOG_DATA, useValue: { executionId: EXEC_ID } },
      ],
    });
    const t = TestBed.inject(TranslateService);
    t.setTranslation('en', EN);
    t.use('en');
    fixture = TestBed.createComponent(DestroyDialogComponent);
    fixture.detectChanges();
    tick();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const confirmBtn = () => el().querySelector('.dd-confirm') as HTMLButtonElement;
  function type(v: string) {
    const input = el().querySelector('.dd-input') as HTMLInputElement;
    input.value = v;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  }

  it('destroy button disabled until the 6 chars match', fakeAsync(() => {
    setup();
    const t = el().textContent.replace(/\s+/g, ' ');
    expect(t).toContain('This stops it, closes its conversation and removes its live state. It cannot be resumed. The trace and audit are kept.');
    expect(t).toContain('Type 000001 to confirm');
    expect(confirmBtn().disabled).toBe(true);
    type('00000');
    expect(confirmBtn().disabled).toBe(true);
    type('00000A');
    expect(confirmBtn().disabled).toBe(true);
    type('0000001');
    expect(confirmBtn().disabled).toBe(true);
    type('000001');
    expect(confirmBtn().disabled).toBe(false);
    confirmBtn().click();
    expect(ref.close).toHaveBeenCalledWith('000001');
  }));

  it('cancel returns null', fakeAsync(() => {
    setup();
    (el().querySelector('.dd-cancel') as HTMLButtonElement).click();
    expect(ref.close).toHaveBeenCalledWith(null);
  }));
});
