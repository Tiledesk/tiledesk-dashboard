import { TestBed } from '@angular/core/testing';

import { SleekplanSsoService } from './sleekplan-sso.service';

describe('SleekplanSsoService', () => {
  let service: SleekplanSsoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SleekplanSsoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
