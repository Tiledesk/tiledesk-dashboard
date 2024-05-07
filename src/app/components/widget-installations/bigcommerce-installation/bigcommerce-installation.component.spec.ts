import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BigcommerceInstallationComponent } from './bigcommerce-installation.component';

describe('BigcommerceInstallationComponent', () => {
  let component: BigcommerceInstallationComponent;
  let fixture: ComponentFixture<BigcommerceInstallationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BigcommerceInstallationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BigcommerceInstallationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
