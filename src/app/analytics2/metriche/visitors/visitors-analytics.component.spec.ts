import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitorsAnalyticsComponent } from './visitors-analytics.component';

describe('VisitorsAnalyticsComponent', () => {
  let component: VisitorsAnalyticsComponent;
  let fixture: ComponentFixture<VisitorsAnalyticsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisitorsAnalyticsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisitorsAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
