import { of, Subject, throwError } from 'rxjs';
import { ModalUrlsKnowledgeBaseComponent } from './modal-urls-knowledge-base.component';
import { CrawlDiscoverResult } from '../kb-find-pages/kb-find-pages.util';

const D = 'https://drexel.edu/cpp';
const SCAN: CrawlDiscoverResult = {
  pages: [
    { url: D + '/policy/tools', title: 'Policy tools', kind: 'page', depth: 1 },
    { url: D + '/compliance/matrix', title: 'Matrix', kind: 'page', depth: 1 },
    { url: D + '/~/media/Plan.pdf', kind: 'file', file_type: 'pdf', depth: 2 },
    { url: D + '/x.pptx', kind: 'file', file_type: 'pptx' as any, depth: 2 },
  ],
  truncated: true,
  fetched: 4,
};

function make(config: any = {}) {
  const logger: any = { log: () => {}, error: () => {}, warn: () => {}, debug: () => {} };
  const brand: any = { getBrand: () => ({}) };
  const kb = jasmine.createSpyObj('kb', ['discoverPages', 'addSitemap']);
  const closed: any[] = [];
  const dialogRef: any = { close: (b: any) => closed.push(b) };
  const appConfig: any = { getConfig: () => config };
  const m = new ModalUrlsKnowledgeBaseComponent(null, dialogRef, logger, brand, kb, {} as any, { instant: (k: string) => k } as any, appConfig);
  return { m, kb, closed };
}

