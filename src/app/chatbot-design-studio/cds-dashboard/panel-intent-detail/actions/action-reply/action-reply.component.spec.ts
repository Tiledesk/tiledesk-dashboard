import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionReplyComponent } from './action-reply.component';

describe('PanelResponseComponent', () => {
  let component: ActionReplyComponent;
  let fixture: ComponentFixture<ActionReplyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionReplyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionReplyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
