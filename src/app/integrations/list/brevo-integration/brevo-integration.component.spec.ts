import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrevoIntegrationComponent } from './brevo-integration.component';

describe('BrevoIntegrationComponent', () => {
  let component: BrevoIntegrationComponent;
  let fixture: ComponentFixture<BrevoIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrevoIntegrationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrevoIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
