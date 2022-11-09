import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WsRequestsUnservedForPanelComponent } from './ws-requests-unserved-for-panel.component';

describe('WsRequestsUnservedForPanelComponent', () => {
  let component: WsRequestsUnservedForPanelComponent;
  let fixture: ComponentFixture<WsRequestsUnservedForPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WsRequestsUnservedForPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WsRequestsUnservedForPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
