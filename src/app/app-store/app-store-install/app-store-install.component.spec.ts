import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppStoreInstallComponent } from './app-store-install.component';

describe('AppStoreInstallComponent', () => {
  let component: AppStoreInstallComponent;
  let fixture: ComponentFixture<AppStoreInstallComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppStoreInstallComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppStoreInstallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
