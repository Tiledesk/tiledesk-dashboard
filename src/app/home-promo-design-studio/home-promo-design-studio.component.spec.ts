import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePromoDesignStudioComponent } from './home-promo-design-studio.component';

describe('HomePromoDesignStudioComponent', () => {
  let component: HomePromoDesignStudioComponent;
  let fixture: ComponentFixture<HomePromoDesignStudioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomePromoDesignStudioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomePromoDesignStudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
