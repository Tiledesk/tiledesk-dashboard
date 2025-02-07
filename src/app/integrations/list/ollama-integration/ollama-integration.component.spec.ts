import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OllamaIntegrationComponent } from './ollama-integration.component';

describe('OllamaIntegrationComponent', () => {
  let component: OllamaIntegrationComponent;
  let fixture: ComponentFixture<OllamaIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OllamaIntegrationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OllamaIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
