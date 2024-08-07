import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewSlotModalComponent } from './new-slot-modal.component';

describe('NewSlotModalComponent', () => {
  let component: NewSlotModalComponent;
  let fixture: ComponentFixture<NewSlotModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewSlotModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewSlotModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
