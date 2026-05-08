import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPreviewSettingsComponent } from './modal-preview-settings.component';

describe('ModalPreviewSettingsComponent', () => {
  let component: ModalPreviewSettingsComponent;
  let fixture: ComponentFixture<ModalPreviewSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalPreviewSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalPreviewSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
