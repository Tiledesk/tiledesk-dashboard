import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeInviteTeammateErrorModalComponent } from './home-invite-teammate-error-modal.component';

describe('HomeInviteTeammateErrorModalComponent', () => {
  let component: HomeInviteTeammateErrorModalComponent;
  let fixture: ComponentFixture<HomeInviteTeammateErrorModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeInviteTeammateErrorModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeInviteTeammateErrorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
