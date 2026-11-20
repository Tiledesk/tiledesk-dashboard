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

/** Scan time used when `kbCrawlMaxSeconds` is not set: fits behind a load balancer that drops requests idle for 60 s. */
export const SCAN_MAX_SECONDS_FALLBACK = 45;
/** The llm accepts 30..1800 s for /crawl/discover; the server may cap it lower (KB_CRAWL_DISCOVER_MAX_SECONDS). */
export const SCAN_MAX_SECONDS_MIN = 30;
export const SCAN_MAX_SECONDS_MAX = 1800;

/** `kbCrawlMaxSeconds` from dashboard-config.json (env KB_CRAWL_MAX_SECONDS): missing or invalid → 45 s, else clamped to 30..1800. */
export function resolveScanMaxSeconds(rawValue: unknown): number {
  if (rawValue == null || rawValue === '') return SCAN_MAX_SECONDS_FALLBACK;
  const seconds = typeof rawValue === 'number' ? rawValue : Number(String(rawValue).trim());
  if (!Number.isFinite(seconds) || seconds <= 0) return SCAN_MAX_SECONDS_FALLBACK;
  return Math.min(Math.max(Math.round(seconds), SCAN_MAX_SECONDS_MIN), SCAN_MAX_SECONDS_MAX);
}
