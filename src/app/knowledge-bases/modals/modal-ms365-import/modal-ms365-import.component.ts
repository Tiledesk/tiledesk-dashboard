import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { KbSourcesService } from 'app/services/kb-sources.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { BrandService } from 'app/services/brand.service';
import { KbSourceConnection, KbSourceItem, KbImportRequest } from 'app/models/kb-sources.model';
import { Subscription } from 'rxjs';

export type Ms365Step = 'account' | 'browse' | 'options';
export type Ms365ConnectState = 'idle' | 'waiting' | 'retry';

interface MsgKey { key: string; params?: any; }
interface Crumb { label: string; kind: 'roots' | 'site' | 'drive' | 'folder'; id?: string; }
interface Selected { drive_id: string; item_id: string; kind: 'folder' | 'file'; site_name?: string; name?: string; }

const MAX_SELECTED_ITEMS = 50;
const SUMMARY_ITEMS = 4;
const MB = 1048576;

@Component({
  selector: 'modal-ms365-import',
  templateUrl: './modal-ms365-import.component.html',
  styleUrls: ['./modal-ms365-import.component.scss']
})
export class ModalMs365ImportComponent implements OnInit, OnDestroy {

  step: Ms365Step = 'account';

  // ---- gating (same flags as the sitemap modal) ----
  namespace: string;
  refreshRateIsEnabled: boolean;
  isAvailableRefreshRateFeature: boolean;
  payIsVisible: boolean;
  t_params: any;
  id_project: string;
  project_name: string;
  maxFileSizeMb: number;
  salesEmail: string;
  hideHelpLink: boolean;

  // ---- step 1: account ----
  connections: KbSourceConnection[] = [];
  loadingConnections = true;
  connectState: Ms365ConnectState = 'idle';
  connectError: MsgKey | null = null;
  reconnectTarget: KbSourceConnection | null = null;
  private connectAttempt = 0;
  private relaySub: Subscription | null = null;
  lastConnectionId: string | undefined;
  popupBlocked = false;
  private initialConnectionId: string | undefined;

  // ---- step 2: browse ----
  connection: KbSourceConnection | null = null;
  crumbs: Crumb[] = [];
  items: KbSourceItem[] = [];
  nextPage: string | undefined;
  loading = false;
  browseError: string | null = null; // 'needs_reconnect' or a translation key
  private currentSite: { id: string; name: string } | null = null;
  private currentDriveId: string | undefined;
  private currentItemId: string | undefined;
  private selected = new Map<string, Selected>();
  private browseToken = 0;

