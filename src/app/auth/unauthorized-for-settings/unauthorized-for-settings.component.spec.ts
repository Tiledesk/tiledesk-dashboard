import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnauthorizedForSettingsComponent } from './unauthorized-for-settings.component';

describe('UnauthorizedForSettingsComponent', () => {
  let component: UnauthorizedForSettingsComponent;
  let fixture: ComponentFixture<UnauthorizedForSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnauthorizedForSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnauthorizedForSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
