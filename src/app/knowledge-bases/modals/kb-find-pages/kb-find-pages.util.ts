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

export interface FilesImportResult {
  saved: number;
  /** Saved files that did not exist yet (POST /kb updates an existing file with the same type and source). */
  created: number;
  failed: number;
  /** The first error carrying `plan_limit` (content quota reached), for the usual upgrade dialog. */
  planLimitError: any;
}

/**
 * Saves each picked file with POST /kb and its own type (pdf, docx…): /kb/multi would save it as a web page,
 * which fails to index. The server keeps a refresh rate only for web pages, so none is sent. One failure does
 * not stop the others; the result counts both.
 */
export function importPickedFiles(
  kbService: { addKb(body: any): Observable<any> },
  files: PickedFile[],
  opts: { namespace: string; tags: string[]; situated_context?: boolean },
): Observable<FilesImportResult> {
  if (!files || files.length === 0) return of({ saved: 0, created: 0, failed: 0, planLimitError: null });
  return from(files).pipe(
    // a few at a time: up to 300 files must not flood the server
    mergeMap((f) => kbService.addKb({
      name: fileNameOf(f.url), type: f.type, source: f.url, namespace: opts.namespace, tags: opts.tags,
      ...(opts.situated_context === true ? { situated_context: true } : {}),
    }).pipe(
      map((resp: any) => ({ ok: true, isNew: !(resp && resp.lastErrorObject && resp.lastErrorObject.updatedExisting), err: null })),
      catchError((err) => of({ ok: false, isNew: false, err })),
    ), 4),
    toArray(),
    map((r) => ({
      saved: r.filter((x) => x.ok).length,
      created: r.filter((x) => x.ok && x.isNew).length,
      failed: r.filter((x) => !x.ok).length,
      planLimitError: (r.find((x) => x.err && x.err.error && x.err.error.plan_limit) || { err: null }).err,
    })),
  );
}

/** One row of the Import from websites picker: a web page, or a linked file when `type` is set. */
export interface PickerItem {
  url: string;
  title?: string;
  type?: CrawlFileType;
}

/** Group key of the linked files section. */
export const FILES_GROUP = 'files';

function pathSegments(url: string): string[] | null {
  try {
    return new URL(url).pathname.split('/').filter((s) => s);
  } catch (e) {
    return null;
  }
}

/**
 * How many leading path segments every URL shares ("/compliance-policy-privacy/" → 1). An item that is the
 * shared folder's own page does not end it; the first place where items go different ways does.
 */
export function sharedFolderDepth(urls: string[]): number {
  const all = (urls || []).map(pathSegments).filter((s): s is string[] => !!s);
  let d = 0;
  for (;;) {
    const deeper = all.filter((s) => s.length > d + 1);
    if (deeper.length === 0) return d;
    const folder = deeper[0][d];
    if (all.some((s) => s.length > d && s[d] !== folder)) return d;
    d++;
  }
}

/** A section holding at least this share of its parent's pages (and DOMINANT_MIN of them) is split further. */
const DOMINANT_SHARE = 0.6;
const DOMINANT_MIN = 8;

interface PathEntry { url: string; segs: string[] }

/** Splits pages by the segment at `depth`; a dominant folder is opened up into its sub-folders, recursively. */
function splitSections(entries: PathEntry[], depth: number): { path: string[]; urls: string[] }[] {
  const folderPages: PathEntry[] = [];
  const byNext = new Map<string, PathEntry[]>();
  for (const e of entries) {
    const seg = e.segs[depth];
    if (seg === undefined) { folderPages.push(e); continue; }
    if (!byNext.has(seg)) byNext.set(seg, []);
    byNext.get(seg)!.push(e);
  }
  const out: { path: string[]; urls: string[] }[] = [];
  if (folderPages.length) out.push({ path: folderPages[0].segs.slice(0, depth), urls: folderPages.map((e) => e.url) });
  byNext.forEach((list) => {
    const dominant = list.length === entries.length || (list.length >= DOMINANT_MIN && list.length > DOMINANT_SHARE * entries.length);
    const nextKinds = new Set(list.map((e) => (e.segs[depth + 1] === undefined ? '' : 'x' + e.segs[depth + 1])));
    if (dominant && nextKinds.size >= 2) {
      out.push(...splitSections(list, depth + 1));
    } else {
      out.push({ path: list[0].segs.slice(0, depth + 1), urls: list.map((e) => e.url) });
    }
  });
  return out;
}

