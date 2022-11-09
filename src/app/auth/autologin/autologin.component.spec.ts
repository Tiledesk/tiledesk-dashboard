import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutologinComponent } from './autologin.component';

describe('AutologinComponent', () => {
  let component: AutologinComponent;
  let fixture: ComponentFixture<AutologinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutologinComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutologinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
