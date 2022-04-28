import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NativeBotSelectTypeComponent } from './native-bot-select-type.component';

describe('NativeBotSelectTypeComponent', () => {
  let component: NativeBotSelectTypeComponent;
  let fixture: ComponentFixture<NativeBotSelectTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NativeBotSelectTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NativeBotSelectTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
