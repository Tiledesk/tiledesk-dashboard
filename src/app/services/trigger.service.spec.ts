import { TestBed } from '@angular/core/testing';

import { TriggerService } from './trigger.service';

describe('TriggerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TriggerService = TestBed.get(TriggerService);
    expect(service).toBeTruthy();
  });
});
