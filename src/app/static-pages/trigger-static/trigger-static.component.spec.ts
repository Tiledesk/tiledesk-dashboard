import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TriggerStaticComponent } from './trigger-static.component';

describe('TriggerStaticComponent', () => {
  let component: TriggerStaticComponent;
  let fixture: ComponentFixture<TriggerStaticComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TriggerStaticComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TriggerStaticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
