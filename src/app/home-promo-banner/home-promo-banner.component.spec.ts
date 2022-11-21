import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePromoBannerComponent } from './home-promo-banner.component';

describe('HomePromoBannerComponent', () => {
  let component: HomePromoBannerComponent;
  let fixture: ComponentFixture<HomePromoBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomePromoBannerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomePromoBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
