import { TestBed } from '@angular/core/testing';

import { WsMsgsService } from './ws-msgs.service';

describe('WsMsgsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WsMsgsService = TestBed.get(WsMsgsService);
    expect(service).toBeTruthy();
  });
});
