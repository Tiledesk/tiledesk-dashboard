import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetPrechatFormComponent } from './widget-prechat-form.component';

describe('WidgetPrechatFormComponent', () => {
  let component: WidgetPrechatFormComponent;
  let fixture: ComponentFixture<WidgetPrechatFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetPrechatFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetPrechatFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
