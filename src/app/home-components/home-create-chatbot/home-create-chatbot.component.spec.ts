import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeCreateChatbotComponent } from './home-create-chatbot.component';

describe('HomeCreateChatbotComponent', () => {
  let component: HomeCreateChatbotComponent;
  let fixture: ComponentFixture<HomeCreateChatbotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeCreateChatbotComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeCreateChatbotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
