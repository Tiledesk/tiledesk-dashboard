import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnauthorizedForPricingComponent } from './unauthorized-for-pricing.component';

describe('UnauthorizedForPricingComponent', () => {
  let component: UnauthorizedForPricingComponent;
  let fixture: ComponentFixture<UnauthorizedForPricingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnauthorizedForPricingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnauthorizedForPricingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
