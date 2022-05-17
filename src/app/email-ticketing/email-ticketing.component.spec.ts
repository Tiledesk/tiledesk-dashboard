import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailTicketingComponent } from './email-ticketing.component';

describe('EmailTicketingComponent', () => {
  let component: EmailTicketingComponent;
  let fixture: ComponentFixture<EmailTicketingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailTicketingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailTicketingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
