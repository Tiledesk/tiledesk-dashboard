import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeWhatsappAccountWizardModalComponent } from './home-whatsapp-account-wizard-modal.component';

describe('HomeWhatsappAccountWizardModalComponent', () => {
  let component: HomeWhatsappAccountWizardModalComponent;
  let fixture: ComponentFixture<HomeWhatsappAccountWizardModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeWhatsappAccountWizardModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeWhatsappAccountWizardModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
