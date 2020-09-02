import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WsRequestDetailForPanelComponent } from './ws-request-detail-for-panel.component';

describe('WsRequestDetailForPanelComponent', () => {
  let component: WsRequestDetailForPanelComponent;
  let fixture: ComponentFixture<WsRequestDetailForPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WsRequestDetailForPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WsRequestDetailForPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
