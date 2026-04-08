import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsNewComponent } from './analytics-new.component';

describe('AnalyticsNewComponent', () => {
  let component: AnalyticsNewComponent;
  let fixture: ComponentFixture<AnalyticsNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnalyticsNewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalyticsNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
