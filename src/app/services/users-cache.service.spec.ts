import { TestBed } from '@angular/core/testing';

import { UsersCacheService } from './users-cache.service';

describe('UsersCacheService', () => {
  let service: UsersCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsersCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
