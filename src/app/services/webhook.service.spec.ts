import { TestBed } from '@angular/core/testing';

import { WebhookService } from './webhook.service';

describe('WebhookService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WebhookService = TestBed.get(WebhookService);
    expect(service).toBeTruthy();
  });
});
