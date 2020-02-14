import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqTestTrainBotComponent } from './faq-test-train-bot.component';

describe('FaqTestTrainBotComponent', () => {
  let component: FaqTestTrainBotComponent;
  let fixture: ComponentFixture<FaqTestTrainBotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FaqTestTrainBotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FaqTestTrainBotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
