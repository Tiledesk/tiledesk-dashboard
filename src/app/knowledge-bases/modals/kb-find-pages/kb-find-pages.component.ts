import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { AppConfigService } from 'app/services/app-config.service';
import { CrawlDiscoverResult, CrawlFileType, FindPagesPick, groupPages, PageGroup, PickedFile, resolveScanMaxSeconds } from './kb-find-pages.util';

export const FIND_PAGES_DEFAULT_MAX = 50;
export const FIND_PAGES_MAX = 300;
export const FIND_PAGES_DEFAULT_DEPTH = 3;
/** The server caps max_depth at 5 (CRAWL_DISCOVER_MAX_DEPTH). */
export const FIND_PAGES_MAX_DEPTH = 5;

/** File type options shown to the user; Excel covers both workbook formats. */
export const FILE_OPTIONS: { id: string; labelKey: string; types: CrawlFileType[] }[] = [
  { id: 'pdf', labelKey: 'KbPage.FindPagesTypePdf', types: ['pdf'] },
  { id: 'word', labelKey: 'KbPage.FindPagesTypeWord', types: ['docx'] },
  { id: 'excel', labelKey: 'KbPage.FindPagesTypeExcel', types: ['xlsx', 'xls'] },
  { id: 'csv', labelKey: 'KbPage.FindPagesTypeCsv', types: ['csv'] },
  { id: 'txt', labelKey: 'KbPage.FindPagesTypeText', types: ['txt'] },
  { id: 'md', labelKey: 'KbPage.FindPagesTypeMarkdown', types: ['md'] },
];

/**
 * "Find pages on a site" panel of the Add website dialog: scans a site through the server's crawl scan,
 * lets the user pick sections or single pages, and emits the picked URLs. It imports nothing itself.
 */
@Component({
  selector: 'app-kb-find-pages',
  templateUrl: './kb-find-pages.component.html',
  styleUrls: ['./kb-find-pages.component.scss'],
})
export class KbFindPagesComponent implements OnDestroy {
  @Output() picked = new EventEmitter<FindPagesPick>();
  @Output() closed = new EventEmitter<void>();

  readonly maxAllowed = FIND_PAGES_MAX;
  readonly maxDepthAllowed = FIND_PAGES_MAX_DEPTH;
  readonly fileOptions = FILE_OPTIONS;
  maxDepth = FIND_PAGES_DEFAULT_DEPTH;
  /** Ticked file options (ids of FILE_OPTIONS); none = web pages only. */
  fileOptionIds = new Set<string>();
  /** Type of each listed file, by URL; pages are not in it. */
  private fileTypeByUrl = new Map<string, CrawlFileType>();
  source = '';
  maxPages = FIND_PAGES_DEFAULT_MAX;
  phase: 'idle' | 'scanning' | 'picking' = 'idle';
  groups: PageGroup[] = [];
  selected = new Set<string>();
  expanded = new Set<string>();
  truncated = false;
  errorKey: string | null = null;
  elapsedSeconds = 0;
  /**
   * Scan time limit. The scan answers only when it ends, so every proxy in front of the server must
   * wait longer than this (stage ALB idle timeout: 330 s). Set per environment with KB_CRAWL_MAX_SECONDS.
   */
  maxSeconds: number;

  private scanSub: Subscription | null = null;
  private timer: any = null;

  constructor(private kbService: KnowledgeBaseService, private appConfigService: AppConfigService) {
    this.maxSeconds = resolveScanMaxSeconds(this.appConfigService.getConfig()?.kbCrawlMaxSeconds);
  }

  /** Pages and files listed. */
  get pageCount(): number {
    return this.groups.reduce((n, g) => n + g.urls.length, 0);
  }

  get fileCount(): number {
    return this.fileTypeByUrl.size;
  }

  /** The file type of a listed URL, or null for a web page. */
  typeOf(url: string): CrawlFileType | null {
    return this.fileTypeByUrl.get(url) || null;
  }

  toggleFileOption(id: string): void {
    this.fileOptionIds.has(id) ? this.fileOptionIds.delete(id) : this.fileOptionIds.add(id);
  }

  private selectedFileTypes(): CrawlFileType[] {
    return FILE_OPTIONS.filter((o) => this.fileOptionIds.has(o.id)).reduce((all, o) => all.concat(o.types), [] as CrawlFileType[]);
  }

  get selectedHasFiles(): boolean {
    for (const u of this.selected) if (this.fileTypeByUrl.has(u)) return true;
    return false;
  }

