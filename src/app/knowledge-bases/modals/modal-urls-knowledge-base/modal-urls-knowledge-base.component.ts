import { Component, OnInit, Output, EventEmitter, SimpleChanges, Inject, OnDestroy, ViewChild, ElementRef } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KB_LIMIT_CONTENT, URL_kb_contents_tags } from 'app/utils/util';
import { MAT_DIALOG_DATA, MatDialog,  MatDialogRef } from '@angular/material/dialog';
import { LoggerService } from 'app/services/logger/logger.service';
import { BrandService } from 'app/services/brand.service';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { TranslateService } from '@ngx-translate/core';
import { buildDefaultKbScrapeConfig, KbScrapeConfig } from 'app/models/kb-scrape-config-model';
import { ModalKbScrapeSettingsComponent } from '../modal-kb-scrape-settings/modal-kb-scrape-settings.component';
import { Subscription } from 'rxjs';
import { AppConfigService } from 'app/services/app-config.service';
import {
  CRAWL_FILE_TYPES, CrawlDiscoverResult, CrawlFileType, FILE_OPTIONS, FIND_PAGES_DEFAULT_DEPTH, FIND_PAGES_DEFAULT_MAX,
  FIND_PAGES_MAX, FIND_PAGES_MAX_DEPTH, fileNameOf, ignoredPastedLines, parsePastedUrls, PickerItem, resolveScanMaxSeconds,
} from '../kb-find-pages/kb-find-pages.util';


@Component({
  selector: 'modal-urls-knowledge-base',
  templateUrl: './modal-urls-knowledge-base.component.html',
  styleUrls: ['./modal-urls-knowledge-base.component.scss']
})
export class ModalUrlsKnowledgeBaseComponent implements OnInit, OnDestroy {

  @Output() saveKnowledgeBase = new EventEmitter();
  @Output() closeBaseModal = new EventEmitter();

  KB_LIMIT_CONTENT = KB_LIMIT_CONTENT;

  // -----------------------------------------------------------------------
  // Wizard: 1 Website (scan a site / sitemap / paste URLs) · 2 Pages · 3 Import settings
  // -----------------------------------------------------------------------
  step: 1 | 2 | 3 = 1;
  method: 'scan' | 'sitemap' | 'paste' = 'scan';
  readonly fileOptions = FILE_OPTIONS;
  readonly maxPagesAllowed = FIND_PAGES_MAX;
  readonly maxDepthAllowed = FIND_PAGES_MAX_DEPTH;
  scanUrl = '';
  sitemapUrl = '';
  pastedText = '';
  maxPages = FIND_PAGES_DEFAULT_MAX;
  maxDepth = FIND_PAGES_DEFAULT_DEPTH;
  /** Ticked linked-file options (ids of FILE_OPTIONS); none = web pages only. */
  fileOptionIds = new Set<string>();
  scanOptionsOpen = false;
  /** Scan time limit (kbCrawlMaxSeconds / KB_CRAWL_MAX_SECONDS, 45 s when unset). */
  maxSeconds: number;
  /** What step 2 lists; files carry their type. */
  items: PickerItem[] = [];
  selected = new Set<string>();
  loading = false;
  truncated = false;
  /** Translation key of a scan/paste problem shown in step 2. */
  errorKey: string | null = null;
  /** Already translated sitemap problem (from the sitemap API errors). */
  errorText: string | null = null;
  elapsedSeconds = 0;
  private loadSub: Subscription | null = null;
  private timer: any = null;

