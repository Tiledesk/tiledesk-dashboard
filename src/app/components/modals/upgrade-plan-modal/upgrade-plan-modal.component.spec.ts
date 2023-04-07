import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpgradePlanModalComponent } from './upgrade-plan-modal.component';

describe('UpgradePlanModalComponent', () => {
  let component: UpgradePlanModalComponent;
  let fixture: ComponentFixture<UpgradePlanModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpgradePlanModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpgradePlanModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
