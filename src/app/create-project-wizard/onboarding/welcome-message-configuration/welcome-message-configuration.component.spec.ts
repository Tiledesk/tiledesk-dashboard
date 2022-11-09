import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WelcomeMessageConfigurationComponent } from './welcome-message-configuration.component';

describe('WelcomeMessageConfigurationComponent', () => {
  let component: WelcomeMessageConfigurationComponent;
  let fixture: ComponentFixture<WelcomeMessageConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WelcomeMessageConfigurationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WelcomeMessageConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
