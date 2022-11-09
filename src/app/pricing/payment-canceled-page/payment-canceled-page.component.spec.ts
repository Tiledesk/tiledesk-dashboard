import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentCanceledPageComponent } from './payment-canceled-page.component';

describe('PaymentCanceledPageComponent', () => {
  let component: PaymentCanceledPageComponent;
  let fixture: ComponentFixture<PaymentCanceledPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentCanceledPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentCanceledPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
