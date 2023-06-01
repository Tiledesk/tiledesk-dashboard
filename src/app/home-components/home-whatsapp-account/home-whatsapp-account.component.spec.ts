import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeWhatsappAccountComponent } from './home-whatsapp-account.component';

describe('HomeWhatsappAccountComponent', () => {
  let component: HomeWhatsappAccountComponent;
  let fixture: ComponentFixture<HomeWhatsappAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeWhatsappAccountComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeWhatsappAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
