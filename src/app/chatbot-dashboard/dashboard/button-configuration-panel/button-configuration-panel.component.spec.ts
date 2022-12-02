import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonConfigurationPanelComponent } from './button-configuration-panel.component';

describe('ButtonConfigurationPanelComponent', () => {
  let component: ButtonConfigurationPanelComponent;
  let fixture: ComponentFixture<ButtonConfigurationPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ButtonConfigurationPanelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonConfigurationPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
