import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeCreateChatbotModalComponent } from './home-create-chatbot-modal.component';

describe('HomeCreateChatbotModalComponent', () => {
  let component: HomeCreateChatbotModalComponent;
  let fixture: ComponentFixture<HomeCreateChatbotModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeCreateChatbotModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeCreateChatbotModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
