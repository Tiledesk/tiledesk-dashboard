import { TestBed } from '@angular/core/testing';

import { AppStoreService } from './app-store.service';

describe('AppStoreService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AppStoreService = TestBed.get(AppStoreService);
    expect(service).toBeTruthy();
  });
});
