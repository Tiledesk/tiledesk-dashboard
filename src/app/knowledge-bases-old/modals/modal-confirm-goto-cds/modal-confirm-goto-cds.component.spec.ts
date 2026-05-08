import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalConfirmGotoCdsComponent } from './modal-confirm-goto-cds.component';

describe('ModalConfirmGotoCdsComponent', () => {
  let component: ModalConfirmGotoCdsComponent;
  let fixture: ComponentFixture<ModalConfirmGotoCdsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalConfirmGotoCdsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalConfirmGotoCdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
