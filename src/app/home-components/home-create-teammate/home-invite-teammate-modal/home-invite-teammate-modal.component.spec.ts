import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeInviteTeammateModalComponent } from './home-invite-teammate-modal.component';

describe('HomeInviteTeammateModalComponent', () => {
  let component: HomeInviteTeammateModalComponent;
  let fixture: ComponentFixture<HomeInviteTeammateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeInviteTeammateModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeInviteTeammateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
