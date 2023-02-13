import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionJsonConditionComponent } from './action-json-condition.component';

describe('ActionFilterComponent', () => {
  let component: ActionJsonConditionComponent;
  let fixture: ComponentFixture<ActionJsonConditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionJsonConditionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionJsonConditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