  scan(): void {
    const source = (this.source || '').trim();
    this.errorKey = null;
    if (!/^https?:\/\/\S+$/i.test(source)) {
      this.errorKey = 'KbPage.FindPagesInvalidUrl';
      return;
    }
    const max = Math.min(Math.max(Math.floor(Number(this.maxPages) || FIND_PAGES_DEFAULT_MAX), 1), FIND_PAGES_MAX);
    this.maxPages = max;
    const depth = Math.min(Math.max(Math.floor(Number(this.maxDepth)), 0), FIND_PAGES_MAX_DEPTH);
    this.maxDepth = Number.isFinite(depth) ? depth : FIND_PAGES_DEFAULT_DEPTH;
    this.stopScan();
    this.groups = [];
    this.fileTypeByUrl = new Map();
    this.selected.clear();
    this.expanded.clear();
    this.truncated = false;
    this.phase = 'scanning';
    this.startTimer();
    this.scanSub = this.kbService.discoverPages(source, max, this.maxSeconds, this.maxDepth, this.selectedFileTypes()).subscribe({
      next: (res: CrawlDiscoverResult) => this.onResult(res),
      error: (err) => this.onError(err),
    });
  }

  /** "up to a minute" for scans of 60 s or less, else "up to N minutes" (rounded up). */
  scanningText(): { key: string; params: { n?: number } } {
    return this.maxSeconds <= 60
      ? { key: 'KbPage.FindPagesScanning', params: {} }
      : { key: 'KbPage.FindPagesScanningMinutes', params: { n: Math.ceil(this.maxSeconds / 60) } };
  }

  groupState(g: PageGroup): 'all' | 'some' | 'none' {
    const on = g.urls.filter((u) => this.selected.has(u)).length;
    return on === 0 ? 'none' : on === g.urls.length ? 'all' : 'some';
  }

  selectedIn(g: PageGroup): number {
    return g.urls.filter((u) => this.selected.has(u)).length;
  }

  toggleGroup(g: PageGroup): void {
    const select = this.groupState(g) !== 'all';
    g.urls.forEach((u) => (select ? this.selected.add(u) : this.selected.delete(u)));
  }

  togglePage(url: string): void {
    this.selected.has(url) ? this.selected.delete(url) : this.selected.add(url);
  }

  toggleExpanded(g: PageGroup): void {
    this.expanded.has(g.key) ? this.expanded.delete(g.key) : this.expanded.add(g.key);
  }

  allState(): 'all' | 'some' | 'none' {
    const total = this.pageCount;
    return this.selected.size === 0 ? 'none' : this.selected.size >= total ? 'all' : 'some';
  }

  /** One checkbox for everything: selects all unless all are already selected, then clears. */
  toggleAll(): void {
    if (this.allState() === 'all') {
      this.selected.clear();
    } else {
      this.groups.forEach((g) => g.urls.forEach((u) => this.selected.add(u)));
    }
  }

  /** Picked pages and files in section order; files keep their type. */
  add(): void {
    if (this.selected.size === 0) return;
    const pages: string[] = [];
    const files: PickedFile[] = [];
    this.groups.forEach((g) => g.urls.forEach((u) => {
      if (!this.selected.has(u)) return;
      const type = this.fileTypeByUrl.get(u);
      type ? files.push({ url: u, type }) : pages.push(u);
    }));
    this.picked.emit({ pages, files });
    this.reset();
  }

  /** Esc closes this panel only: stopping the event keeps MatDialog from closing the whole dialog. */
  onEscape(event: Event): void {
    event.stopPropagation();
    this.close();
  }

  close(): void {
    this.stopScan();
    this.closed.emit();
  }

  pathOf(url: string): string {
    try {
      const u = new URL(url);
      return u.pathname + u.search;
    } catch (e) {
      return url;
    }
  }

  trackGroup = (_: number, g: PageGroup) => g.key;
  trackUrl = (_: number, u: string) => u;

  ngOnDestroy(): void {
    this.stopScan();
  }

  private onResult(res: CrawlDiscoverResult): void {
    this.stopTimer();
    this.scanSub = null;
    const listed = res && Array.isArray(res.pages) ? res.pages : [];
    this.groups = groupPages(listed);
    this.fileTypeByUrl = new Map(listed.filter((p) => p && p.kind === 'file' && p.file_type).map((p) => [p.url, p.file_type] as [string, CrawlFileType]));
    if (this.groups.length === 0) {
      this.phase = 'idle';
      this.errorKey = 'KbPage.FindPagesNoneFound';
      return;
    }
    this.truncated = !!(res && res.truncated);
    this.phase = 'picking';
  }

  private onError(err: any): void {
    this.stopTimer();
    this.scanSub = null;
    this.phase = 'idle';
    const status = err && err.status;
    this.errorKey =
      status === 504 ? 'KbPage.FindPagesTimeout'
        : status === 501 ? 'KbPage.FindPagesUnavailable'
          : 'KbPage.FindPagesFailed';
  }

  private reset(): void {
    this.phase = 'idle';
    this.groups = [];
    this.fileTypeByUrl = new Map();
    this.selected.clear();
    this.expanded.clear();
    this.truncated = false;
  }

  private startTimer(): void {
    this.stopTimer();
    this.elapsedSeconds = 0;
    this.timer = setInterval(() => this.elapsedSeconds++, 1000);
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private stopScan(): void {
    this.stopTimer();
    if (this.scanSub) {
      this.scanSub.unsubscribe();
      this.scanSub = null;
    }
    if (this.phase === 'scanning') this.phase = 'idle';
  }
}
