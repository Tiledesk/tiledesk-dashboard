import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFaqsComponent } from './modal-faqs.component';

describe('ModalFaqsComponent', () => {
  let component: ModalFaqsComponent;
  let fixture: ComponentFixture<ModalFaqsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalFaqsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalFaqsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
