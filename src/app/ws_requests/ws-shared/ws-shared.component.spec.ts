import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WsSharedComponent } from './ws-shared.component';

describe('WsSharedComponent', () => {
  let component: WsSharedComponent;
  let fixture: ComponentFixture<WsSharedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WsSharedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WsSharedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