    // -----------------------------------------------------------------------
  // Scrape settings — data flow between components
  // -----------------------------------------------------------------------
  // The body sent to the server is assembled in `onSaveKnowledgeBase()` from
  // two distinct sources:
  //
  //   1. Parent-owned fields (this component) — modal-specific data that
  //      lives here and ONLY here:
  //        - `urls`                → body.name / body.source
  //        - `selectedRefreshRate` → body.refresh_rate
  //        - `kbTagsArray`         → body.tags
  //        - `selectedNamespace`   → body.namespace
  //        - `type` (constant)     → body.type
  //
  //   2. Shared scraping settings (`KbScrapeConfig`) — owned by THIS parent
  //      but edited by the shared child `<app-kb-scrape-settings>` (rendered
  //      either inline or inside `ModalKbScrapeSettingsComponent` as a
  //      side-by-side dialog). The child mutates the same reference in place,
  //      so changes are visible here without explicit @Output events. Maps to:
  //        - `automaticContentExtraction` → body.scrape_type (0 if true, else `selectedScrapeType`)
  //        - `situatedContextEnabled`     → body.situated_context
  //        - `extract_tags` / `unwanted_tags` / `unwanted_classnames`
  //                                       → body.scrape_options.* (only when scrape_type === 4)
  //
  // Lifecycle:
  //   parent creates `scrapeConfig` (default values) ──▶ passed by reference
  //   ──▶ via `[config]` (inline) or via `MAT_DIALOG_DATA.config` (side-by-side dialog)
  //   ──▶ `<app-kb-scrape-settings>` mutates `scrapeConfig.*`
  //   ──▶ on save, parent reads `this.scrapeConfig.*` and merges with its own
  //       fields into the final body sent to the server.
  // -----------------------------------------------------------------------
  /** Shared scrape settings; mutated in place by `<app-kb-scrape-settings>` and read at save time. */
  scrapeConfig: KbScrapeConfig = buildDefaultKbScrapeConfig();
  /** Reference to the side-by-side scrape settings dialog. Kept so we can close it on cancel/save/destroy. */
  private scrapeSettingsDialogRef: MatDialogRef<ModalKbScrapeSettingsComponent> | null = null;
  /** Drives the gear/minus icon swap in the header (mirrors `isopenasetting` in modal-preview-knowledge-base). */
  isScrapeSettingsOpen = false;


  // ---------------------
  // Refressh rate
  // ---------------------
  refresh_rate: Array<any> = [ 
    { name: "Never", value: 'never' },
    { name: "Daily", value: 'daily' },
    { name: "Weekly", value: 'weekly' },
    { name: "Monthly", value: 'monthly'}
  ]

  // selectedRefreshRate = 0;
  selectedRefreshRate: any;
  isAvailableRefreshRateFeature: boolean;
  refreshRateIsEnabled : boolean;
  id_project: string;
  project_name : string;
  payIsVisible:  boolean;
  t_params: any;
  salesEmail: string;

  // KB Tags
  kbTag: string = '';
  kbTagsArray = []
  @ViewChild('kbTagsContainer') kbTagsContainer!: ElementRef;
  private observer!: MutationObserver;
  tagContainerElementHeight: any;

  public hideHelpLink: boolean;

  isOpen = false;
  private closeTimeout: any;
  
  positions: ConnectedPosition[] = [
    {
      originX: 'start',
      originY: 'center',
      overlayX: 'end',
      overlayY: 'center',
      offsetX: -30
    }
  ];

