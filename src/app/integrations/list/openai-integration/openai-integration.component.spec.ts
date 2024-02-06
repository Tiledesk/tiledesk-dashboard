import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenaiIntegrationComponent } from './openai-integration.component';

describe('OpenaiIntegrationComponent', () => {
  let component: OpenaiIntegrationComponent;
  let fixture: ComponentFixture<OpenaiIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpenaiIntegrationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenaiIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
