import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelIntentToolsComponent } from './panel-intent-tools.component';

describe('ToolsComponent', () => {
  let component: PanelIntentToolsComponent;
  let fixture: ComponentFixture<PanelIntentToolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PanelIntentToolsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelIntentToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
