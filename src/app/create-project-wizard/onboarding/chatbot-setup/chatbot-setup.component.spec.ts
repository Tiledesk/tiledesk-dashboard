import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatbotSetupComponent } from './chatbot-setup.component';

describe('ChatbotSetupComponent', () => {
  let component: ChatbotSetupComponent;
  let fixture: ComponentFixture<ChatbotSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatbotSetupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatbotSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
