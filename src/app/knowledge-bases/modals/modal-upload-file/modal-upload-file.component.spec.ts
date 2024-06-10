import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalUploadFileComponent } from './modal-upload-file.component';

describe('ModalUploadFileComponent', () => {
  let component: ModalUploadFileComponent;
  let fixture: ComponentFixture<ModalUploadFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalUploadFileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalUploadFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
