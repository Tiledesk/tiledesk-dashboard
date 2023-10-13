import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatbotAlertComponent } from './chatbot-alert.component';

describe('ChatbotAlertComponent', () => {
  let component: ChatbotAlertComponent;
  let fixture: ComponentFixture<ChatbotAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatbotAlertComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatbotAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
