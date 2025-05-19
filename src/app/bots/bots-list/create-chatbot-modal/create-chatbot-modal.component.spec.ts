import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateChatbotModalComponent } from './create-chatbot-modal.component';

describe('CreateChatbotModalComponent', () => {
  let component: CreateChatbotModalComponent;
  let fixture: ComponentFixture<CreateChatbotModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateChatbotModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateChatbotModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
