import { TestBed } from '@angular/core/testing';

import { SleekplanService } from './sleekplan.service';

describe('SleekplanService', () => {
  let service: SleekplanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SleekplanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
