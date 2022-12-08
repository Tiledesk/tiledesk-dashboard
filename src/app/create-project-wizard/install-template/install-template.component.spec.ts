import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallTemplateComponent } from './install-template.component';

describe('InstallTemplateComponent', () => {
  let component: InstallTemplateComponent;
  let fixture: ComponentFixture<InstallTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstallTemplateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstallTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
