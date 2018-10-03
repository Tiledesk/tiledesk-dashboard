import { TestBed, inject } from '@angular/core/testing';

import { ContactsService } from './mongodb-contacts.service';

describe('ContactsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ContactsService],
    });
  });

  it('should be created', inject([ContactsService], (service: ContactsService) => {
    expect(service).toBeTruthy();
  }));
});
