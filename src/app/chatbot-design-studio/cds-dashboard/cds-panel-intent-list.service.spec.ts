import { TestBed } from '@angular/core/testing';

import { CdsPanelIntentListService } from './cds-panel-intent-list.service';

describe('CdsPanelIntentListService', () => {
  let service: CdsPanelIntentListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CdsPanelIntentListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
