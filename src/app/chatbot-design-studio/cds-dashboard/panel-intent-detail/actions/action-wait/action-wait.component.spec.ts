import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionWaitComponent } from './action-wait.component';

describe('ActionWaitComponent', () => {
  let component: ActionWaitComponent;
  let fixture: ComponentFixture<ActionWaitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionWaitComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionWaitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
