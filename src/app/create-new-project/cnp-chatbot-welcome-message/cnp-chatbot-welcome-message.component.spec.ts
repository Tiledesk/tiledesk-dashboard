import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CnpChatbotWelcomeMessageComponent } from './cnp-chatbot-welcome-message.component';

describe('CnpChatbotWelcomeMessageComponent', () => {
  let component: CnpChatbotWelcomeMessageComponent;
  let fixture: ComponentFixture<CnpChatbotWelcomeMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CnpChatbotWelcomeMessageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CnpChatbotWelcomeMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
