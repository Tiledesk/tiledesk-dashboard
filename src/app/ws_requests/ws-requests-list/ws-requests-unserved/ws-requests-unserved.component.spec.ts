import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WsRequestsUnservedComponent } from './ws-requests-unserved.component';

describe('WsRequestsUnservedComponent', () => {
  let component: WsRequestsUnservedComponent;
  let fixture: ComponentFixture<WsRequestsUnservedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WsRequestsUnservedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WsRequestsUnservedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
