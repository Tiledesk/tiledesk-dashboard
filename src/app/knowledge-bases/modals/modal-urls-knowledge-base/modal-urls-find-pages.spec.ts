import { ModalUrlsKnowledgeBaseComponent } from './modal-urls-knowledge-base.component';

function makeModal(): ModalUrlsKnowledgeBaseComponent {
  const logger: any = { log: () => {}, error: () => {}, debug: () => {} };
  const brand: any = { getBrand: () => ({}) };
  return new ModalUrlsKnowledgeBaseComponent(null, {} as any, logger, brand, {} as any, {} as any, { instant: (k: string) => k } as any);
}

describe('ModalUrlsKnowledgeBaseComponent — find pages on a site', () => {
  it('appends the picked pages without duplicates and closes the panel', () => {
    const modal = makeModal();
    modal.findPagesOpen = true;
    modal.listOfUrls = 'https://a.com/x';
    modal.onPicked({ pages: ['https://a.com/x', 'https://a.com/y'], files: [] });
    expect(modal.listOfUrls).toBe('https://a.com/x\nhttps://a.com/y');
    expect(modal.countSitemap).toBe(2);
    expect(modal.findPagesOpen).toBe(false);
    expect(modal.errorLimit).toBe(false);
  });

  it('flags the URL limit when the picked pages push the box past it', () => {
    const modal = makeModal();
    modal.listOfUrls = Array.from({ length: 299 }, (_, i) => 'https://a.com/p' + i).join('\n');
    modal.onPicked({ pages: ['https://a.com/new1', 'https://a.com/new2'], files: [] });
    expect(modal.countSitemap).toBe(301);
    expect(modal.errorLimit).toBe(true);
    expect(modal.buttonDisabled).toBe(true);
  });

  it('opening one panel closes the other', () => {
    const modal = makeModal();
    modal.sitemapInputOpen = true;
    modal.toggleFindPages();
    expect(modal.findPagesOpen).toBe(true);
    expect(modal.sitemapInputOpen).toBe(false);
    modal.toggleSitemapInput();
    expect(modal.sitemapInputOpen).toBe(true);
    expect(modal.findPagesOpen).toBe(false);
  });

  it('keeps picked files apart from the URL box, without duplicates, and counts them', () => {
    const modal = makeModal();
    modal.listOfUrls = '';
    const pdf = { url: 'https://a.com/a.pdf', type: 'pdf' as const };
    modal.onPicked({ pages: ['https://a.com/p'], files: [pdf] });
    modal.onPicked({ pages: [], files: [pdf, { url: 'https://a.com/b.csv', type: 'csv' as const }] });
    expect(modal.listOfUrls).toBe('https://a.com/p');
    expect(modal.pickedFiles.map((f) => f.url)).toEqual(['https://a.com/a.pdf', 'https://a.com/b.csv']);
    expect(modal.itemCount).toBe(3);
    modal.removeFile('https://a.com/a.pdf');
    expect(modal.pickedFiles.map((f) => f.url)).toEqual(['https://a.com/b.csv']);
    expect(modal.itemCount).toBe(2);
  });

  it('counts files in the 300 limit', () => {
    const modal = makeModal();
    modal.listOfUrls = Array.from({ length: 299 }, (_, i) => 'https://a.com/p' + i).join('\n');
    modal.onPicked({ pages: [], files: [{ url: 'https://a.com/a.pdf', type: 'pdf' }, { url: 'https://a.com/b.pdf', type: 'pdf' }] });
    expect(modal.errorLimit).toBe(true);
    expect(modal.buttonDisabled).toBe(true);
  });

  it('sends the picked files with the import, also without URLs', () => {
    const modal = makeModal();
    let closedWith: any;
    (modal as any).dialogRef = { close: (b: any) => (closedWith = b) };
    modal.listOfUrls = '';
    modal.onPicked({ pages: [], files: [{ url: 'https://a.com/a.pdf', type: 'pdf' }] });
    expect(modal.canImport()).toBe(true);
    modal.onSaveKnowledgeBase();
    expect(closedWith.list).toEqual([]);
    expect(closedWith.files).toEqual([{ url: 'https://a.com/a.pdf', type: 'pdf' }]);
  });
});
