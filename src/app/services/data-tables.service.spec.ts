import { TestBed } from '@angular/core/testing';

import { DataTablesService } from './data-tables.service';

describe('DataTablesService', () => {
  let service: DataTablesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataTablesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
