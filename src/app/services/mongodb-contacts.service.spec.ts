import { TestBed, inject } from '@angular/core/testing';

import { MongoDbContactsService } from './mongodb-contacts.service';

describe('ContactsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MongoDbContactsService],
    });
  });

  it('should be created', inject([MongoDbContactsService], (service: MongoDbContactsService) => {
    expect(service).toBeTruthy();
  }));
});
