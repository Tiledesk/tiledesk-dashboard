import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionAssignFunctionComponent } from './action-assign-function.component';

describe('ActionAssignFunctionComponent', () => {
  let component: ActionAssignFunctionComponent;
  let fixture: ComponentFixture<ActionAssignFunctionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionAssignFunctionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionAssignFunctionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
