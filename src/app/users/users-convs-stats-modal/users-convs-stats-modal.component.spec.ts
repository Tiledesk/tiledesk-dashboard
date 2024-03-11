import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersConvsStatsModalComponent } from './users-convs-stats-modal.component';

describe('UsersConvsStatsModalComponent', () => {
  let component: UsersConvsStatsModalComponent;
  let fixture: ComponentFixture<UsersConvsStatsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsersConvsStatsModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersConvsStatsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
