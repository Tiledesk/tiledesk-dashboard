import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLoadDistributionModalComponent } from './edit-load-distribution-modal.component';

describe('EditLoadDistributionModalComponent', () => {
  let component: EditLoadDistributionModalComponent;
  let fixture: ComponentFixture<EditLoadDistributionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditLoadDistributionModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditLoadDistributionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
