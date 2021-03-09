import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsAnalyticsComponent } from './events-analytics.component';

describe('EventsAnalyticsComponent', () => {
  let component: EventsAnalyticsComponent;
  let fixture: ComponentFixture<EventsAnalyticsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventsAnalyticsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventsAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
