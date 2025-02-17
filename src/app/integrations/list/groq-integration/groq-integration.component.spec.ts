import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroqIntegrationComponent } from './groq-integration.component';

describe('GroqIntegrationComponent', () => {
  let component: GroqIntegrationComponent;
  let fixture: ComponentFixture<GroqIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroqIntegrationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroqIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
