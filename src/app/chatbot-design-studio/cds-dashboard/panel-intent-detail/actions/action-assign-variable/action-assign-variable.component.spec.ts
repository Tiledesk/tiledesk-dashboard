import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionAssignVariableComponent } from './action-assign-variable.component';

describe('ActionAssignVariableComponent', () => {
  let component: ActionAssignVariableComponent;
  let fixture: ComponentFixture<ActionAssignVariableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionAssignVariableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionAssignVariableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
