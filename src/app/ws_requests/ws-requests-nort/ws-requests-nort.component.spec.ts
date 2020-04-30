import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WsRequestsNortComponent } from './ws-requests-nort.component';

describe('WsRequestsNortComponent', () => {
  let component: WsRequestsNortComponent;
  let fixture: ComponentFixture<WsRequestsNortComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WsRequestsNortComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WsRequestsNortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
