import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeAnalyticsIndicatorComponent } from './home-analytics-indicator.component';

describe('HomeAnalyticsIndicatorComponent', () => {
  let component: HomeAnalyticsIndicatorComponent;
  let fixture: ComponentFixture<HomeAnalyticsIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeAnalyticsIndicatorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeAnalyticsIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
