import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainBotComponent } from './train-bot.component';

describe('TrainBotComponent', () => {
  let component: TrainBotComponent;
  let fixture: ComponentFixture<TrainBotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrainBotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainBotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
