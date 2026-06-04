import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenRouterIntegrationComponent } from './openrouter-integration.component';

describe('OpenRouterIntegrationComponent', () => {
  let component: OpenRouterIntegrationComponent;
  let fixture: ComponentFixture<OpenRouterIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpenRouterIntegrationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenRouterIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
