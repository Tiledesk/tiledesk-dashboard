import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionIntentComponent } from './action-intent.component';

describe('ActionIntentComponent', () => {
  let component: ActionIntentComponent;
  let fixture: ComponentFixture<ActionIntentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionIntentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionIntentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
