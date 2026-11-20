/** A URL found by POST /kb/crawl/discover. */
export interface DiscoveredPage {
  url: string;
  title?: string;
  kind: 'page' | 'file';
  depth: number;
}

export interface CrawlDiscoverResult {
  pages: DiscoveredPage[];
  truncated: boolean;
  fetched: number;
}

/** Pages sharing the first path segment ("/docs"); the site root and top-level pages without one go in "/". */
export interface PageGroup {
  key: string;
  urls: string[];
}

/** Web pages only (files are left out: this dialog saves every URL as type url), unique, grouped and sorted by key. */
export function groupPages(pages: DiscoveredPage[]): PageGroup[] {
  const groups = new Map<string, string[]>();
  const seen = new Set<string>();
  for (const p of pages || []) {
    if (!p || p.kind !== 'page' || seen.has(p.url)) continue;
    let segment: string;
    try {
      segment = new URL(p.url).pathname.split('/')[1] || '';
    } catch (e) {
      continue;
    }
    seen.add(p.url);
    const key = '/' + segment;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p.url);
  }
  return Array.from(groups.keys()).sort().map((key) => ({ key, urls: groups.get(key)! }));
}

/** Appends the picked URLs after the URLs already in the box (one per line), skipping exact duplicates. */
export function mergeUrls(existing: string, picked: string[]): { text: string; added: number } {
  const lines = (existing || '').split('\n').map((l) => l.trim()).filter((l) => l);
  const present = new Set(lines);
  let added = 0;
  for (const raw of picked || []) {
    const url = (raw || '').trim();
    if (!url || present.has(url)) continue;
    present.add(url);
    lines.push(url);
    added++;
  }
  return { text: lines.join('\n'), added };
}
