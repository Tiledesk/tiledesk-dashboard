import { TestBed } from '@angular/core/testing';

import { UploadImageNativeService } from './upload-image-native.service';

describe('UploadImageNativeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UploadImageNativeService = TestBed.get(UploadImageNativeService);
    expect(service).toBeTruthy();
  });
});
