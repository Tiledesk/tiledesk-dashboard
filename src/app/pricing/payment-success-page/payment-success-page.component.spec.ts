import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentSuccessPageComponent } from './payment-success-page.component';

describe('PaymentSuccessPageComponent', () => {
  let component: PaymentSuccessPageComponent;
  let fixture: ComponentFixture<PaymentSuccessPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentSuccessPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentSuccessPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
