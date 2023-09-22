import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CnpIsMobileComponent } from './cnp-is-mobile.component';

describe('CnpIsMobileComponent', () => {
  let component: CnpIsMobileComponent;
  let fixture: ComponentFixture<CnpIsMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CnpIsMobileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CnpIsMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
