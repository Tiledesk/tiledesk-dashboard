import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TriggerEditComponent } from './trigger-edit.component';

describe('TriggerEditComponent', () => {
  let component: TriggerEditComponent;
  let fixture: ComponentFixture<TriggerEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TriggerEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TriggerEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
