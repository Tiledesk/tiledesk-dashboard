import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersNewRoleComponent } from './users-new-role.component';

describe('UsersNewRoleComponent', () => {
  let component: UsersNewRoleComponent;
  let fixture: ComponentFixture<UsersNewRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsersNewRoleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersNewRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