describe('Import from websites wizard', () => {
  it('scans with the options, lists pages and known files unselected, then goes to step 2', () => {
    const { m, kb } = make();
    kb.discoverPages.and.returnValue(of(SCAN));
    m.method = 'scan';
    m.scanUrl = ' https://drexel.edu/cpp ';
    m.fileOptionIds.add('pdf');
    expect(m.canContinue()).toBe(true);
    m.next();
    expect(kb.discoverPages).toHaveBeenCalledWith('https://drexel.edu/cpp', 50, 45, 3, ['pdf']);
    expect(m.step).toBe(2);
    expect(m.items).toEqual([
      { url: D + '/policy/tools', title: 'Policy tools', type: undefined },
      { url: D + '/compliance/matrix', title: 'Matrix', type: undefined },
      { url: D + '/~/media/Plan.pdf', title: 'Plan.pdf', type: 'pdf' },
    ]);
    expect(m.selected.size).toBe(0);
    expect(m.truncated).toBe(true);
    expect(m.canContinue()).toBe(false);
  });

  it('does not continue from step 1 without a valid address or URLs', () => {
    const { m } = make();
    m.method = 'scan'; m.scanUrl = 'ftp://x';
    expect(m.canContinue()).toBe(false);
    m.method = 'paste'; m.pastedText = 'not a url';
    expect(m.canContinue()).toBe(false);
    m.method = 'sitemap'; m.sitemapUrl = '';
    expect(m.canContinue()).toBe(false);
  });

  it('uses the configured scan time and an emptied depth means 3', () => {
    const { m, kb } = make({ kbCrawlMaxSeconds: '240' });
    kb.discoverPages.and.returnValue(of(SCAN));
    m.scanUrl = 'https://a.com';
    m.maxDepth = null as any;
    m.maxPages = 900;
    m.next();
    expect(kb.discoverPages).toHaveBeenCalledWith('https://a.com', 300, 240, 3, []);
    expect(m.scanningText()).toEqual({ key: 'KbPage.WizardUpToMinutes', params: { n: 4 } });
  });

  it('maps scan errors and an empty result to messages', () => {
    const { m, kb } = make();
    m.scanUrl = 'https://a.com';
    kb.discoverPages.and.returnValue(throwError({ status: 504 }));
    m.next();
    expect(m.errorKey).toBe('KbPage.FindPagesTimeout');
    expect(m.loading).toBe(false);
    m.back();
    kb.discoverPages.and.returnValue(of({ pages: [], truncated: false, fetched: 0 }));
    m.next();
    expect(m.errorKey).toBe('KbPage.FindPagesNoneFound');
  });

  it('Back during a scan cancels it', () => {
    const { m, kb } = make();
    const pending = new Subject<CrawlDiscoverResult>();
    kb.discoverPages.and.returnValue(pending);
    m.scanUrl = 'https://a.com';
    m.next();
    expect(m.loading).toBe(true);
    m.back();
    expect(pending.observers.length).toBe(0);
    expect(m.step).toBe(1);
    expect(m.loading).toBe(false);
  });

  it('pasted URLs skip the Pages step and go straight to import settings, all selected', () => {
    const { m } = make();
    m.method = 'paste';
    expect(m.steps().map((x) => x.id)).toEqual([1, 3]);
    m.pastedText = 'https://a.com/x\nnope\nwww.b.com\nhttps://a.com/x';
    m.next();
    expect(m.step).toBe(3);
    expect(m.items.map((i) => i.url)).toEqual(['https://a.com/x', 'https://www.b.com']);
    expect(m.selected.size).toBe(2);
    expect(m.canImport()).toBe(true);
    m.back();
    expect(m.step).toBe(1);
  });

  it('scan and sitemap keep all three steps', () => {
    const { m } = make();
    m.method = 'scan';
    expect(m.steps().map((x) => x.id)).toEqual([1, 2, 3]);
    m.method = 'sitemap';
    expect(m.steps().length).toBe(3);
  });

  it('blocks more than 300 pasted URLs on step 1', () => {
    const { m } = make();
    m.method = 'paste';
    m.pastedText = Array.from({ length: 301 }, (_, i) => 'https://a.com/p' + i).join('\n');
    expect(m.pastedOverLimit()).toBe(true);
    expect(m.canContinue()).toBe(false);
  });

  it('shows the elapsed scan time as m:ss', () => {
    const { m } = make();
    m.elapsedSeconds = 7;
    expect(m.elapsedLabel()).toBe('0:07');
    m.elapsedSeconds = 125;
    expect(m.elapsedLabel()).toBe('2:05');
  });

  it('sitemap pages come in selected; sitemap errors are shown', () => {
    const { m, kb } = make();
    m.method = 'sitemap';
    m.sitemapUrl = 'https://a.com/sitemap.xml';
    kb.addSitemap.and.returnValue(of({ sites: ['https://a.com/1', 'https://a.com/2'] }));
    m.next();
    expect(kb.addSitemap).toHaveBeenCalledWith({ sitemap: 'https://a.com/sitemap.xml', tags: [] });
    expect(m.selected.size).toBe(2);
    m.back();
    kb.addSitemap.and.returnValue(of({ errors: [{ type: 'RequestError' }] }));
    m.next();
    expect(m.errorText).toBe('KbPage.SitemapFetchRequestError');
    expect(m.items.length).toBe(0);
  });

  it('blocks more than 300 selected items on the Pages step', () => {
    const { m, kb } = make();
    kb.addSitemap.and.returnValue(of({ sites: Array.from({ length: 301 }, (_, i) => 'https://a.com/p' + i) }));
    m.method = 'sitemap';
    m.sitemapUrl = 'https://a.com/sitemap.xml';
    m.next();
    expect(m.overLimit()).toBe(true);
    expect(m.canContinue()).toBe(false);
  });

  it('imports selected pages as the URL list and selected files with their type', () => {
    const { m, kb, closed } = make();
    kb.discoverPages.and.returnValue(of(SCAN));
    m.scanUrl = 'https://drexel.edu/cpp';
    m.next();
    m.selected = new Set([D + '/~/media/Plan.pdf', D + '/policy/tools']);
    m.next();
    expect(m.step).toBe(3);
    expect(m.selectedPageCount()).toBe(1);
    expect(m.selectedFileCount()).toBe(1);
    m.next();
    expect(closed[0].list).toEqual([D + '/policy/tools']);
    expect(closed[0].files).toEqual([{ url: D + '/~/media/Plan.pdf', type: 'pdf' }]);
  });

  it('manual extraction rules without tags block web pages, not files', () => {
    const { m, kb } = make();
    kb.discoverPages.and.returnValue(of(SCAN));
    m.scanUrl = 'https://drexel.edu/cpp';
    m.next();
    m.scrapeConfig.automaticContentExtraction = false;
    m.scrapeConfig.extract_tags = [];
    m.selected = new Set([D + '/~/media/Plan.pdf']);
    expect(m.canImport()).toBe(true);
    m.selected = new Set([D + '/policy/tools']);
    expect(m.canImport()).toBe(false);
  });
});
