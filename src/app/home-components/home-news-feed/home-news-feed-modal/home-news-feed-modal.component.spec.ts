import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeNewsFeedModalComponent } from './home-news-feed-modal.component';

describe('HomeNewsFeedModalComponent', () => {
  let component: HomeNewsFeedModalComponent;
  let fixture: ComponentFixture<HomeNewsFeedModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeNewsFeedModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeNewsFeedModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
