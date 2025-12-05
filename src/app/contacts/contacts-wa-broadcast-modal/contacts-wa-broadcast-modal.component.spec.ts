import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactsWaBroadcastModalComponent } from './contacts-wa-broadcast-modal.component';

describe('ContactsWaBroadcastModalComponent', () => {
  let component: ContactsWaBroadcastModalComponent;
  let fixture: ComponentFixture<ContactsWaBroadcastModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContactsWaBroadcastModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactsWaBroadcastModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
