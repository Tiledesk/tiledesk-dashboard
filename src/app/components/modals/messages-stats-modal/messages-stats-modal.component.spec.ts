import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesssagesStatsModalComponent } from './messages-stats-modal.component';

describe('ChatbotStatsModalComponent', () => {
  let component: MesssagesStatsModalComponent;
  let fixture: ComponentFixture<MesssagesStatsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MesssagesStatsModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MesssagesStatsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