  // ---- step 3: options ----
  refreshRates: { value: string; label: string }[] = [];
  selectedRefreshRate: string;
  kbTag = '';
  kbTagsArray: string[] = [];
  importing = false;
  importError: MsgKey | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalMs365ImportComponent>,
    private kbSources: KbSourcesService,
    private logger: LoggerService,
    public brandService: BrandService,
  ) {
    data = data || {};
    this.namespace = data.namespace;
    this.refreshRateIsEnabled = !!data.refreshRateIsEnabled;
    this.isAvailableRefreshRateFeature = !!data.isAvailableRefreshRateFeature;
    this.payIsVisible = data.payIsVisible;
    this.t_params = data.t_params;
    this.id_project = data.id_project;
    this.project_name = data.project_name;
    this.initialConnectionId = data.initialConnectionId;
    this.maxFileSizeMb = Math.round((data.kbMaxFileSize || 50 * MB) / MB);
    const brand = brandService.getBrand();
    this.salesEmail = brand['CONTACT_SALES_EMAIL'];
    this.hideHelpLink = brand['DOCS'];

    const feature = this.refreshRateIsEnabled && this.isAvailableRefreshRateFeature;
    this.refreshRates = feature
      ? [{ value: 'never', label: 'Never' }, { value: 'daily', label: 'Daily' },
         { value: 'weekly', label: 'Weekly' }, { value: 'monthly', label: 'Monthly' }]
      : [{ value: 'never', label: 'Never' }];
    this.selectedRefreshRate = feature ? 'weekly' : 'never';
  }

  ngOnInit(): void {
    // the popup relays its result even after connect() resolved 'closed' (window.opener cut by the
    // sign-in pages): apply it while the dialog waits for a retry
    this.relaySub = this.kbSources.relayedConnectResults$.subscribe(result => {
      if (this.connectState !== 'retry') { return; } // a pending connect() gets it itself
      this.connectAttempt++;
      this.handleConnectResult(result, this.lastConnectionId);
    });
    this.loadConnections(() => {
      if (!this.initialConnectionId) { return; }
      const conn = this.connections.find(c => c._id === this.initialConnectionId);
      this.initialConnectionId = undefined;
      if (conn) { this.chooseConnection(conn); }
    });
  }

  ngOnDestroy(): void {
    if (this.relaySub) { this.relaySub.unsubscribe(); }
    // a pending sign-in result must not touch a closed dialog
    this.connectAttempt++;
    this.browseToken++;
    this.kbSources.cancelConnect(); // close a still-open sign-in popup
  }

  get refreshRateFeatureOn(): boolean {
    return this.refreshRateIsEnabled && this.isAvailableRefreshRateFeature;
  }

  // =========================== step 1: account ===========================

  loadConnections(then?: () => void) {
    this.loadingConnections = true;
    this.kbSources.getConnections().subscribe({
      next: (conns) => {
        this.connections = conns || [];
        this.loadingConnections = false;
        if (then) { then(); }
      },
      error: (err) => {
        this.logger.error('[MODAL-MS365] getConnections error ', err);
        this.connections = [];
        this.loadingConnections = false;
        this.connectError = { key: 'KbPage.Ms365ErrConnect' };
      }
    });
  }

  /**
   * Must be called straight from a click handler: KbSourcesService.connect opens the popup
   * synchronously, so nothing may be awaited before it.
   */
  startConnect(connectionId?: string) {
    const attempt = ++this.connectAttempt;
    this.lastConnectionId = connectionId;
    this.connectState = 'waiting';
    this.connectError = null;
    this.popupBlocked = false;
    this.kbSources.connect('microsoft365', connectionId).then((result) => {
      if (attempt !== this.connectAttempt) { return; } // cancelled
      this.handleConnectResult(result, connectionId);
    });
  }

  /** Full-page sign-in when pop-ups are blocked; the page comes back with ?ms365=... */
  continueInWindow(connectionId?: string) {
    this.connectError = null;
    this.kbSources.connectInWindow('microsoft365', connectionId).catch(() => {
      this.connectState = 'retry';
      this.connectError = { key: 'KbPage.Ms365ErrConnect' };
    });
  }

  cancelConnect() {
    this.connectAttempt++;
    this.popupBlocked = false;
    this.connectState = 'idle';
    this.kbSources.cancelConnect();
  }

  private handleConnectResult(result: { status: string; reason?: string; connection_id?: string }, connectionId?: string) {
    if (result.status === 'connected') {
      this.connectState = 'idle';
      this.reconnectTarget = null;
      const newId = result.connection_id || connectionId;
      this.loadConnections(() => {
        const conn = this.connections.find(c => c._id === newId);
        if (conn) { this.chooseConnection(conn); }
      });
      return;
    }
    if (result.status === 'blocked' || result.status === 'closed') {
      this.connectState = 'retry';
      this.popupBlocked = result.status === 'blocked';
      return;
    }
    // status === 'error'
    this.connectState = 'retry';
    switch (result.reason) {
      case 'access_denied':
        this.connectError = { key: 'KbPage.Ms365ErrAccessDenied' };
        break;
      case 'account_mismatch': {
        const conn = this.connections.find(c => c._id === connectionId) || this.reconnectTarget;
        this.connectError = { key: 'KbPage.Ms365AccountMismatch', params: { upn: conn ? conn.account.upn : '' } };
        break;
      }
      default: // state_invalid, exchange_failed, connect_failed, anything else
        this.connectError = { key: 'KbPage.Ms365ErrConnect' };
    }
  }

  chooseConnection(conn: KbSourceConnection) {
    if (conn.status === 'needs_reconnect') {
      this.reconnectTarget = conn;
      this.step = 'account';
      return;
    }
    this.reconnectTarget = null;
    this.connection = { ...conn };
    this.selected.clear();
    this.step = 'browse';
    this.loadRoots();
  }

  // ============================ step 2: browse ===========================

  private resetListing() {
    this.items = [];
    this.nextPage = undefined;
    this.browseError = null;
  }

  loadRoots() {
    this.crumbs = [{ label: 'KbPage.Ms365Locations', kind: 'roots' }];
    this.currentSite = null;
    this.currentDriveId = undefined;
    this.currentItemId = undefined;
    this.resetListing();
    this.run(this.kbSources.getRoots(this.connection._id), (res) => {
      this.items = res.items || [];
    });
  }

  private loadSite(site: { id: string; name: string }) {
    this.currentSite = site;
    this.currentDriveId = undefined;
    this.currentItemId = undefined;
    this.resetListing();
    this.run(this.kbSources.getDrives(this.connection._id, site.id), (res) => {
      this.items = res.items || [];
    });
  }

  private loadChildren(driveId: string, itemId?: string, page?: string, append = false) {
    this.currentDriveId = driveId;
    this.currentItemId = itemId;
    if (!append) { this.resetListing(); }
    this.run(this.kbSources.getChildren(this.connection._id, driveId, itemId, page), (res) => {
      this.items = append ? this.items.concat(res.items || []) : (res.items || []);
      this.nextPage = res.next_page || undefined;
    });
  }

  private run(obs: any, ok: (res: any) => void) {
    const token = ++this.browseToken;
    this.loading = true;
    obs.subscribe({
      next: (res) => { if (token === this.browseToken) { this.loading = false; ok(res); } },
      error: (err) => { if (token === this.browseToken) { this.loading = false; this.onBrowseError(err); } }
    });
  }

  private onBrowseError(err: any) {
    this.logger.error('[MODAL-MS365] browse error ', err);
    const code = err && err.error && err.error.error;
    if (code === 'connection_needs_reconnect') {
      this.browseError = 'needs_reconnect';
      if (this.connection) { this.connection.status = 'needs_reconnect'; }
      return;
    }
    if (code === 'folder_not_found' || code === 'connection_not_found') { this.browseError = 'KbPage.Ms365ErrNotFound'; }
    else if (code === 'graph_forbidden') { this.browseError = 'KbPage.Ms365ErrForbidden'; }
    else if (code === 'connection_busy') { this.browseError = 'KbPage.Ms365ErrBusy'; }
    else { this.browseError = 'KbPage.Ms365ErrBrowse'; } // graph_error, invalid_page_token, site_required, ...
  }

  openItem(item: KbSourceItem) {
    if (item.kind === 'onedrive') {
      this.crumbs.push({ label: item.name, kind: 'drive', id: item.drive_id });
      this.loadChildren(item.drive_id);
    } else if (item.kind === 'site') {
      this.crumbs.push({ label: item.name, kind: 'site', id: item.id });
      this.loadSite({ id: item.id, name: item.name });
    } else if (item.kind === 'drive') {
      this.crumbs.push({ label: item.name, kind: 'drive', id: item.id });
      this.loadChildren(item.id);
    } else if (item.kind === 'folder' && item.supported !== false) {
      this.crumbs.push({ label: item.name, kind: 'folder', id: item.id });
      this.loadChildren(this.currentDriveId, item.id);
    }
  }

  goToCrumb(index: number) {
    if (index === this.crumbs.length - 1) { return; }
    this.loadCrumb(index);
  }

  /** Reloads the location the last breadcrumb stands for (used by the error retry). */
  retryBrowse() {
    this.loadCrumb(this.crumbs.length - 1);
  }

  private loadCrumb(index: number) {
    const crumb = this.crumbs[index];
    if (!crumb) { return; }
    this.crumbs = this.crumbs.slice(0, index + 1);
    if (crumb.kind === 'roots') {
      this.loadRoots();
    } else if (crumb.kind === 'site') {
      this.loadSite({ id: crumb.id, name: crumb.label });
    } else if (crumb.kind === 'drive') {
      this.loadChildren(crumb.id);
    } else {
      this.loadChildren(this.driveIdAt(index), crumb.id);
    }
  }

  private driveIdAt(index: number): string {
    for (let i = index; i >= 0; i--) {
      if (this.crumbs[i].kind === 'drive') { return this.crumbs[i].id; }
    }
    return this.currentDriveId;
  }

  loadMore() {
    if (!this.nextPage || this.loading) { return; }
    this.loadChildren(this.currentDriveId, this.currentItemId, this.nextPage, true);
  }

  // ---- selection ----

  private keyOf(item: KbSourceItem): string {
    return this.currentDriveId + ':' + item.id;
  }

  isSelectable(item: KbSourceItem): boolean {
    return (item.kind === 'folder' || item.kind === 'file') && item.supported !== false;
  }

  isSelected(item: KbSourceItem): boolean {
    return this.selected.has(this.keyOf(item));
  }

  toggleItem(item: KbSourceItem) {
    if (!this.isSelectable(item)) { return; }
    const key = this.keyOf(item);
    if (this.selected.has(key)) {
      this.selected.delete(key);
      return;
    }
    if (this.selected.size >= MAX_SELECTED_ITEMS) { return; }
    const sel: Selected = { drive_id: this.currentDriveId, item_id: item.id, kind: item.kind as 'folder' | 'file', name: item.name };
    if (this.currentSite) { sel.site_name = (this.currentSite.name || '').slice(0, 200); }
    this.selected.set(key, sel);
  }

  get selectedCount(): number { return this.selected.size; }

  /** Options step summary: the first items picked, by name. */
  get selectedPreview(): { name: string; kind: 'folder' | 'file'; tone: string }[] {
    return Array.from(this.selected.values()).slice(0, SUMMARY_ITEMS)
      .map(s => ({ name: s.name || s.item_id, kind: s.kind, tone: this.itemTone({ kind: s.kind, id: s.item_id, name: s.name || '' }) }));
  }
  get selectedMore(): number { return Math.max(0, this.selected.size - SUMMARY_ITEMS); }

  clearSelection() { this.selected.clear(); }

  // ---- display helpers ----

  get stepIndex(): number { return this.step === 'account' ? 1 : this.step === 'browse' ? 2 : 3; }

  /** At the top level the list mixes OneDrive and sites: grouped under two headings. */
  get atRoots(): boolean { return this.crumbs.length <= 1; }
  get rootOneDrive(): KbSourceItem[] { return this.items.filter(i => i.kind === 'onedrive'); }
  get rootSites(): KbSourceItem[] { return this.items.filter(i => i.kind === 'site'); }

  initials(conn: KbSourceConnection | null): string {
    const src = (conn && (conn.account.display_name || conn.account.upn)) || '?';
    const parts = src.replace(/@.*/, '').split(/[\s._-]+/).filter(Boolean);
    return ((parts[0] || '?')[0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
  }

  itemIcon(item: KbSourceItem): string {
    switch (item.kind) {
      case 'onedrive': return 'cloud';
      case 'site': return 'groups';
      case 'drive': return 'folder_special';
      case 'folder': return 'folder';
    }
    const ext = (item.name || '').split('.').pop().toLowerCase();
    return ext === 'pdf' ? 'picture_as_pdf' : ext === 'docx' ? 'article' : 'description';
  }

  /** Color family for the row icon: folder, pdf, word, text, other. */
  itemTone(item: KbSourceItem): string {
    if (item.kind === 'folder' || item.kind === 'drive') { return 'folder'; }
    if (item.kind !== 'file') { return 'place'; }
    if (item.supported === false) { return 'other'; }
    const ext = (item.name || '').split('.').pop().toLowerCase();
    return ext === 'pdf' ? 'pdf' : ext === 'docx' ? 'word' : 'text';
  }

  formatSize(bytes: number): string {
    if (!bytes && bytes !== 0) { return ''; }
    if (bytes < 1024) { return bytes + ' B'; }
    if (bytes < MB) { return Math.round(bytes / 1024) + ' KB'; }
    return (bytes / MB).toFixed(bytes < 10 * MB ? 1 : 0) + ' MB';
  }

  /** Short date: day and month this year, with the year otherwise. */
  formatModified(iso: string): string {
    if (!iso) { return ''; }
    const d = new Date(iso);
    if (isNaN(d.getTime())) { return ''; }
    const sameYear = d.getFullYear() === new Date().getFullYear();
    return d.toLocaleDateString(undefined, sameYear ? { day: 'numeric', month: 'short' } : { day: 'numeric', month: 'short', year: 'numeric' });
  }

  /**
   * Site path, to tell apart sites with the same name (all sites share the tenant host).
   * Microsoft's internal contentstorage sites (Loop, Designer) get no hint: their paths are ids.
   */
  siteHint(item: KbSourceItem): string {
    if (!item.web_url) { return ''; }
    let u: URL;
    try { u = new URL(item.web_url); } catch (e) { return ''; }
    const path = u.pathname.replace(/\/+$/, '');
    if (!path) { return u.host; }
    if (/^\/contentstorage\//i.test(path)) { return ''; }
    try { return decodeURIComponent(path); } catch (e) { return path; }
  }

  /** "Empty", "1 item" or "N items": translation key and params. */
  folderCount(item: KbSourceItem): { key: string; params?: any } {
    const n = item.child_count;
    if (n === 0) { return { key: 'KbPage.Ms365FolderEmpty' }; }
    if (n === 1) { return { key: 'KbPage.Ms365ItemOne' }; }
    return { key: 'KbPage.Ms365ItemsCount', params: { count: n } };
  }

  onRowClick(item: KbSourceItem) {
    if (item.kind === 'file') { this.toggleItem(item); return; }
    if (item.supported !== false) { this.openItem(item); }
  }
  get selectionLimitReached(): boolean { return this.selected.size >= MAX_SELECTED_ITEMS; }

  reasonKey(item: KbSourceItem): string | null {
    if (item.reason === 'too_large') { return 'KbPage.Ms365TooLarge'; }
    if (item.reason === 'unsupported_type' || item.supported === false) { return 'KbPage.Ms365Unsupported'; }
    return null;
  }

  // ========================== navigation between steps ====================

  backToAccounts() {
    this.step = 'account';
    this.connection = null;
    this.reconnectTarget = null;
    this.connectError = null;
    this.popupBlocked = false;
    this.connectState = 'idle';
    this.browseToken++;
  }

  goToOptions() {
    if (this.selectedCount === 0) { return; }
    this.importError = null;
    this.step = 'options';
  }

  backToBrowse() {
    this.importError = null;
    this.step = 'browse';
  }

  // ============================ step 3: options ===========================

  addsKbTag() {
    const tag = (this.kbTag || '').trim();
    if (tag && !this.kbTagsArray.includes(tag)) { this.kbTagsArray.push(tag); }
    this.kbTag = '';
  }

  removeKbTag(tag: string) {
    this.kbTagsArray = this.kbTagsArray.filter(t => t !== tag);
  }

  onImport() {
    if (this.importing || this.selectedCount === 0) { return; }
    const req: KbImportRequest = {
      namespace: this.namespace,
      connection_id: this.connection._id,
      // name is display-only (summary): not part of the import request
      items: Array.from(this.selected.values()).map(({ name, ...item }) => item),
      refresh_rate: this.refreshRateFeatureOn ? this.selectedRefreshRate : 'never',
      tags: this.kbTagsArray
    };
    this.importing = true;
    this.importError = null;
    this.kbSources.importItems('microsoft365', req).subscribe({
      next: (res) => {
        this.importing = false;
        this.dialogRef.close({ contents: (res && res.contents) || [] });
      },
      error: (err) => {
        this.importing = false;
        this.onImportError(err);
      }
    });
  }

  private onImportError(err: any) {
    this.logger.error('[MODAL-MS365] import error ', err);
    const body = (err && err.error) || {};
    switch (body.error) {
      case 'plan_limit':
        if (this.data && typeof this.data.onPlanLimit === 'function') { this.data.onPlanLimit(body.plan_limit); }
        break;
      case 'already_imported': this.importError = { key: 'KbPage.Ms365ErrAlreadyImported' }; break;
      case 'owned_by_other_folder': this.importError = { key: 'KbPage.Ms365ErrOwnedByOther' }; break;
      case 'too_many_files': this.importError = { key: 'KbPage.Ms365ErrTooManyFiles', params: { limit: body.limit } }; break;
      case 'refresh_not_available': this.importError = { key: 'KbPage.Ms365ErrRefreshNotAvailable' }; break;
      case 'connection_needs_reconnect':
        if (this.connection) { this.connection.status = 'needs_reconnect'; }
        this.reconnectTarget = this.connection;
        this.step = 'account';
        break;
      default: this.importError = { key: 'KbPage.Ms365ErrImport' };
    }
  }

  // ============================== misc ====================================

  contacUsViaEmail() {
    window.open(`mailto:${this.salesEmail}?subject=Enable refresh rate for project ${this.project_name} (${this.id_project})`);
  }

  goToPricing() {
    this.dialogRef.close({ upgrade_plan: true });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
