import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionDescriptionComponent } from './action-description.component';

describe('ActionDescriptionComponent', () => {
  let component: ActionDescriptionComponent;
  let fixture: ComponentFixture<ActionDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionDescriptionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
