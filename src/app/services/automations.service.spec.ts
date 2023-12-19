import { TestBed } from '@angular/core/testing';

import { AutomationsService } from './automations.service';

describe('AutomationsService', () => {
  let service: AutomationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AutomationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
