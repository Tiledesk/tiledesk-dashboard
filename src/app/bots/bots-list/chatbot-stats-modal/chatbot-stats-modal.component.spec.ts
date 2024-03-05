import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatbotStatsModalComponent } from './chatbot-stats-modal.component';

describe('ChatbotStatsModalComponent', () => {
  let component: ChatbotStatsModalComponent;
  let fixture: ComponentFixture<ChatbotStatsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatbotStatsModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatbotStatsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
