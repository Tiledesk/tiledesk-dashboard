import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from 'app/core/auth.service';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { UploadImageNativeService } from './upload-image-native.service';
import { AppConfigService } from './app-config.service';
import { LoggerService } from './logger/logger.service';
import { NotifyService } from 'app/core/notify.service';

describe('UploadImageNativeService', () => {
  let service: UploadImageNativeService;
  let http: HttpTestingController;

  beforeEach(() => {
    const logger = { log: () => {}, error: () => {}, warn: () => {} };
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UploadImageNativeService,
        { provide: AppConfigService, useValue: { getConfig: () => ({ baseImageUrl: 'http://img/' }) } },
        { provide: AuthService, useValue: {
            user_bs: new BehaviorSubject({ token: 'JWT tok' }),
            project_bs: new BehaviorSubject({ _id: 'p1' }),
          } },
        { provide: LoggerService, useValue: logger },
        { provide: NotifyService, useValue: { showWidgetStyleUpdateNotification: () => {}, presentModalAttachmentFileSizeTooLarge: () => {} } },
        { provide: TranslateService, useValue: { instant: (k: string) => k } },
      ]
    });
    service = TestBed.inject(UploadImageNativeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('uploadKbFile posts to /files/kb and resolves the download URL', async () => {
    const p = service.uploadKbFile(new File(['x'], 'a.pdf', { type: 'application/pdf' }));
    const req = http.expectOne('http://img/p1/files/kb');
    expect(req.request.method).toBe('POST');
    expect((req.request.body as FormData).get('file')).toBeTruthy();
    req.flush({ filename: 'abc/a.pdf' });
    expect(await p).toBe('http://img/files?path=abc/a.pdf');
  });

  const cases: [string, string][] = [
    ['n.md', 'text/markdown'],
    ['n.txt', 'text/plain'],
    ['n.pdf', 'application/pdf'],
    ['n.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ];
  cases.forEach(([name, mime]) => {
    [ '', 'application/octet-stream' ].forEach((declared) => {
      it(`re-wraps ${name} with type "${declared}" as ${mime}`, async () => {
        const p = service.uploadKbFile(new File(['x'], name, { type: declared }));
        const req = http.expectOne('http://img/p1/files/kb');
        const sent = (req.request.body as FormData).get('file') as File;
        expect(sent.type).toBe(mime);
        expect(sent.name).toBe(name);
        req.flush({ filename: 'f' });
        await p;
      });
    });
  });

  it('keeps an explicit mimetype untouched', async () => {
    const f = new File(['x'], 'n.txt', { type: 'text/x-custom' });
    const p = service.uploadKbFile(f);
    const req = http.expectOne('http://img/p1/files/kb');
    expect((req.request.body as FormData).get('file') as File).toBeTruthy();
    expect(((req.request.body as FormData).get('file') as File).type).toBe('text/x-custom');
    req.flush({ filename: 'f' });
    await p;
  });
});
