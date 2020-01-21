import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetSharedComponent } from './widget-shared.component';

describe('WidgetSharedComponent', () => {
  let component: WidgetSharedComponent;
  let fixture: ComponentFixture<WidgetSharedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetSharedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetSharedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
