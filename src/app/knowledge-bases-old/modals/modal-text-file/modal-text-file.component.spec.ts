import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTextFileComponent } from './modal-text-file.component';

describe('ModalTextFileComponent', () => {
  let component: ModalTextFileComponent;
  let fixture: ComponentFixture<ModalTextFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalTextFileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalTextFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
