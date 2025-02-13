import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnthropicIntegrationComponent } from './anthropic-integration.component';

describe('AnthropicIntegrationComponent', () => {
  let component: AnthropicIntegrationComponent;
  let fixture: ComponentFixture<AnthropicIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnthropicIntegrationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnthropicIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
