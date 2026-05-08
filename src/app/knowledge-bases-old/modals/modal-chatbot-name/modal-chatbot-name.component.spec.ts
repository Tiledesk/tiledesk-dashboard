import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalChatbotNameComponent } from './modal-chatbot-name.component';

describe('ModalChatbotNameComponent', () => {
  let component: ModalChatbotNameComponent;
  let fixture: ComponentFixture<ModalChatbotNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalChatbotNameComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalChatbotNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
