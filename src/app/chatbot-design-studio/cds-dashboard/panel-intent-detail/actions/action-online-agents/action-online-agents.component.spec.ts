import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionOnlineAgentsComponent } from './action-online-agents.component';

describe('ActionOnlineAgentsComponent', () => {
  let component: ActionOnlineAgentsComponent;
  let fixture: ComponentFixture<ActionOnlineAgentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionOnlineAgentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionOnlineAgentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
