import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TilebotSelectTypeComponent } from './tilebot-select-type.component';

describe('TilebotSelectTypeComponent', () => {
  let component: TilebotSelectTypeComponent;
  let fixture: ComponentFixture<TilebotSelectTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TilebotSelectTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TilebotSelectTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
