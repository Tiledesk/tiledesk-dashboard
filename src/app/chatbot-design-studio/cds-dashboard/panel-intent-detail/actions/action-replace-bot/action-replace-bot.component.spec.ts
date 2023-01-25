import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionReplaceBotComponent } from './action-replace-bot.component';

describe('ActionReplaceBotComponent', () => {
  let component: ActionReplaceBotComponent;
  let fixture: ComponentFixture<ActionReplaceBotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionReplaceBotComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionReplaceBotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
