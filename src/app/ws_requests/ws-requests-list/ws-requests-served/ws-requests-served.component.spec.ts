import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WsRequestsServedComponent } from './ws-requests-served.component';

describe('WsRequestsServedComponent', () => {
  let component: WsRequestsServedComponent;
  let fixture: ComponentFixture<WsRequestsServedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WsRequestsServedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WsRequestsServedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
