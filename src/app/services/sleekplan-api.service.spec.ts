import { TestBed } from '@angular/core/testing';

import { SleekplanApiService } from './sleekplan-api.service';

describe('SleekplanApiService', () => {
  let service: SleekplanApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SleekplanApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
