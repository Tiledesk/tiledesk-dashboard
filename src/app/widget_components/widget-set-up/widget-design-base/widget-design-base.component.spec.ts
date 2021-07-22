import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetDesignBaseComponent } from './widget-design-base.component';

describe('WidgetDesignBaseComponent', () => {
  let component: WidgetDesignBaseComponent;
  let fixture: ComponentFixture<WidgetDesignBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetDesignBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetDesignBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
