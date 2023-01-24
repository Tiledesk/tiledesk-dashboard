import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionConditionComponent } from './action-condition.component';

describe('ActionConditionComponent', () => {
  let component: ActionConditionComponent;
  let fixture: ComponentFixture<ActionConditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionConditionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionConditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
