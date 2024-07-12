import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteSlotModalComponent } from './delete-slot-modal.component';

describe('DeleteSlotModalComponent', () => {
  let component: DeleteSlotModalComponent;
  let fixture: ComponentFixture<DeleteSlotModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteSlotModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteSlotModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
