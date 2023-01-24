import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionDeleteVariableComponent } from './action-delete-variable.component';

describe('ActionDeleteVariableComponent', () => {
  let component: ActionDeleteVariableComponent;
  let fixture: ComponentFixture<ActionDeleteVariableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionDeleteVariableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionDeleteVariableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
