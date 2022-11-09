import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsStaticComponent } from './analytics-static.component';

describe('AnalyticsStaticComponent', () => {
  let component: AnalyticsStaticComponent;
  let fixture: ComponentFixture<AnalyticsStaticComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnalyticsStaticComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyticsStaticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
