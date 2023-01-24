import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionHideMessageComponent } from './action-hide-message.component';

describe('ActionHideMessageComponent', () => {
  let component: ActionHideMessageComponent;
  let fixture: ComponentFixture<ActionHideMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionHideMessageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionHideMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
