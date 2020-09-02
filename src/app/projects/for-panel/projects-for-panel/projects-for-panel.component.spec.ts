import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsForPanelComponent } from './projects-for-panel.component';

describe('ProjectsForPanelComponent', () => {
  let component: ProjectsForPanelComponent;
  let fixture: ComponentFixture<ProjectsForPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectsForPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectsForPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
