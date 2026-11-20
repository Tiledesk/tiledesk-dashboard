import { DiscoveredPage, groupPages, mergeUrls } from './kb-find-pages.util';

const page = (url: string, kind: 'page' | 'file' = 'page'): DiscoveredPage => ({ url, kind, depth: 1 });

describe('kb-find-pages util', () => {
  describe('groupPages', () => {
    it('groups web pages by first path segment, drops files and duplicates', () => {
      const groups = groupPages([
        page('https://a.com/'),
        page('https://a.com/docs/setup'),
        page('https://a.com/docs/api'),
        page('https://a.com/pricing'),
        page('https://a.com/x.pdf', 'file'),
        page('https://a.com/docs/api'),
      ]);
      expect(groups).toEqual([
        { key: '/', urls: ['https://a.com/'] },
        { key: '/docs', urls: ['https://a.com/docs/setup', 'https://a.com/docs/api'] },
        { key: '/pricing', urls: ['https://a.com/pricing'] },
      ]);
    });

    it('returns no groups for no pages or files only', () => {
      expect(groupPages([])).toEqual([]);
      expect(groupPages([page('https://a.com/x.pdf', 'file')])).toEqual([]);
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
});
