import { from, Observable, of } from 'rxjs';
import { catchError, map, mergeMap, toArray } from 'rxjs/operators';

/** Linked file types the llm can index from a link (also the scan's crawl_file_types values). */
export type CrawlFileType = 'pdf' | 'docx' | 'xlsx' | 'xls' | 'csv' | 'txt' | 'md';
export const CRAWL_FILE_TYPES: CrawlFileType[] = ['pdf', 'docx', 'xlsx', 'xls', 'csv', 'txt', 'md'];

/** A URL found by POST /kb/crawl/discover. */
export interface DiscoveredPage {
  url: string;
  title?: string;
  kind: 'page' | 'file';
  file_type?: CrawlFileType;
  depth: number;
}

/** A linked file picked in the scan: imported on its own with its type, not as a web page. */
export interface PickedFile {
  url: string;
  type: CrawlFileType;
}

/** What the scan panel hands to the Add website dialog. */
export interface FindPagesPick {
  pages: string[];
  files: PickedFile[];
}

export interface CrawlDiscoverResult {
  pages: DiscoveredPage[];
  truncated: boolean;
  fetched: number;
}

/** Pages and files sharing the first path segment ("/docs"); the site root and top-level pages without one go in "/". */
export interface PageGroup {
  key: string;
  urls: string[];
}

/** Web pages and files of a known type, unique, grouped and sorted by key. */
export function groupPages(pages: DiscoveredPage[]): PageGroup[] {
  const groups = new Map<string, string[]>();
  const seen = new Set<string>();
  for (const p of pages || []) {
    if (!p || seen.has(p.url)) continue;
    if (p.kind !== 'page' && !(p.kind === 'file' && p.file_type && CRAWL_FILE_TYPES.includes(p.file_type))) continue;
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

/** File name shown for a linked file: the decoded last path segment, or the URL when there is none. */
export function fileNameOf(url: string): string {
  try {
    const last = new URL(url).pathname.split('/').filter((x) => x).pop();
    return last ? decodeURIComponent(last) : url;
  } catch (e) {
    return url;
  }
}

/**
 * Saves each picked file with POST /kb and its own type (pdf, docx…): /kb/multi would save it as a web page,
 * which fails to index. One failure does not stop the others; the result counts both.
 */
export function importPickedFiles(
  kbService: { addKb(body: any): Observable<any> },
  files: PickedFile[],
  opts: { namespace: string; refresh_rate: string; tags: string[] },
): Observable<{ saved: number; failed: number }> {
  if (!files || files.length === 0) return of({ saved: 0, failed: 0 });
  return from(files).pipe(
    // a few at a time: up to 300 files must not flood the server
    mergeMap((f) => kbService.addKb({
      name: fileNameOf(f.url), type: f.type, source: f.url,
      namespace: opts.namespace, refresh_rate: opts.refresh_rate, tags: opts.tags,
    }).pipe(map(() => true), catchError(() => of(false))), 4),
    toArray(),
    map((r) => ({ saved: r.filter((x) => x).length, failed: r.filter((x) => !x).length })),
  );
}
