import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WsRequestsListComponent } from './ws-requests-list.component';

describe('WsRequestsListComponent', () => {
  let component: WsRequestsListComponent;
  let fixture: ComponentFixture<WsRequestsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WsRequestsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WsRequestsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
