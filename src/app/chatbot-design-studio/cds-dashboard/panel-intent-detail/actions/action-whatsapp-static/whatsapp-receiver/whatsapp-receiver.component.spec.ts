import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappReceiverComponent } from './whatsapp-receiver.component';

describe('WhatsappReceiverComponent', () => {
  let component: WhatsappReceiverComponent;
  let fixture: ComponentFixture<WhatsappReceiverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WhatsappReceiverComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhatsappReceiverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
