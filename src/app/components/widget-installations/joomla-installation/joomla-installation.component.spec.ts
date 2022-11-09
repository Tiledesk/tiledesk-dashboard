import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JoomlaInstallationComponent } from './joomla-installation.component';

describe('JoomlaInstallationComponent', () => {
  let component: JoomlaInstallationComponent;
  let fixture: ComponentFixture<JoomlaInstallationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JoomlaInstallationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JoomlaInstallationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
