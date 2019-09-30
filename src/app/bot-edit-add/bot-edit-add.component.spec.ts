import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BotEditAddComponent } from './bot-edit-add.component';

describe('BotEditAddComponent', () => {
  let component: BotEditAddComponent;
  let fixture: ComponentFixture<BotEditAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BotEditAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BotEditAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
