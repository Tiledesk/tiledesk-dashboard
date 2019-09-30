import { TestBed, inject } from '@angular/core/testing';

import { MongodbDepartmentService } from './mongodb-departemnt.service';

describe('MongodbDepartemntService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MongodbDepartmentService]
    });
  });

  it('should be created', inject([MongodbDepartmentService], (service: MongodbDepartmentService) => {
    expect(service).toBeTruthy();
  }));
});
