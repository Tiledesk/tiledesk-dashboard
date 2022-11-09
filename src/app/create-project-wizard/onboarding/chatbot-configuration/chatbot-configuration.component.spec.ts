import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatbotConfigurationComponent } from './chatbot-configuration.component';

describe('ChatbotConfigurationComponent', () => {
  let component: ChatbotConfigurationComponent;
  let fixture: ComponentFixture<ChatbotConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatbotConfigurationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatbotConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
