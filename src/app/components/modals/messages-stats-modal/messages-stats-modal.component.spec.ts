import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessagesStatsModalComponent } from './messages-stats-modal.component';

describe('ChatbotStatsModalComponent', () => {
  let component: MessagesStatsModalComponent;
  let fixture: ComponentFixture<MessagesStatsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MessagesStatsModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessagesStatsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
