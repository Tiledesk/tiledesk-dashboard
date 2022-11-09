import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HumanConfigurationComponent } from './human-configuration.component';

describe('HumanConfigurationComponent', () => {
  let component: HumanConfigurationComponent;
  let fixture: ComponentFixture<HumanConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HumanConfigurationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HumanConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
