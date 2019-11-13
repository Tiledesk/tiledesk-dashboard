import { TestBed } from '@angular/core/testing';

import { WsRequestsService } from './ws-requests.service';

describe('WsRequestsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WsRequestsService = TestBed.get(WsRequestsService);
    expect(service).toBeTruthy();
  });
});
