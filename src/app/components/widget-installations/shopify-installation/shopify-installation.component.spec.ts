import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopifyInstallationComponent } from './shopify-installation.component';

describe('ShopifyInstallationComponent', () => {
  let component: ShopifyInstallationComponent;
  let fixture: ComponentFixture<ShopifyInstallationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShopifyInstallationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShopifyInstallationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
