import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetInstallationComponent } from './widget-installation.component';

describe('WidgetInstallationComponent', () => {
  let component: WidgetInstallationComponent;
  let fixture: ComponentFixture<WidgetInstallationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ 
        WidgetInstallationComponent
       ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetInstallationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
