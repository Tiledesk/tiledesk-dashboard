import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAddContentComponent } from './modal-add-content.component';

describe('ModalAddContentComponent', () => {
  let component: ModalAddContentComponent;
  let fixture: ComponentFixture<ModalAddContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalAddContentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalAddContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
