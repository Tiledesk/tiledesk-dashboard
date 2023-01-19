import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelButtonConfigurationComponent } from './panel-button-configuration.component';

describe('PanelButtonConfigurationComponent', () => {
  let component: PanelButtonConfigurationComponent;
  let fixture: ComponentFixture<PanelButtonConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PanelButtonConfigurationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelButtonConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
