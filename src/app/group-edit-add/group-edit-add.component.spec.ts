import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupEditAddComponent } from './group-edit-add.component';

describe('GroupEditAddComponent', () => {
  let component: GroupEditAddComponent;
  let fixture: ComponentFixture<GroupEditAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupEditAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupEditAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
