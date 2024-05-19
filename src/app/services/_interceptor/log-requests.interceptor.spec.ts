import { TestBed } from '@angular/core/testing';

import { LogRequestsInterceptor } from './log-requests.interceptor';

describe('LogRequestsInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      LogRequestsInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: LogRequestsInterceptor = TestBed.inject(LogRequestsInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
