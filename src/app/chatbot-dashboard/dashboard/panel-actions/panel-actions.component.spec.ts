import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelActionsComponent } from './panel-actions.component';

describe('PanelActionsComponent', () => {
  let component: PanelActionsComponent;
  let fixture: ComponentFixture<PanelActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PanelActionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
