import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionCloseComponent } from './action-close.component';

describe('ActionCloseComponent', () => {
  let component: ActionCloseComponent;
  let fixture: ComponentFixture<ActionCloseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionCloseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionCloseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
