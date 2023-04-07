import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WsrequestsStaticComponent } from './wsrequests-static.component';

describe('WsrequestsStaticComponent', () => {
  let component: WsrequestsStaticComponent;
  let fixture: ComponentFixture<WsrequestsStaticComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WsrequestsStaticComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WsrequestsStaticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
