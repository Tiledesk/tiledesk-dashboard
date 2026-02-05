import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditGroupsLoadDistributionModalComponent } from './edit-groups-load-distribution-modal.component';

describe('EditGroupsLoadDistributionModalComponent', () => {
  let component: EditGroupsLoadDistributionModalComponent;
  let fixture: ComponentFixture<EditGroupsLoadDistributionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditGroupsLoadDistributionModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditGroupsLoadDistributionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
