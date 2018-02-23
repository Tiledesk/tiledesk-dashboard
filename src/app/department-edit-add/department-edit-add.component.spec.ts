import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentEditAddComponent } from './department-edit-add.component';

describe('DepartmentEditAddComponent', () => {
  let component: DepartmentEditAddComponent;
  let fixture: ComponentFixture<DepartmentEditAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DepartmentEditAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepartmentEditAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
