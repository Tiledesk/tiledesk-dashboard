import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NativeBotComponent } from './native-bot.component';

describe('NativeBotComponent', () => {
  let component: NativeBotComponent;
  let fixture: ComponentFixture<NativeBotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NativeBotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NativeBotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
