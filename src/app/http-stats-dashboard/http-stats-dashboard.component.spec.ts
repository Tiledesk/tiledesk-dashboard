import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpStatsDashboardComponent } from './http-stats-dashboard.component';

describe('HttpStatsDashboardComponent', () => {
  let component: HttpStatsDashboardComponent;
  let fixture: ComponentFixture<HttpStatsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HttpStatsDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HttpStatsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
