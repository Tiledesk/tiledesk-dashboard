import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Analytics2Component } from './analytics2.component';

describe('Analytics2Component', () => {
  let component: Analytics2Component;
  let fixture: ComponentFixture<Analytics2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Analytics2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Analytics2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
