import { TestBed } from '@angular/core/testing';

import { ProjectPlanService } from './project-plan.service';

describe('ProjectPlanService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProjectPlanService = TestBed.get(ProjectPlanService);
    expect(service).toBeTruthy();
  });
});
