import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BotTypeSelectComponent } from './bot-type-select.component';

describe('BotTypeSelectComponent', () => {
  let component: BotTypeSelectComponent;
  let fixture: ComponentFixture<BotTypeSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BotTypeSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BotTypeSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
