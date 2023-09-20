import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeNewsFeedComponent } from './home-news-feed.component';

describe('HomeNewsFeedComponent', () => {
  let component: HomeNewsFeedComponent;
  let fixture: ComponentFixture<HomeNewsFeedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeNewsFeedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeNewsFeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
