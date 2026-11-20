import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { CrawlDiscoverResult, groupPages, PageGroup } from './kb-find-pages.util';

export const FIND_PAGES_DEFAULT_MAX = 50;
export const FIND_PAGES_MAX = 300;

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
  @Output() pagesPicked = new EventEmitter<string[]>();
  @Output() closed = new EventEmitter<void>();

  readonly maxAllowed = FIND_PAGES_MAX;
  source = '';
  maxPages = FIND_PAGES_DEFAULT_MAX;
  phase: 'idle' | 'scanning' | 'picking' = 'idle';
  groups: PageGroup[] = [];
  selected = new Set<string>();
  expanded = new Set<string>();
  truncated = false;
  errorKey: string | null = null;
  elapsedSeconds = 0;

  private scanSub: Subscription | null = null;
  private timer: any = null;

  constructor(private kbService: KnowledgeBaseService) {}

  get pageCount(): number {
    return this.groups.reduce((n, g) => n + g.urls.length, 0);
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
    this.stopScan();
    this.groups = [];
    this.selected.clear();
    this.expanded.clear();
    this.truncated = false;
    this.phase = 'scanning';
    this.startTimer();
    this.scanSub = this.kbService.discoverPages(source, max).subscribe({
      next: (res: CrawlDiscoverResult) => this.onResult(res),
      error: (err) => this.onError(err),
    });
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

  selectAll(): void {
    this.groups.forEach((g) => g.urls.forEach((u) => this.selected.add(u)));
  }

  clear(): void {
    this.selected.clear();
  }

  /** Picked URLs in section order. */
  add(): void {
    if (this.selected.size === 0) return;
    const urls: string[] = [];
    this.groups.forEach((g) => g.urls.forEach((u) => this.selected.has(u) && urls.push(u)));
    this.pagesPicked.emit(urls);
    this.reset();
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
    this.groups = groupPages(res && Array.isArray(res.pages) ? res.pages : []);
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
