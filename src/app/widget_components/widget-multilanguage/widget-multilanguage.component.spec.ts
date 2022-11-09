import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetMultilanguageComponent } from './widget-multilanguage.component';

describe('WidgetMultilanguageComponent', () => {
  let component: WidgetMultilanguageComponent;
  let fixture: ComponentFixture<WidgetMultilanguageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetMultilanguageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetMultilanguageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
