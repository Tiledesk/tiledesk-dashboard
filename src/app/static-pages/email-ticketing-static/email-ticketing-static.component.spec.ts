import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailTicketingStaticComponent } from './email-ticketing-static.component';

describe('EmailTicketingStaticComponent', () => {
  let component: EmailTicketingStaticComponent;
  let fixture: ComponentFixture<EmailTicketingStaticComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmailTicketingStaticComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailTicketingStaticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
