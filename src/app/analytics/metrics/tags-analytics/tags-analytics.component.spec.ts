import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagsAnalyticsComponent } from './tags-analytics.component';

describe('TagsAnalyticsComponent', () => {
  let component: TagsAnalyticsComponent;
  let fixture: ComponentFixture<TagsAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TagsAnalyticsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TagsAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
