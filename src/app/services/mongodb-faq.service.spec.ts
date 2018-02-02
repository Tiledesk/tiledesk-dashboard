import { TestBed, inject } from '@angular/core/testing';

import { MongodbFaqService } from './mongodb-faq.service';

describe('MongodbFaqService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MongodbFaqService]
    });
  });

  it('should be created', inject([MongodbFaqService], (service: MongodbFaqService) => {
    expect(service).toBeTruthy();
  }));
});
