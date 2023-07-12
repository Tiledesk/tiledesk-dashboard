import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionWhatsappStaticComponent } from './action-whatsapp-static.component';

describe('ActionWhatsappStaticComponent', () => {
  let component: ActionWhatsappStaticComponent;
  let fixture: ComponentFixture<ActionWhatsappStaticComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionWhatsappStaticComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionWhatsappStaticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