  // ---------------------------------------------------------------
  // Refresh-rate help popover (replaces the legacy mat-tooltip).
  // Mirrors the kb-tags hover-popover pattern: isolated state so the
  // two popovers don't share the same `isOpen` flag, but reuses the
  // same `positions` array (popover to the left of the trigger, arrow
  // on its right edge) for visual consistency with kb-tags.
  // ---------------------------------------------------------------
  isRefreshRateHelpOpen = false;
  private refreshRateHelpCloseTimeout: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalUrlsKnowledgeBaseComponent>,
    private logger: LoggerService,
    public brandService: BrandService,
    private kbService: KnowledgeBaseService,
    private dialog: MatDialog,
    private translate: TranslateService,
    private appConfigService: AppConfigService,
  ) {
    this.selectedRefreshRate = this.refresh_rate[0].value;
    this.maxSeconds = resolveScanMaxSeconds(this.appConfigService?.getConfig()?.kbCrawlMaxSeconds);
    this.logger.log("[MODALS-URLS] data: ", data);
    if (data ) {
      this.isAvailableRefreshRateFeature = data.isAvailableRefreshRateFeature;
      this.refreshRateIsEnabled =  data.refreshRateIsEnabled;
      this.t_params = data.t_params;
      this.id_project = data.id_project;
      this.project_name = data.project_name;
      this.payIsVisible =  data.payIsVisible;
      this.logger.log("[MODALS-URLS] data > t_params: ", this.t_params);
      this.logger.log("[MODALS-URLS] data > isAvailableRefreshRateFeature: ", this.isAvailableRefreshRateFeature);
      this.logger.log("[MODALS-URLS] data > refreshRateIsEnabled: ", this.refreshRateIsEnabled);
      this.logger.log("[MODALS-URLS] data > id_project: ", this.id_project);
      this.logger.log("[MODALS-URLS] data > project_name: ", this.project_name);
      this.logger.log("[MODALS-URLS] data > payIsVisible: ", this.payIsVisible);
    } 
    const brand = brandService.getBrand();
    this.salesEmail = brand['CONTACT_SALES_EMAIL'];
    this.hideHelpLink = brand['DOCS'];
  }


  ngOnInit(): void {
   // this.hasStoredScrapeOptions()
  }

  ngAfterViewInit() {
    this.initTagContainerObserver();
  }

  ngOnChanges(changes: SimpleChanges){
    // this.logger.log('ModalSiteMapComponent changes: ', changes);
    // if(this.listSitesOfSitemap.length > 0){
    //   this.listOfUrls = this.listSitesOfSitemap.join('\n');
    //   this.countSitemap = this.listSitesOfSitemap.length;
    // } 
  }

  ngOnDestroy() { 
    this.logger.log('[MODALS-URLS] ngOnDestroy called');
    // Disconnect the observer to avoid memory leaks.
    if (this.observer) {
      this.observer.disconnect();
    }
    // Cascade-close the side-by-side scrape settings dialog if still open.
    this.closeScrapeSettingsDialog();
    this.stopLoading();
  }

   // CDK methods
  open() {
    clearTimeout(this.closeTimeout);
    this.isOpen = true;
  }

  scheduleClose() {
    this.closeTimeout = setTimeout(() => {
      this.isOpen = false;
    }, 150);
  }

  cancelClose() {
    clearTimeout(this.closeTimeout);
  }

  // ---- Refresh-rate help popover handlers (CDK-overlay) ----
  openRefreshRateHelp() {
    clearTimeout(this.refreshRateHelpCloseTimeout);
    this.isRefreshRateHelpOpen = true;
  }

  scheduleCloseRefreshRateHelp() {
    this.refreshRateHelpCloseTimeout = setTimeout(() => {
      this.isRefreshRateHelpOpen = false;
    }, 150);
  }

  cancelCloseRefreshRateHelp() {
    clearTimeout(this.refreshRateHelpCloseTimeout);
  }

  chooseMethod(method: 'scan' | 'sitemap' | 'paste'): void {
    this.method = method;
  }

  toggleFileOption(id: string): void {
    this.fileOptionIds.has(id) ? this.fileOptionIds.delete(id) : this.fileOptionIds.add(id);
  }

  /** Steps shown for the chosen method: pasted URLs need no Pages step. */
  steps(): { id: 1 | 2 | 3; labelKey: string }[] {
    const all: { id: 1 | 2 | 3; labelKey: string }[] = [
      { id: 1, labelKey: 'KbPage.WizardStepWebsite' },
      { id: 2, labelKey: 'KbPage.WizardStepPages' },
      { id: 3, labelKey: 'KbPage.WizardStepSettings' },
    ];
    return this.method === 'paste' ? all.filter((x) => x.id !== 2) : all;
  }

  pastedOverLimit(): boolean {
    return parsePastedUrls(this.pastedText).length > KB_LIMIT_CONTENT;
  }

  /** Scan time so far as m:ss. */
  elapsedLabel(): string {
    const s = Math.max(0, Math.floor(this.elapsedSeconds));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  /** Whether the footer's primary button can go on from the current step. */
  canContinue(): boolean {
    if (this.step === 1) {
      if (this.method === 'scan') return /^https?:\/\/\S+$/i.test((this.scanUrl || '').trim());
      if (this.method === 'sitemap') return /^https?:\/\/\S+$/i.test((this.sitemapUrl || '').trim());
      const n = parsePastedUrls(this.pastedText).length;
      return n > 0 && n <= KB_LIMIT_CONTENT;
    }
    if (this.step === 2) return !this.loading && this.selected.size > 0 && !this.overLimit();
    return this.canImport();
  }

  next(): void {
    if (!this.canContinue()) return;
    if (this.step === 1) {
      this.load();
      // pasted URLs are already the selection: straight to the import settings
      this.step = this.method === 'paste' ? 3 : 2;
    } else if (this.step === 2) {
      this.step = 3;
    } else {
      this.onSaveKnowledgeBase();
    }
  }

  back(): void {
    if (this.step === 2) this.stopLoading();
    if (this.step === 3 && this.method === 'paste') {
      this.step = 1;
    } else if (this.step > 1) {
      this.step = (this.step - 1) as 1 | 2;
    }
  }

  /** Short host of the scanned site, for the progress title. */
  scanHost(): string {
    try {
      return new URL(this.scanUrl.trim()).host;
    } catch (e) {
      return this.scanUrl;
    }
  }

  ignoredPasted(): number {
    return ignoredPastedLines(this.pastedText);
  }

  clearSelection(): void {
    this.selected = new Set();
  }

  overLimit(): boolean {
    return this.selected.size > KB_LIMIT_CONTENT;
  }

  selectedPageCount(): number {
    return this.items.filter((i) => !i.type && this.selected.has(i.url)).length;
  }

  selectedFileCount(): number {
    return this.items.filter((i) => !!i.type && this.selected.has(i.url)).length;
  }

  /** The first selected items, for the step 3 summary list. */
  summaryItems(max = 5): PickerItem[] {
    return this.items.filter((i) => this.selected.has(i.url)).slice(0, max);
  }

  canImport(): boolean {
    if (this.selected.size === 0 || this.overLimit()) return false;
    // manual extraction rules (tags) apply to web pages only; files are parsed by type
    return this.selectedPageCount() === 0 || this.scrapeConfig.automaticContentExtraction || this.scrapeConfig.extract_tags.length > 0;
  }

  /** "up to a minute" for scans of 60 s or less, else "up to N minutes" (rounded up). */
  scanningText(): { key: string; params: { n?: number } } {
    return this.maxSeconds <= 60
      ? { key: 'KbPage.WizardUpToMinute', params: {} }
      : { key: 'KbPage.WizardUpToMinutes', params: { n: Math.ceil(this.maxSeconds / 60) } };
  }

  /** Step 2 content for the chosen method; a new load replaces the previous items and selection. */
  private load(): void {
    this.stopLoading();
    this.items = [];
    this.selected = new Set();
    this.truncated = false;
    this.errorKey = null;
    this.errorText = null;
    if (this.method === 'paste') {
      this.items = parsePastedUrls(this.pastedText).map((url) => ({ url }));
      this.selected = new Set(this.items.map((i) => i.url));
      return;
    }
    this.loading = true;
    if (this.method === 'sitemap') {
      this.loadSub = this.kbService.addSitemap({ sitemap: this.sitemapUrl.trim(), tags: this.kbTagsArray }).subscribe({
        next: (resp: any) => {
          this.finishLoading();
          const apiErrors = Array.isArray(resp?.errors) ? resp.errors : [];
          if (apiErrors.length > 0) {
            this.errorText = this.formatSitemapApiErrors(apiErrors);
            return;
          }
          const sites: string[] = Array.isArray(resp?.sites) ? resp.sites : [];
          if (sites.length === 0) {
            this.errorText = this.translate.instant('KbPage.SitemapFetchNoUrls');
            return;
          }
          this.items = Array.from(new Set(sites)).map((url) => ({ url }));
          this.selected = new Set(this.items.map((i) => i.url));
        },
        error: (err) => {
          this.finishLoading();
          this.logger.error('[MODALS-URLS] addSitemap error:', err);
          this.errorText = this.translate.instant('KbPage.SitemapFetchFailed');
        },
      });
      return;
    }
    // scan a site
    this.maxPages = Math.min(Math.max(Math.floor(Number(this.maxPages) || FIND_PAGES_DEFAULT_MAX), 1), FIND_PAGES_MAX);
    // an emptied depth means "default", an explicit 0 means "start page only"
    const rawDepth = this.maxDepth === null || this.maxDepth === undefined || (this.maxDepth as any) === '' ? NaN : Number(this.maxDepth);
    this.maxDepth = Number.isFinite(rawDepth) ? Math.min(Math.max(Math.floor(rawDepth), 0), FIND_PAGES_MAX_DEPTH) : FIND_PAGES_DEFAULT_DEPTH;
    const fileTypes = FILE_OPTIONS.filter((o) => this.fileOptionIds.has(o.id)).reduce((all, o) => all.concat(o.types), [] as CrawlFileType[]);
    this.elapsedSeconds = 0;
    this.timer = setInterval(() => this.elapsedSeconds++, 1000);
    this.loadSub = this.kbService.discoverPages(this.scanUrl.trim(), this.maxPages, this.maxSeconds, this.maxDepth, fileTypes).subscribe({
      next: (res: CrawlDiscoverResult) => {
        this.finishLoading();
        const listed = res && Array.isArray(res.pages) ? res.pages : [];
        const seen = new Set<string>();
        this.items = listed
          .filter((p) => p && p.url && (p.kind === 'page' || (p.kind === 'file' && !!p.file_type && CRAWL_FILE_TYPES.includes(p.file_type))))
          .filter((p) => (seen.has(p.url) ? false : (seen.add(p.url), true)))
          .map((p) => ({ url: p.url, title: p.title || (p.kind === 'file' ? fileNameOf(p.url) : undefined), type: p.kind === 'file' ? p.file_type : undefined }));
        if (this.items.length === 0) {
          this.errorKey = 'KbPage.FindPagesNoneFound';
          return;
        }
        this.truncated = !!(res && res.truncated);
      },
      error: (err) => {
        this.finishLoading();
        const status = err && err.status;
        this.errorKey = status === 504 ? 'KbPage.FindPagesTimeout' : status === 501 ? 'KbPage.FindPagesUnavailable' : 'KbPage.FindPagesFailed';
      },
    });
  }

  private finishLoading(): void {
    this.loading = false;
    this.loadSub = null;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private stopLoading(): void {
    if (this.loadSub) this.loadSub.unsubscribe();
    this.finishLoading();
  }

  private formatSitemapApiErrors(errors: Array<{ message?: string; type?: string }>): string {
    this.logger.warn('[MODALS-URLS] sitemap API errors:', errors);

    const primaryType = (errors[0]?.type || '').trim();
    if (primaryType === 'RequestError') {
      return this.translate.instant('KbPage.SitemapFetchRequestError');
    }

    return this.translate.instant('KbPage.SitemapFetchFailed');
  }

  onSelectRefreshRate(refreshRateSelected) {
    this.logger.log("[MODALS-URLS] onSelectRefreshRate: ", refreshRateSelected);
  }

  // KB TAGS
  addsKbTag(kbTag) {
    if (kbTag && kbTag.trim() !== '') {
      const trimmedTag = kbTag.trim();
      // Verifica che il tag non sia già presente
      if (!this.kbTagsArray.includes(trimmedTag)) {
        this.kbTagsArray.push(trimmedTag);
        this.logger.log("[MODALS-URLS] addsKbTags kbTagsArray: ", this.kbTagsArray);
      }
      // Svuota l'input dopo aver aggiunto il tag
      this.kbTag = '';
    }
    // L'observer gestirà automaticamente l'aggiornamento dell'altezza
  }

  removeKbTag(kbTagName){
    const index =  this.kbTagsArray.findIndex((tag) => tag === kbTagName);
    this.logger.log("[MODALS-URLS] removeKbTags index: ", index);
    this.kbTagsArray.splice(index, 1)
    this.logger.log("[MODALS-URLS] removeKbTags kbTagsArray: ", this.kbTagsArray);
    // L'observer gestirà automaticamente l'aggiornamento dell'altezza
  }

  onSaveKnowledgeBase(){
    // Close the side-by-side settings dialog (if open) before resolving the parent dialog.
    this.closeScrapeSettingsDialog();
    const picked = this.items.filter((i) => this.selected.has(i.url));
    // `scrape_type: 0` means automatic content extraction; any other value
    // (currently only 4 = "Advanced") means manual rules. We always send
    // `scrape_options` regardless of the mode so the server can persist
    // the user's manual rules and reuse them when they switch back to
    // manual extraction in the future.
    const scrapeType = this.scrapeConfig.automaticContentExtraction ? 0 : this.scrapeConfig.selectedScrapeType;
    const body: any = {
      list: picked.filter((i) => !i.type).map((i) => i.url),
      files: picked.filter((i) => !!i.type).map((i) => ({ url: i.url, type: i.type })),
      scrape_type: scrapeType,
      refresh_rate: this.selectedRefreshRate,
      tags: this.kbTagsArray,
      situated_context: this.scrapeConfig.situatedContextEnabled,
      scrape_options: {
        tags_to_extract: this.scrapeConfig.extract_tags,
        unwanted_tags: this.scrapeConfig.unwanted_tags,
        unwanted_classnames: this.scrapeConfig.unwanted_classnames,
      },
    };

    this.dialogRef.close(body);
  }


  goToPricing() {
    this.closeScrapeSettingsDialog();
    let body: any = { upgrade_plan: true}
    this.dialogRef.close(body);
  }

  /** */
  onCloseBaseModal() {
    this.closeScrapeSettingsDialog();
    this.stopLoading();
    this.dialogRef.close();
    // this.closeBaseModal.emit();
  }

  /**
   * Open the side-by-side scrape settings dialog, sharing the same `scrapeConfig` reference.
   * Backdrop is disabled so the parent stays interactive; the user closes it explicitly.
   */
  openScrapeSettings(): void {
    if (this.scrapeSettingsDialogRef) {
      // Already open: no-op to avoid stacking dialogs.
      return;
    }
    this.isScrapeSettingsOpen = true;
    this.scrapeSettingsDialogRef = this.dialog.open(ModalKbScrapeSettingsComponent, {
      width: '380px',
      // Place the dialog flush to the right of the wizard (600px wide → half is 300px,
      // plus a 10px gap so the two cards do not touch).
      // beside the wizard when the screen is wide enough, else pinned to the right edge (no overflow)
      position: window.innerWidth >= 1420 ? { left: 'calc(50% + 330px)', top: '60px' } : { right: '16px', top: '60px' },
      autoFocus: false,
      hasBackdrop: false,
      data: {
        config: this.scrapeConfig,
      },
    });
    this.scrapeSettingsDialogRef.afterClosed().subscribe(() => {
      this.scrapeSettingsDialogRef = null;
      this.isScrapeSettingsOpen = false;
    });
  }

  closeScrapeSettingsDialog(): void {
    if (this.scrapeSettingsDialogRef) {
      this.scrapeSettingsDialogRef.close();
      this.scrapeSettingsDialogRef = null;
    }
    this.isScrapeSettingsOpen = false;
  }

  contacUsViaEmail() {
    window.open(`mailto:${this.salesEmail}?subject=Enable refresh rate for project ${this.project_name} (${this.id_project})`);
  }


  /**
   * Inizializza l'observer per monitorare i cambiamenti nel container delle tag
   * L'observer viene creato una sola volta in ngAfterViewInit
   */
  private initTagContainerObserver() {
    if (!this.kbTagsContainer) return;

    // Calcola l'altezza iniziale
    this.updateTagContainerHeight();

    // Crea l'observer solo se non esiste già
    if (!this.observer) {
      this.observer = new MutationObserver(() => {
        this.updateTagContainerHeight();
      });

      this.observer.observe(this.kbTagsContainer.nativeElement, {
        childList: true, // osserva aggiunte/rimozioni di elementi
        subtree: false
      });
    }
  }

  /**
   * Aggiorna l'altezza del container delle tag
   * Rimuove temporaneamente l'altezza forzata per misurare correttamente l'altezza naturale
   */
  private updateTagContainerHeight() {
    if (!this.kbTagsContainer) return;

    // Se non ci sono tag, mantieni un'altezza minima fissa
    if (this.kbTagsArray.length === 0) {
      this.tagContainerElementHeight = '8px';
      return;
    }

    const element = this.kbTagsContainer.nativeElement as HTMLElement;
    
    // Salva l'altezza corrente se presente
    const currentHeight = element.style.height;
    
    // Rimuovi temporaneamente l'altezza forzata per misurare l'altezza naturale del contenuto
    element.style.height = 'auto';
    
    // Forza il reflow per assicurarsi che il browser calcoli l'altezza naturale
    void element.offsetHeight;
    
    // Misura l'altezza naturale del contenuto
    const naturalHeight = element.offsetHeight;
    
    // Ripristina l'altezza forzata (verrà aggiornata subito dopo)
    element.style.height = currentHeight;
    
    // Usa solo l'altezza naturale del contenuto
    this.tagContainerElementHeight = naturalHeight + 'px';
  }
  
  goToKbTagsDoc() {
    const docsUrl = URL_kb_contents_tags;
    window.open(docsUrl, '_blank');
  }
}
