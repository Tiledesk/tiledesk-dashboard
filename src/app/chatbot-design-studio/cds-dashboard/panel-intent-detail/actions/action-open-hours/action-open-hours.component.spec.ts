import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionOpenHoursComponent } from './action-open-hours.component';

describe('ActionOpenHoursComponent', () => {
  let component: ActionOpenHoursComponent;
  let fixture: ComponentFixture<ActionOpenHoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionOpenHoursComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionOpenHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
