import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeInstallationComponent } from './code-installation.component';

describe('CodeInstallationComponent', () => {
  let component: CodeInstallationComponent;
  let fixture: ComponentFixture<CodeInstallationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CodeInstallationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeInstallationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
