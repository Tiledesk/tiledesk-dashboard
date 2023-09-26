import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelIntentDetailComponent } from './panel-intent-detail.component';

describe('PanelIntentDetailComponent', () => {
  let component: PanelIntentDetailComponent;
  let fixture: ComponentFixture<PanelIntentDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PanelIntentDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelIntentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
