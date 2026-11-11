import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ResumeDialogComponent, ResumeDialogData } from './resume-dialog.component';
import * as enJson from '../../../../assets/i18n/en.json';

const EN = (enJson as any).default || enJson;

describe('ResumeDialogComponent', () => {
  let fixture: ComponentFixture<ResumeDialogComponent>;
  let ref: { close: jasmine.Spy };

  function setup(data: ResumeDialogData) {
    ref = { close: jasmine.createSpy('close') };
    TestBed.configureTestingModule({
      declarations: [ResumeDialogComponent],
      imports: [TranslateModule.forRoot(), MatDialogModule],
      providers: [
        { provide: MatDialogRef, useValue: ref },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    });
    const t = TestBed.inject(TranslateService);
    t.setTranslation('en', EN);
    t.use('en');
    fixture = TestBed.createComponent(ResumeDialogComponent);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const text = () => el().textContent.replace(/\s+/g, ' ');
  const click = (sel: string) => (el().querySelector(sel) as HTMLElement).click();

  afterEach(() => { if (fixture) fixture.destroy(); });

  it('resume dialog shows the action and asks confirm for calling actions', fakeAsync(() => {
    setup({ action: 'Call status API', calling: false, automation: false });
    expect(text()).toContain('Resume execution');
    expect(text()).toContain('Continues from "Call status API"');
    expect(el().querySelector('.rd-warning')).toBeNull();
    expect(el().querySelector('.rd-automation')).toBeNull();
    click('.rd-confirm');
    expect(ref.close).toHaveBeenCalledWith(true);
    fixture.destroy();

    TestBed.resetTestingModule();
    setup({ action: 'Call status API', calling: true, automation: false });
    const warning = el().querySelector('.rd-warning');
    expect(warning).not.toBeNull();
    expect(warning.getAttribute('role')).toBe('alert');
    expect(warning.textContent).toContain('This action calls an external system and may already have reached it. Run it again?');
    click('.rd-confirm');
    expect(ref.close).toHaveBeenCalledWith(true);
    ref.close.calls.reset();
    click('.rd-cancel');
    expect(ref.close).toHaveBeenCalledWith(null);
  }));

  it('without a known action it says where it stopped; automation runs warn about the original caller', fakeAsync(() => {
    setup({ action: null, calling: false, automation: true });
    expect(text()).toContain('Continues from where it stopped');
    expect(text()).not.toContain('Continues from "');
    expect(el().querySelector('.rd-automation').textContent).toContain("The original caller won't get the answer");
  }));

  it('renders the action title as text, never as HTML', fakeAsync(() => {
    setup({ action: '<img src=x onerror=alert(1)>', calling: true, automation: false });
    expect(el().querySelector('img')).toBeNull();
    expect(text()).toContain('<img src=x onerror=alert(1)>');
  }));
});
