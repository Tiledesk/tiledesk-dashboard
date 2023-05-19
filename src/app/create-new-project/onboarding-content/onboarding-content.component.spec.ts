import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingContentComponent } from './onboarding-content.component';

describe('OnboardingContentComponent', () => {
  let component: OnboardingContentComponent;
  let fixture: ComponentFixture<OnboardingContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OnboardingContentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnboardingContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
