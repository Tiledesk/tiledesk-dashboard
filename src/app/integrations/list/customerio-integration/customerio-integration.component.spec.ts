import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerioIntegrationComponent } from './customerio-integration.component';

describe('CustomerioIntegrationComponent', () => {
  let component: CustomerioIntegrationComponent;
  let fixture: ComponentFixture<CustomerioIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerioIntegrationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerioIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
