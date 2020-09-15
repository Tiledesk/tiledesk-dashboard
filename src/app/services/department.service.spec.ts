import { TestBed, inject } from '@angular/core/testing';

import {DepartmentService } from './departemnt.service';

describe('MongodbDepartemntService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DepartmentService]
    });
  });

  it('should be created', inject([DepartmentService], (service: DepartmentService) => {
    expect(service).toBeTruthy();
  }));
});
