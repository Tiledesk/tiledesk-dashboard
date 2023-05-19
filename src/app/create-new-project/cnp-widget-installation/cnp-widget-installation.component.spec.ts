import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CnpWidgetInstallationComponent } from './cnp-widget-installation.component';

describe('CnpWidgetInstallationComponent', () => {
  let component: CnpWidgetInstallationComponent;
  let fixture: ComponentFixture<CnpWidgetInstallationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CnpWidgetInstallationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CnpWidgetInstallationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
