import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleTagManagerInstallationComponent } from './google-tag-manager-installation.component';

describe('GoogleTagManagerInstallationComponent', () => {
  let component: GoogleTagManagerInstallationComponent;
  let fixture: ComponentFixture<GoogleTagManagerInstallationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GoogleTagManagerInstallationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GoogleTagManagerInstallationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
