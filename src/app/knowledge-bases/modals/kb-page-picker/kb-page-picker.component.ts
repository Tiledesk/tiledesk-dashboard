import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FILES_GROUP, groupItems, matchesFilter, PageGroup, PickerItem } from '../kb-find-pages/kb-find-pages.util';

type Kind = 'all' | 'pages' | 'files';
type State = 'all' | 'some' | 'none';

/**
 * Step 2 of Import from websites: pick pages and linked files. Search and the All / Pages / Files filter
 * narrow what is shown; "Select all shown" and section checkboxes act on what is shown only, so a search
 * never selects hidden items. Selection is two-way: [(selected)].
 */
@Component({
  selector: 'app-kb-page-picker',
  templateUrl: './kb-page-picker.component.html',
  styleUrls: ['./kb-page-picker.component.scss'],
})
export class KbPagePickerComponent {
  @Input() set items(value: PickerItem[]) {
    this.list = value || [];
    this.byUrl = new Map(this.list.map((i) => [i.url, i]));
    this.allGroups = groupItems(this.list);
    this.expanded = new Set(this.allGroups.length <= 2 ? this.allGroups.map((g) => g.key) : []);
  }
  get items(): PickerItem[] {
    return this.list;
  }
  @Input() selected = new Set<string>();
  @Output() selectedChange = new EventEmitter<Set<string>>();

  readonly filesGroup = FILES_GROUP;
  query = '';
  kind: Kind = 'all';
  expanded = new Set<string>();
  private list: PickerItem[] = [];
  private byUrl = new Map<string, PickerItem>();
  private allGroups: PageGroup[] = [];

  /** Items left by search and filter, in section order. */
  visible(): PickerItem[] {
    return this.groups().reduce((all, g) => all.concat(g.urls.map((u) => this.byUrl.get(u)!)), [] as PickerItem[]);
  }

  /** Sections with only their shown items; empty sections are hidden. */
  groups(): PageGroup[] {
    return this.allGroups
      .map((g) => ({ key: g.key, urls: g.urls.filter((u) => matchesFilter(this.byUrl.get(u)!, this.query, this.kind)) }))
      .filter((g) => g.urls.length > 0);
  }

  countOf(kind: 'pages' | 'files'): number {
    return this.list.filter((i) => (kind === 'files' ? !!i.type : !i.type)).length;
  }

  item(url: string): PickerItem {
    return this.byUrl.get(url)!;
  }

  pathOf(url: string): string {
    try {
      const u = new URL(url);
      return u.pathname + u.search;
    } catch (e) {
      return url;
    }
  }

  isOpen(g: PageGroup): boolean {
    return this.expanded.has(g.key) || !!this.query.trim();
  }

  toggleOpen(g: PageGroup): void {
    this.expanded.has(g.key) ? this.expanded.delete(g.key) : this.expanded.add(g.key);
  }

  allShownState(): State {
    return this.stateOf(this.visible().map((i) => i.url));
  }

  groupState(g: PageGroup): State {
    return this.stateOf(g.urls);
  }

  selectedIn(g: PageGroup): number {
    return g.urls.filter((u) => this.selected.has(u)).length;
  }

  toggleAllShown(): void {
    this.setMany(this.visible().map((i) => i.url), this.allShownState() !== 'all');
  }

  toggleGroup(g: PageGroup): void {
    this.setMany(g.urls, this.groupState(g) !== 'all');
  }

  togglePage(url: string): void {
    this.setMany([url], !this.selected.has(url));
  }

  trackGroup = (_: number, g: PageGroup) => g.key;
  trackUrl = (_: number, u: string) => u;

  private stateOf(urls: string[]): State {
    const on = urls.filter((u) => this.selected.has(u)).length;
    return on === 0 ? 'none' : on === urls.length ? 'all' : 'some';
  }

  private setMany(urls: string[], on: boolean): void {
    const next = new Set(this.selected);
    urls.forEach((u) => (on ? next.add(u) : next.delete(u)));
    this.selected = next;
    this.selectedChange.emit(next);
  }
}
