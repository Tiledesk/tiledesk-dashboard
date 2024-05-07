import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MagentoInstallationComponent } from './magento-installation.component';

describe('MagentoInstallationComponent', () => {
  let component: MagentoInstallationComponent;
  let fixture: ComponentFixture<MagentoInstallationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MagentoInstallationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MagentoInstallationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
