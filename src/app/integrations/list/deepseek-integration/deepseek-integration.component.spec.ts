import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeepseekIntegrationComponent } from './deepseek-integration.component';

describe('DeepseekIntegrationComponent', () => {
  let component: DeepseekIntegrationComponent;
  let fixture: ComponentFixture<DeepseekIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeepseekIntegrationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeepseekIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
