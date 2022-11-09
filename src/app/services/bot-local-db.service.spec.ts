import { TestBed, inject } from '@angular/core/testing';

import { BotLocalDbService } from './bot-local-db.service';

describe('BotLocalDbService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BotLocalDbService]
    });
  });

  it('should be created', inject([BotLocalDbService], (service: BotLocalDbService) => {
    expect(service).toBeTruthy();
  }));
});
