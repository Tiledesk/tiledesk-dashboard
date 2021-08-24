import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HandleInvitationComponent } from './handle-invitation.component';

describe('HandleInvitationComponent', () => {
  let component: HandleInvitationComponent;
  let fixture: ComponentFixture<HandleInvitationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HandleInvitationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HandleInvitationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
