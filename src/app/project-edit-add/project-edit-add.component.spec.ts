import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectEditAddComponent } from './project-edit-add.component';

describe('ProjectEditAddComponent', () => {
  let component: ProjectEditAddComponent;
  let fixture: ComponentFixture<ProjectEditAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectEditAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectEditAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
