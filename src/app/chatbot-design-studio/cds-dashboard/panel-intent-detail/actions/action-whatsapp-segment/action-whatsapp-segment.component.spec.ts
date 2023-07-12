import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionWhatsappSegmentComponent } from './action-whatsapp-segment.component';

describe('ActionWhatsappSegmentComponent', () => {
  let component: ActionWhatsappSegmentComponent;
  let fixture: ComponentFixture<ActionWhatsappSegmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionWhatsappSegmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionWhatsappSegmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
