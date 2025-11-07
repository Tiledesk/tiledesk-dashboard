import { TestBed } from '@angular/core/testing';

import { CachePuService } from './cache-pu.service';

describe('CachePuService', () => {
  let service: CachePuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CachePuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
