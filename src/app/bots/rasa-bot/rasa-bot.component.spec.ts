import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RasaBotComponent } from './rasa-bot.component';

describe('RasaBotComponent', () => {
  let component: RasaBotComponent;
  let fixture: ComponentFixture<RasaBotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RasaBotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RasaBotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
