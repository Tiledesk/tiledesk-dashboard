import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeReportComponent } from './home-report.component';

describe('HomeReportComponent', () => {
  let component: HomeReportComponent;
  let fixture: ComponentFixture<HomeReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
