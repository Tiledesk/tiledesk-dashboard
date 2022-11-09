import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PricingBaseComponent } from './pricing-base.component';

describe('PricingBaseComponent', () => {
  let component: PricingBaseComponent;
  let fixture: ComponentFixture<PricingBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PricingBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PricingBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
