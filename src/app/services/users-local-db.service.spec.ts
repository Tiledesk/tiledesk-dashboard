import { TestBed, inject } from '@angular/core/testing';

import { LocalDbService } from './users-local-db.service';

describe('LocalDbService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LocalDbService]
    });
  });

  it('should be created', inject([LocalDbService], (service: LocalDbService) => {
    expect(service).toBeTruthy();
  }));
});
