import { TestBed, inject } from '@angular/core/testing';

import { BotService } from './bot.service';

describe('BotService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BotService]
    });
  });

  it('should be created', inject([BotService], (service: BotService) => {
    expect(service).toBeTruthy();
  }));
});
