import { TestBed, inject } from '@angular/core/testing';

import { ResetPswService } from './reset-psw.service';

describe('ResetPswService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ResetPswService]
    });
  });

  it('should be created', inject([ResetPswService], (service: ResetPswService) => {
    expect(service).toBeTruthy();
  }));
});
