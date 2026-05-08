import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalNsLimitReachedComponent } from './modal-ns-limit-reached.component';

describe('ModalNsLimitReachedComponent', () => {
  let component: ModalNsLimitReachedComponent;
  let fixture: ComponentFixture<ModalNsLimitReachedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalNsLimitReachedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalNsLimitReachedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
