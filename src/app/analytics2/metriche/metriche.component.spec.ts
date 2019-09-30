import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricheComponent } from './metriche.component';

describe('MetricheComponent', () => {
  let component: MetricheComponent;
  let fixture: ComponentFixture<MetricheComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MetricheComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetricheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
