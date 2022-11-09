import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrestashopInstallationComponent } from './prestashop-installation.component';

describe('PrestashopInstallationComponent', () => {
  let component: PrestashopInstallationComponent;
  let fixture: ComponentFixture<PrestashopInstallationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrestashopInstallationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrestashopInstallationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
