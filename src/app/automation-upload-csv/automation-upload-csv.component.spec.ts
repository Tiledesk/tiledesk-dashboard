import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomationUploadCsvComponent } from './automation-upload-csv.component';

describe('AutomationUploadCsvComponent', () => {
  let component: AutomationUploadCsvComponent;
  let fixture: ComponentFixture<AutomationUploadCsvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutomationUploadCsvComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutomationUploadCsvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
