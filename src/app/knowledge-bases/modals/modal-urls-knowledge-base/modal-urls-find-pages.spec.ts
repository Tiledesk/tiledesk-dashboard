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
    modal.onPagesPicked(['https://a.com/x', 'https://a.com/y']);
    expect(modal.listOfUrls).toBe('https://a.com/x\nhttps://a.com/y');
    expect(modal.countSitemap).toBe(2);
    expect(modal.findPagesOpen).toBe(false);
    expect(modal.errorLimit).toBe(false);
  });

  it('flags the URL limit when the picked pages push the box past it', () => {
    const modal = makeModal();
    modal.listOfUrls = Array.from({ length: 299 }, (_, i) => 'https://a.com/p' + i).join('\n');
    modal.onPagesPicked(['https://a.com/new1', 'https://a.com/new2']);
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
});
