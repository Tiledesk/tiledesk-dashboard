import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingWidgetComponent } from './onboarding-widget.component';

describe('OnboardingWidgetComponent', () => {
  let component: OnboardingWidgetComponent;
  let fixture: ComponentFixture<OnboardingWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OnboardingWidgetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnboardingWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
