import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeWhatsappAccountWizardComponent } from './home-whatsapp-account-wizard.component';

describe('HomeWhatsappAccountWizardComponent', () => {
  let component: HomeWhatsappAccountWizardComponent;
  let fixture: ComponentFixture<HomeWhatsappAccountWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeWhatsappAccountWizardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeWhatsappAccountWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
