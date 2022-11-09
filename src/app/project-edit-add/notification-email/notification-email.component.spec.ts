import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationEmailComponent } from './notification-email.component';

describe('NotificationEmailComponent', () => {
  let component: NotificationEmailComponent;
  let fixture: ComponentFixture<NotificationEmailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationEmailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
