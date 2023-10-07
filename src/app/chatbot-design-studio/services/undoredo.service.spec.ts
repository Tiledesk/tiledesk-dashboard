import { TestBed } from '@angular/core/testing';

import { UndoredoService } from './undoredo.service';

describe('UndoredoService', () => {
  let service: UndoredoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UndoredoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
