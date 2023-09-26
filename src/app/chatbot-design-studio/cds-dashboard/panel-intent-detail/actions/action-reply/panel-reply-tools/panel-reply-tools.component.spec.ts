import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelReplyToolsComponent } from './panel-reply-tools.component';

describe('ToolsComponent', () => {
  let component: PanelReplyToolsComponent;
  let fixture: ComponentFixture<PanelReplyToolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PanelReplyToolsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelReplyToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
