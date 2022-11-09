import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetSetUpBaseComponent } from './widget-set-up-base.component';

describe('WidgetSetUpBaseComponent', () => {
  let component: WidgetSetUpBaseComponent;
  let fixture: ComponentFixture<WidgetSetUpBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetSetUpBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetSetUpBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
