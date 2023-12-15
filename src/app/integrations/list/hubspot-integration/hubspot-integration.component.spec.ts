import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HubspotIntegrationComponent } from './hubspot-integration.component';

describe('HubspotIntegrationComponent', () => {
  let component: HubspotIntegrationComponent;
  let fixture: ComponentFixture<HubspotIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HubspotIntegrationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HubspotIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
