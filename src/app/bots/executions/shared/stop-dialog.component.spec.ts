import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StopDialogComponent, StopDialogData } from './stop-dialog.component';
import * as enJson from '../../../../assets/i18n/en.json';

const EN = (enJson as any).default || enJson;

describe('StopDialogComponent', () => {
  let fixture: ComponentFixture<StopDialogComponent>;
  let ref: { close: jasmine.Spy };

  function setup(data: StopDialogData) {
    ref = { close: jasmine.createSpy('close') };
    TestBed.configureTestingModule({
      declarations: [StopDialogComponent],
      imports: [TranslateModule.forRoot(), FormsModule, MatDialogModule, MatRadioModule],
      providers: [
        { provide: MatDialogRef, useValue: ref },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    });
    const t = TestBed.inject(TranslateService);
    t.setTranslation('en', EN);
    t.use('en');
    fixture = TestBed.createComponent(StopDialogComponent);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const text = () => el().textContent.replace(/\s+/g, ' ');
  const click = (sel: string) => (el().querySelector(sel) as HTMLElement).click();

  it('stop dialog returns soft/hard; hard text names the current action', fakeAsync(() => {
    setup({ action: 'GET status', hardOnly: false });
    expect(text()).toContain('Pause after the current action — finish it, then pause');
    expect(text()).toContain('Pause now — interrupt the current action');
    expect(el().querySelector('.sd-hard-text').textContent).toContain('"GET status"');
    // soft is the default
    click('.sd-confirm');
    expect(ref.close).toHaveBeenCalledWith('soft');

    ref.close.calls.reset();
    click('.sd-hard input[type=radio]');
    fixture.detectChanges();
    tick();
    click('.sd-confirm');
    expect(ref.close).toHaveBeenCalledWith('hard');

    ref.close.calls.reset();
    click('.sd-cancel');
    expect(ref.close).toHaveBeenCalledWith(null);
  }));

  it('hard text without a known action says "the current action"', fakeAsync(() => {
    setup({ action: null, hardOnly: false });
    expect(el().querySelector('.sd-hard-text').textContent.trim()).toBe('The current action is interrupted.');
  }));

  it('hard-only mode is a confirm of a hard stop', fakeAsync(() => {
    setup({ action: 'GET status', hardOnly: true });
    expect(el().querySelector('.sd-soft')).toBeNull();
    expect(el().querySelector('.sd-hard-text').textContent).toContain('"GET status"');
    click('.sd-confirm');
    expect(ref.close).toHaveBeenCalledWith('hard');
  }));
});
