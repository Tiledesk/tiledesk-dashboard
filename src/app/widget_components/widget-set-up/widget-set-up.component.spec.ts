import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetSetUp } from './widget-set-up.component';

describe('WidgetSetUp', () => {
  let component: WidgetSetUp;
  let fixture: ComponentFixture<WidgetSetUp>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetSetUp ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetSetUp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
