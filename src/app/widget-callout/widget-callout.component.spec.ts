import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetCalloutComponent } from './widget-callout.component';

describe('WidgetCalloutComponent', () => {
  let component: WidgetCalloutComponent;
  let fixture: ComponentFixture<WidgetCalloutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetCalloutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetCalloutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
