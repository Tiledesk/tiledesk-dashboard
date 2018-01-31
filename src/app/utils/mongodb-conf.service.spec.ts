import { TestBed, inject } from '@angular/core/testing';

import { MongodbConfService } from './mongodb-conf.service';

describe('MongodbConfService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MongodbConfService]
    });
  });

  it('should be created', inject([MongodbConfService], (service: MongodbConfService) => {
    expect(service).toBeTruthy();
  }));
});
