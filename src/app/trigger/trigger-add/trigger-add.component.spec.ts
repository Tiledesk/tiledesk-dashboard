import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TriggerAddComponent } from './trigger-add.component';

describe('TriggerAddComponent', () => {
  let component: TriggerAddComponent;
  let fixture: ComponentFixture<TriggerAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TriggerAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TriggerAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
