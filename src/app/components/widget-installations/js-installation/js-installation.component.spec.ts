import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JsInstallationComponent } from './js-installation.component';

describe('JsInstallationComponent', () => {
  let component: JsInstallationComponent;
  let fixture: ComponentFixture<JsInstallationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JsInstallationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JsInstallationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
