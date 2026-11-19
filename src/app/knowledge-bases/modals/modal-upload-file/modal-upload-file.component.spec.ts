import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { ModalUploadFileComponent } from './modal-upload-file.component';
import { UploadImageNativeService } from 'app/services/upload-image-native.service';
import { KbSourcesService } from 'app/services/kb-sources.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { BrandService } from 'app/services/brand.service';

const MB = 1048576;

describe('ModalUploadFileComponent', () => {
  let component: ModalUploadFileComponent;
  let upload: jasmine.SpyObj<UploadImageNativeService>;

  function setup(providers$) {
    upload = jasmine.createSpyObj('UploadImageNativeService', ['uploadKbFile', 'uploadAssetFile']);
    upload.uploadKbFile.and.returnValue(Promise.resolve('http://x/files?path=a'));
    TestBed.configureTestingModule({
      declarations: [ModalUploadFileComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: { close: () => {} } },
        { provide: UploadImageNativeService, useValue: upload },
        { provide: KbSourcesService, useValue: { getProviders: () => providers$ } },
        { provide: LoggerService, useValue: { log: () => {}, error: () => {}, warn: () => {} } },
        { provide: BrandService, useValue: { getBrand: () => ({ DOCS: false }) } },
      ]
    });
    // logic-only spec: render no template
    TestBed.overrideComponent(ModalUploadFileComponent, { set: { template: '', templateUrl: undefined } });
    const fixture: ComponentFixture<ModalUploadFileComponent> = TestBed.createComponent(ModalUploadFileComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  }

  function fileOfSize(name: string, size: number): File {
    const f = new File(['x'], name, { type: 'application/pdf' });
    Object.defineProperty(f, 'size', { value: size });
    return f;
  }

  it('a 40 MB pdf is accepted when kb_max_file_size is 50 MB', () => {
    setup(of({ providers: [], kb_max_file_size: 50 * MB, supported_extensions: [] }));
    component.onFileChange({ target: { files: [fileOfSize('a.pdf', 40 * MB)] } });
    expect(component.fileSizeExceeds).toBe(false);
    expect(upload.uploadKbFile).toHaveBeenCalled();
    expect(upload.uploadAssetFile).not.toHaveBeenCalled();
  });

  it('a 60 MB pdf shows the size error with "50"', () => {
    setup(of({ providers: [], kb_max_file_size: 50 * MB, supported_extensions: [] }));
    component.onFileChange({ target: { files: [fileOfSize('a.pdf', 60 * MB)] } });
    expect(component.fileSizeExceeds).toBe(true);
    expect(component.tparams.file_size_limit).toBe('50');
    expect(upload.uploadKbFile).not.toHaveBeenCalled();
  });

  it('defaults to 50 MB when getProviders fails', () => {
    setup(throwError(() => ({ status: 403 })));
    expect(component.maxFileSize).toBe(52428800);
    component.onFileChange({ target: { files: [fileOfSize('a.pdf', 40 * MB)] } });
    expect(component.fileSizeExceeds).toBe(false);
    component.onFileChange({ target: { files: [fileOfSize('b.pdf', 51 * MB)] } });
    expect(component.fileSizeExceeds).toBe(true);
    expect(component.tparams.file_size_limit).toBe('50');
  });
});
