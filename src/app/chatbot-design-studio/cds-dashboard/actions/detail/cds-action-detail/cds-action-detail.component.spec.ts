import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdsActionDetail } from './cds-action-detail.component';

describe('PanelIntentDetailComponent', () => {
  let component: CdsActionDetail;
  let fixture: ComponentFixture<CdsActionDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CdsActionDetail ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdsActionDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
