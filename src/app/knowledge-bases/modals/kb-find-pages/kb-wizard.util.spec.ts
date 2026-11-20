import { groupItems, ignoredPastedLines, matchesFilter, parsePastedUrls, PickerItem, sharedFolderDepth } from './kb-find-pages.util';

const D = 'https://drexel.edu/compliance-policy-privacy';
const drexel: PickerItem[] = [
  { url: D, title: 'Home' },
  { url: D + '/policy', title: 'Policy' },
  { url: D + '/policy/tools', title: 'Tools' },
  { url: D + '/compliance/matrix', title: 'Matrix' },
  { url: D + '/~/media/PDFs/Plan.pdf', title: 'Plan.pdf', type: 'pdf' },
];

describe('wizard helpers', () => {
  describe('sharedFolderDepth', () => {
    it('skips the folder all items share, even when one item is that folder page', () => {
      expect(sharedFolderDepth(drexel.map((i) => i.url))).toBe(1);
    });
    it('finds /3/ on docs.python.org', () => {
      expect(sharedFolderDepth(['https://d.org/3/library/os.html', 'https://d.org/3/tutorial/', 'https://d.org/3/glossary.html'])).toBe(1);
    });
    it('is 0 when pages sit in different top folders or at the root', () => {
      expect(sharedFolderDepth(['https://t.com/', 'https://t.com/blog/a', 'https://t.com/pricing/'])).toBe(0);
      expect(sharedFolderDepth(['https://t.com/a/x'])).toBe(1);
      expect(sharedFolderDepth([])).toBe(0);
    });
  });

  describe('groupItems', () => {
    it('groups pages below the shared folder, folder page in "/", files last', () => {
      expect(groupItems(drexel).map((g) => [g.key, g.urls.length])).toEqual([
        ['/compliance', 1], ['/policy', 2], ['/', 1], ['files', 1],
      ]);
    });
    it('keeps top-level grouping when nothing is shared', () => {
      const items = ['https://t.com/', 'https://t.com/blog/a', 'https://t.com/blog/b', 'https://t.com/pricing/'].map((url) => ({ url }));
      expect(groupItems(items).map((g) => [g.key, g.urls.length])).toEqual([['/blog', 2], ['/pricing', 1], ['/', 1]]);
    });
    it('splits a section that holds most pages into its sub-folders, even with a page outside it', () => {
      const items: PickerItem[] = [{ url: D }, { url: 'https://drexel.edu/privacy' }];
      for (let i = 0; i < 10; i++) items.push({ url: D + '/policy/p' + i });
      for (let i = 0; i < 8; i++) items.push({ url: D + '/compliance/c' + i });
      expect(groupItems(items).map((g) => [g.key, g.urls.length])).toEqual([
        ['/compliance-policy-privacy', 1],
        ['/compliance-policy-privacy/compliance', 8],
        ['/compliance-policy-privacy/policy', 10],
        ['/privacy', 1],
      ]);
    });

    it('keeps a small or balanced section whole', () => {
      const items = ['https://t.com/a/x', 'https://t.com/a/y', 'https://t.com/b/z', 'https://t.com/b/w'].map((url) => ({ url }));
      expect(groupItems(items).map((g) => g.key)).toEqual(['/a', '/b']);
    });

    it('drops duplicates', () => {
      expect(groupItems([{ url: D + '/a/x' }, { url: D + '/a/x' }])[0].urls.length).toBe(1);
    });
  });

  describe('matchesFilter', () => {
    it('matches title or path, case-insensitive, and the kind', () => {
      expect(matchesFilter(drexel[2], 'TOOLS', 'all')).toBe(true);
      expect(matchesFilter(drexel[2], 'policy/to', 'pages')).toBe(true);
      expect(matchesFilter(drexel[2], '', 'files')).toBe(false);
      expect(matchesFilter(drexel[4], 'plan', 'files')).toBe(true);
      expect(matchesFilter(drexel[4], 'nothing', 'all')).toBe(false);
    });
  });

  describe('parsePastedUrls', () => {
    it('keeps unique http(s) lines, trimmed', () => {
      expect(parsePastedUrls(' https://a.com/x \n\nftp://b\nhttps://a.com/x\nnot a url\nhttp://c.com')).toEqual(['https://a.com/x', 'http://c.com']);
    });
    it('adds https:// to addresses typed without it', () => {
      expect(parsePastedUrls('www.example.com\nexample.org/docs/a\nhttps://example.org/docs/a')).toEqual(['https://www.example.com', 'https://example.org/docs/a']);
    });
    it('counts the lines it cannot use', () => {
      expect(ignoredPastedLines('https://a.com\nnot a url\n\nftp://b\nwww.c.com')).toBe(2);
    });
  });
});
