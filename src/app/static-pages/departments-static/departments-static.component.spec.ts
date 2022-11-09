import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentsStaticComponent } from './departments-static.component';

describe('DepartmentsStaticComponent', () => {
  let component: DepartmentsStaticComponent;
  let fixture: ComponentFixture<DepartmentsStaticComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DepartmentsStaticComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepartmentsStaticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
