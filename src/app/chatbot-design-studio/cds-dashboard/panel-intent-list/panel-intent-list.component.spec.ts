import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelIntentListComponent } from './panel-intent-list.component';

describe('PanelIntentListComponent', () => {
  let component: PanelIntentListComponent;
  let fixture: ComponentFixture<PanelIntentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PanelIntentListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelIntentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
