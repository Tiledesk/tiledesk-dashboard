import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionChangeDepartmentComponent } from './action-change-department.component';

describe('ActionChangeDepartmentComponent', () => {
  let component: ActionChangeDepartmentComponent;
  let fixture: ComponentFixture<ActionChangeDepartmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionChangeDepartmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionChangeDepartmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
