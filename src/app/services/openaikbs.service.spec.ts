import { TestBed } from '@angular/core/testing';

import { OpenaikbsService } from './openaikbs.service';

describe('OpenaikbsService', () => {
  let service: OpenaikbsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpenaikbsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
