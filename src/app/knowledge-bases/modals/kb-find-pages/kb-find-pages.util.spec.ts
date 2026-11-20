import { of, throwError } from 'rxjs';
import { DiscoveredPage, fileNameOf, groupPages, importPickedFiles, mergeUrls, resolveScanMaxSeconds } from './kb-find-pages.util';

const page = (url: string, kind: 'page' | 'file' = 'page', file_type?: any): DiscoveredPage => ({ url, kind, depth: 1, file_type });

describe('kb-find-pages util', () => {
  describe('groupPages', () => {
    it('groups pages and files by first path segment and drops duplicates', () => {
      const groups = groupPages([
        page('https://a.com/'),
        page('https://a.com/docs/setup'),
        page('https://a.com/docs/api'),
        page('https://a.com/pricing'),
        page('https://a.com/docs/guide.pdf', 'file', 'pdf'),
        page('https://a.com/docs/api'),
      ]);
      expect(groups).toEqual([
        { key: '/', urls: ['https://a.com/'] },
        { key: '/docs', urls: ['https://a.com/docs/setup', 'https://a.com/docs/api', 'https://a.com/docs/guide.pdf'] },
        { key: '/pricing', urls: ['https://a.com/pricing'] },
      ]);
    });

    it('drops files without a known type', () => {
      expect(groupPages([])).toEqual([]);
      expect(groupPages([page('https://a.com/x.bin', 'file')])).toEqual([]);
    });

    it('skips invalid urls', () => {
      expect(groupPages([page('not a url'), page('https://a.com/blog/p')])).toEqual([
        { key: '/blog', urls: ['https://a.com/blog/p'] },
      ]);
    });
  });

  describe('mergeUrls', () => {
    it('appends new urls after the existing lines and skips duplicates', () => {
      expect(mergeUrls(' https://a.com/x \n\n', ['https://a.com/x', 'https://a.com/y'])).toEqual({
        text: 'https://a.com/x\nhttps://a.com/y',
        added: 1,
      });
    });

    it('fills an empty box', () => {
      expect(mergeUrls('', ['https://a.com/y'])).toEqual({ text: 'https://a.com/y', added: 1 });
    });
  });

  describe('resolveScanMaxSeconds', () => {
    it('uses the configured seconds', () => {
      expect(resolveScanMaxSeconds('240')).toBe(240);
      expect(resolveScanMaxSeconds(90)).toBe(90);
    });

    it('falls back to 45 s when missing, unsubstituted or invalid', () => {
      expect(resolveScanMaxSeconds(undefined)).toBe(45);
      expect(resolveScanMaxSeconds('')).toBe(45);
      expect(resolveScanMaxSeconds('${KB_CRAWL_MAX_SECONDS}')).toBe(45);
      expect(resolveScanMaxSeconds('abc')).toBe(45);
      expect(resolveScanMaxSeconds('-5')).toBe(45);
    });

    it('keeps the value inside the llm range 30..1800', () => {
      expect(resolveScanMaxSeconds('10')).toBe(30);
      expect(resolveScanMaxSeconds('5000')).toBe(1800);
    });
  });

  describe('fileNameOf', () => {
    it('returns the decoded last path segment', () => {
      expect(fileNameOf('https://a.com/docs/My%20Guide.pdf')).toBe('My Guide.pdf');
      expect(fileNameOf('https://a.com/')).toBe('https://a.com/');
    });
  });

  describe('importPickedFiles', () => {
    const files = [
      { url: 'https://a.com/a.pdf', type: 'pdf' as const },
      { url: 'https://a.com/b.docx', type: 'docx' as const },
    ];

    it('saves each file with its own type, name, refresh rate, tags and namespace', (done) => {
      const kb = jasmine.createSpyObj('kb', ['addKb']);
      kb.addKb.and.returnValue(of({}));
      importPickedFiles(kb, files, { namespace: 'ns1', refresh_rate: 'weekly', tags: ['t'] }).subscribe((r) => {
        expect(kb.addKb.calls.allArgs()).toEqual([
          [{ name: 'a.pdf', type: 'pdf', source: 'https://a.com/a.pdf', namespace: 'ns1', refresh_rate: 'weekly', tags: ['t'] }],
          [{ name: 'b.docx', type: 'docx', source: 'https://a.com/b.docx', namespace: 'ns1', refresh_rate: 'weekly', tags: ['t'] }],
        ]);
        expect(r).toEqual({ saved: 2, failed: 0 });
        done();
      });
    });

    it('keeps going when one file fails and counts it', (done) => {
      const kb = jasmine.createSpyObj('kb', ['addKb']);
      kb.addKb.and.returnValues(throwError({ status: 500 }), of({}));
      importPickedFiles(kb, files, { namespace: 'ns1', refresh_rate: 'never', tags: [] }).subscribe((r) => {
        expect(kb.addKb).toHaveBeenCalledTimes(2);
        expect(r).toEqual({ saved: 1, failed: 1 });
        done();
      });
    });

    it('does nothing without files', (done) => {
      const kb = jasmine.createSpyObj('kb', ['addKb']);
      importPickedFiles(kb, [], { namespace: 'ns1', refresh_rate: 'never', tags: [] }).subscribe((r) => {
        expect(kb.addKb).not.toHaveBeenCalled();
        expect(r).toEqual({ saved: 0, failed: 0 });
        done();
      });
    });
  });
});
