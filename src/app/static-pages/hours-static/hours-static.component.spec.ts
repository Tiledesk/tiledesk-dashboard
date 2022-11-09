import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoursStaticComponent } from './hours-static.component';

describe('HoursStaticComponent', () => {
  let component: HoursStaticComponent;
  let fixture: ComponentFixture<HoursStaticComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoursStaticComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoursStaticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
