import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElevenlabsIntegrationComponent } from './elevenlabs-integration.component';

describe('DeepseekIntegrationComponent', () => {
  let component: ElevenlabsIntegrationComponent;
  let fixture: ComponentFixture<ElevenlabsIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ElevenlabsIntegrationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElevenlabsIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
