import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserEditAddComponent } from './user-edit-add.component';

describe('UserEditAddComponent', () => {
  let component: UserEditAddComponent;
  let fixture: ComponentFixture<UserEditAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserEditAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserEditAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
