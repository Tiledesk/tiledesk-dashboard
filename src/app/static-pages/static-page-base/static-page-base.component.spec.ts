import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticPageBaseComponent } from './static-page-base.component';

describe('StaticPageBaseComponent', () => {
  let component: StaticPageBaseComponent;
  let fixture: ComponentFixture<StaticPageBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaticPageBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaticPageBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
