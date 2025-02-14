import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleIntegrationComponent } from './google-integration.component';

describe('GoogleIntegrationComponent', () => {
  let component: GoogleIntegrationComponent;
  let fixture: ComponentFixture<GoogleIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoogleIntegrationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoogleIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
