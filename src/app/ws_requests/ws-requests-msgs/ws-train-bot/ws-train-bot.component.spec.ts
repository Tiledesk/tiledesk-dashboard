import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WsTrainBotComponent } from './ws-train-bot.component';

describe('WsTrainBotComponent', () => {
  let component: WsTrainBotComponent;
  let fixture: ComponentFixture<WsTrainBotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WsTrainBotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WsTrainBotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
