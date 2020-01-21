import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WsRequestsMsgsComponent } from './ws-requests-msgs.component';

describe('WsRequestsMsgsComponent', () => {
  let component: WsRequestsMsgsComponent;
  let fixture: ComponentFixture<WsRequestsMsgsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WsRequestsMsgsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WsRequestsMsgsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
