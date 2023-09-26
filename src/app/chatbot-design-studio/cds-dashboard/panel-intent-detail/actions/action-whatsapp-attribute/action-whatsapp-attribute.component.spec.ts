import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionWhatsappAttributeComponent } from './action-whatsapp-attribute.component';

describe('ActionWhatsappAttributeComponent', () => {
  let component: ActionWhatsappAttributeComponent;
  let fixture: ComponentFixture<ActionWhatsappAttributeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionWhatsappAttributeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionWhatsappAttributeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
