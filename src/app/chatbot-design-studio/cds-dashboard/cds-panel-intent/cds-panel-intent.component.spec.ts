import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdsPanelIntentComponent } from './cds-panel-intent.component';

describe('CdsPanelIntentComponent', () => {
  let component: CdsPanelIntentComponent;
  let fixture: ComponentFixture<CdsPanelIntentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CdsPanelIntentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdsPanelIntentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
