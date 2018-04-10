import { TestBed, inject } from '@angular/core/testing';

import { UsersLocalDbService } from './users-local-db.service';

describe('UsersLocalDbService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UsersLocalDbService]
    });
  });

  it('should be created', inject([UsersLocalDbService], (service: UsersLocalDbService) => {
    expect(service).toBeTruthy();
  }));
});
