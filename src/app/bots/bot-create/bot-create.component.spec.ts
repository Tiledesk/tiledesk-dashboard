import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BotCreateComponent } from './bot-create.component';

describe('FaqKbEditAddComponent', () => {
  let component: BotCreateComponent;
  let fixture: ComponentFixture<BotCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BotCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BotCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
