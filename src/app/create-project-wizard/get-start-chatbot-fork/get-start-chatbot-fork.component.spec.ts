import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetStartChatbotForkComponent } from './get-start-chatbot-fork.component';

describe('GetStartChatbotForkComponent', () => {
  let component: GetStartChatbotForkComponent;
  let fixture: ComponentFixture<GetStartChatbotForkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GetStartChatbotForkComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetStartChatbotForkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
