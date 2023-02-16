import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RowJsonConditionComponent } from './row-json-condition.component';

describe('RowJsonConditionComponent', () => {
  let component: RowJsonConditionComponent;
  let fixture: ComponentFixture<RowJsonConditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RowJsonConditionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RowJsonConditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
