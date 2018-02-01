import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MongodbDepartmentsComponent } from './mongodb-departments.component';

describe('MongodbDepartmentsComponent', () => {
  let component: MongodbDepartmentsComponent;
  let fixture: ComponentFixture<MongodbDepartmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MongodbDepartmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MongodbDepartmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