/**
 * Sections of the picker: web pages by folder, named below the folder they all share ("/" for that folder's
 * own page or the site root, listed last). A folder holding most pages is split into its sub-folders, so a
 * single big section does not hide the site's structure. Linked files go in one FILES_GROUP section at the end.
 */
export function groupItems(items: PickerItem[]): PageGroup[] {
  const unique = new Map<string, PickerItem>();
  for (const i of items || []) if (i && i.url && !unique.has(i.url)) unique.set(i.url, i);
  const list = Array.from(unique.values());
  const files = list.filter((i) => i.type).map((i) => i.url);
  const pages: PathEntry[] = [];
  for (const i of list) {
    if (i.type) continue;
    const segs = pathSegments(i.url);
    if (segs) pages.push({ url: i.url, segs });
  }
  const shared = sharedFolderDepth(pages.map((p) => p.url));
  const merged = new Map<string, string[]>();
  for (const sec of splitSections(pages, 0)) {
    const key = '/' + sec.path.slice(shared).join('/');
    merged.set(key, (merged.get(key) || []).concat(sec.urls));
  }
  const keys = Array.from(merged.keys()).sort((x, y) => (x === '/' ? 1 : y === '/' ? -1 : x.localeCompare(y)));
  const groups: PageGroup[] = keys.map((key) => ({ key, urls: merged.get(key)! }));
  if (files.length) groups.push({ key: FILES_GROUP, urls: files });
  return groups;
}

/** Search (title or path, case-insensitive) and the All / Pages / Files filter. */
export function matchesFilter(item: PickerItem, query: string, kind: 'all' | 'pages' | 'files'): boolean {
  if (kind === 'pages' && item.type) return false;
  if (kind === 'files' && !item.type) return false;
  const q = (query || '').trim().toLowerCase();
  if (!q) return true;
  let path = item.url;
  try { const u = new URL(item.url); path = u.pathname + u.search; } catch (e) { /* keep the url */ }
  return (item.title || '').toLowerCase().includes(q) || path.toLowerCase().includes(q) || item.url.toLowerCase().includes(q);
}

/** A pasted line as an http(s) URL: "www.example.com" and "example.com/page" get https://; anything else is null. */
function pastedLineToUrl(raw: string): string | null {
  const line = (raw || '').trim();
  if (!line || /\s/.test(line)) return null;
  if (/^https?:\/\/\S+$/i.test(line)) return line;
  if (/^[a-z][a-z0-9+.-]*:/i.test(line)) return null; // another scheme (ftp:, mailto:…)
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+(:\d+)?(\/\S*)?$/i.test(line)) return 'https://' + line;
  return null;
}

/** URLs pasted one per line: trimmed, http(s) (https:// added to bare addresses), without duplicates. */
export function parsePastedUrls(text: string): string[] {
  const out: string[] = [];
  for (const raw of (text || '').split('\n')) {
    const u = pastedLineToUrl(raw);
    if (u && !out.includes(u)) out.push(u);
  }
  return out;
}

/** Non-empty pasted lines that are not web addresses (shown so nothing disappears silently). */
export function ignoredPastedLines(text: string): number {
  return (text || '').split('\n').filter((l) => l.trim() !== '' && pastedLineToUrl(l) === null).length;
}

export const FIND_PAGES_DEFAULT_MAX = 50;
export const FIND_PAGES_MAX = 300;
export const FIND_PAGES_DEFAULT_DEPTH = 3;
/** The server caps max_depth at 5 (CRAWL_DISCOVER_MAX_DEPTH). */
export const FIND_PAGES_MAX_DEPTH = 5;

/** Linked-file options shown to the user; Excel covers both workbook formats. */
export const FILE_OPTIONS: { id: string; labelKey: string; types: CrawlFileType[] }[] = [
  { id: 'pdf', labelKey: 'KbPage.FindPagesTypePdf', types: ['pdf'] },
  { id: 'word', labelKey: 'KbPage.FindPagesTypeWord', types: ['docx'] },
  { id: 'excel', labelKey: 'KbPage.FindPagesTypeExcel', types: ['xlsx', 'xls'] },
  { id: 'csv', labelKey: 'KbPage.FindPagesTypeCsv', types: ['csv'] },
  { id: 'txt', labelKey: 'KbPage.FindPagesTypeText', types: ['txt'] },
  { id: 'md', labelKey: 'KbPage.FindPagesTypeMarkdown', types: ['md'] },
];
