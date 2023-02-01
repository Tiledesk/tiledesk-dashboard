import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionAgentHandoffComponent } from './action-agent-handoff.component';

describe('ActionAgentHandoffComponent', () => {
  let component: ActionAgentHandoffComponent;
  let fixture: ComponentFixture<ActionAgentHandoffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionAgentHandoffComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionAgentHandoffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
