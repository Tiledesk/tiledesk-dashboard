import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetChatComponent } from './widget-chat.component';

describe('WidgetChatComponent', () => {
  let component: WidgetChatComponent;
  let fixture: ComponentFixture<WidgetChatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetChatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
