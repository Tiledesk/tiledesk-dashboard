import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DelaySliderComponent } from './delay-slider.component';

describe('DelaySliderComponent', () => {
  let component: DelaySliderComponent;
  let fixture: ComponentFixture<DelaySliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DelaySliderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DelaySliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
