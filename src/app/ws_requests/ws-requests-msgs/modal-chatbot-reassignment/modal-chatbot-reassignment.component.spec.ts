import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalChatbotReassignmentComponent } from './modal-chatbot-reassignment.component';

describe('ModalChatbotReassignmentComponent', () => {
  let component: ModalChatbotReassignmentComponent;
  let fixture: ComponentFixture<ModalChatbotReassignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalChatbotReassignmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalChatbotReassignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
