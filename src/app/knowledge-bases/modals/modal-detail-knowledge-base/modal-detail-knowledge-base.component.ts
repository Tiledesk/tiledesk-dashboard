import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, Inject, ViewChild, ElementRef } from '@angular/core';
import { KB } from 'app/models/kbsettings-model';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LoggerService } from 'app/services/logger/logger.service';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { BrandService } from 'app/services/brand.service';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { URL_kb_contents_tags } from 'app/utils/util';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { KbScrapeConfig, buildDefaultKbScrapeConfig } from 'app/models/kb-scrape-config-model';
import { ModalKbScrapeSettingsComponent } from '../modal-kb-scrape-settings/modal-kb-scrape-settings.component';


@Component({
  selector: 'modal-detail-knowledge-base',
  templateUrl: './modal-detail-knowledge-base.component.html',
  styleUrls: ['./modal-detail-knowledge-base.component.scss']
})
export class ModalDetailKnowledgeBaseComponent implements OnInit {
  // @Input() kb: KB;
  @Output() closeBaseModal = new EventEmitter();
  @Output() updateKnowledgeBase = new EventEmitter();

  kb: KB;
  name: string;
  source: string;
  content: string;
  faqcontent: string;
  chunks: Array<any> = [];
  chunksCount: number;
  showSpinner: boolean = true;
  getChunksError: boolean = false;
  /**
   * Scraping configuration for `kb.type === 'url'`. Built in the constructor
   * from the existing `kb.scrape_options` / `kb.scrape_type` so the side-by-side
   * settings dialog opens already populated with the user's previous choices.
   * Mutated in place by `<app-kb-scrape-settings>` (via the side-by-side dialog)
   * and by `<app-kb-scrape-summary>` chip popovers; read at save time inside
   * `onUpdateKnowledgeBase()`.
   *
   * For non-URL KBs (faq / text / pdf / etc.) this stays at the default values
   * but is never displayed nor sent to the server.
   */
  scrapeConfig: KbScrapeConfig = buildDefaultKbScrapeConfig();
  /** Reference to the side-by-side scrape settings dialog (URL only). */
  scrapeSettingsDialogRef: MatDialogRef<ModalKbScrapeSettingsComponent> | null = null;
  /** Drives the header `tune` ↔ `remove` icon swap and the popover button label. */
  isScrapeSettingsOpen = false;
  /**
   * Sent to the server as `situated_context` on update for non-URL types
   * (faq / text / pdf / file). For URL the equivalent flag lives in
   * `scrapeConfig.situatedContextEnabled` and is owned by the side-by-side
   * settings dialog.
   */
  situatedContextEnabled = false;
  refresh_rate: Array<{ name: string; value: string }> = [
    { name: "Never", value: 'never' },
    { name: 'Daily', value: 'daily' },
    { name: 'Weekly', value: 'weekly' },
    { name: 'Monthly', value: 'monthly' }
  ];
  selectedRefreshRate: string;
  /** Valutato dal profilo progetto (getIfRefreshRateIsEnabledInCustomization), non abilitato di default */
  refreshRateIsEnabled: boolean //= false;
  /** Valutato da managePlanRefreshRateAvailability in base a piano/abbonamento */
  isAvailableRefreshRateFeature: boolean //= false;
  /** Valutato da getOSCODE (config) */
  payIsVisible: boolean //= false;

  // KB Tags
  kbTag: string = '';
  kbTagsArray = []
  @ViewChild('kbTagsContainer') kbTagsContainer!: ElementRef;
  private observer!: MutationObserver;
  /** Altezza del container delle tag; 20px quando vuoto così il binding è valido dal primo render */
  tagContainerElementHeight: string = '20px';

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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalDetailKnowledgeBaseComponent>,
    private logger: LoggerService,
    private kbService: KnowledgeBaseService,
    public brandService: BrandService,
    private dialog: MatDialog,
  ) {
     if (data && data.kb)
      this.kb = data.kb
     console.log('[MODAL-DETAIL-KB] kb ', this.kb)

      this.name = this.kb.name;
      this.source = this.kb.source;
      this.logger.log('[MODAL-DETAIL-KB] source ', this.source)
      this.content = this.kb.content;
      console.log('[MODAL-DETAIL-KB] content ', this.content)

      if (this.kb.type === 'faq') {
       this.content = this.kb.content.replace(this.kb.name + '\n', '').trimStart()
      }

      if((this.kb.type === 'url' && this.kb.sitemap_origin) || this.kb.type === 'sitemap') {
          this.refresh_rate.splice(0, 1);
      }

     if (this.kb.type === 'url' || this.kb.type === 'sitemap') {
        // Build the shared `scrapeConfig` from the values already saved on the
        // KB so the side-by-side settings dialog reflects the user's previous
        // choices on first open.
        const tagsFromKb = this.kb.scrape_options?.tags_to_extract;
        this.scrapeConfig = {
          // Automatic = scrape_type 0; only meaningful for `url` type.
          automaticContentExtraction: this.kb.type === 'url' ? Number(this.kb.scrape_type) === 0 : false,
          situatedContextEnabled: Boolean(this.kb.situated_context),
          // `KbScrapeSettings` exposes the manual chip lists when `selectedScrapeType === 4`.
          selectedScrapeType: 4,
          extract_tags: tagsFromKb?.length ? [...tagsFromKb] : ['body'],
          unwanted_tags: [...(this.kb.scrape_options?.unwanted_tags || [])],
          unwanted_classnames: [...(this.kb.scrape_options?.unwanted_classnames || [])],
        };
        const savedRate = this.kb.refresh_rate;
        const validRate = this.refresh_rate.some(r => r.value === savedRate);
        this.selectedRefreshRate = validRate ? savedRate : (this.refresh_rate[1]?.value || 'weekly');
        if (data.refreshRateIsEnabled !== undefined) this.refreshRateIsEnabled = data.refreshRateIsEnabled;
        if (data.isAvailableRefreshRateFeature !== undefined) this.isAvailableRefreshRateFeature = data.isAvailableRefreshRateFeature;
        if (data.payIsVisible !== undefined) this.payIsVisible = data.payIsVisible;
      }

      // Popola le tag del contenuto con quelle già esistenti sul kb
      this.kbTagsArray = this.kb.tags && Array.isArray(this.kb.tags) ? [...this.kb.tags] : [];

      // Non-URL types (faq / text / pdf / file) keep the situated context flag
      // as a flat property because they don't expose the side-by-side settings
      // dialog. URL type reads/writes through `scrapeConfig.situatedContextEnabled`.
      this.situatedContextEnabled = Boolean(this.kb.situated_context);

      // Recupera i chunks solo se esiste _id
      if (this.kb._id && this.kb.type !== 'sitemap') {
        this.getContentChuncks(this.kb.id_project, this.kb.namespace, this.kb._id)
      } else {
        this.showSpinner = false;
      }

    const brand = brandService.getBrand();
    // this.salesEmail = brand['CONTACT_SALES_EMAIL'];
    this.hideHelpLink = brand['DOCS'];
  }

  getContentChuncks(id_project: string, namespaceid: string, contentid: string) {
    
    this.kbService.getContentChuncks(id_project, namespaceid, contentid).subscribe((chunks: any) => {
      if (chunks) {
        
        this.logger.log('[KNOWLEDGE-BASES-COMP] - GET CONTENT CHUNCKS - RES', chunks);
        chunks.matches.forEach(el => {

          this.logger.log('[KNOWLEDGE-BASES-COMP] - GET CONTENT CHUNCKS - element', el) 

          this.chunks.push({ id: el.id, text: el.text })
        });
        

      }
    }, (error) => {
      this.logger.error('[KNOWLEDGE-BASES-COMP] - GET CONTENT CHUNCKS - ERROR ', error);
      this.showSpinner = false;
      this.chunksCount = 0;
      this.getChunksError = true;
    }, () => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] - GET CONTENT CHUNCKS * COMPLETE *');
      this.logger.log('[KNOWLEDGE-BASES-COMP] - GET CONTENT CHUNCKS  Array', this.chunks) 
      this.chunksCount = this.chunks.length;
      this.logger.log('[KNOWLEDGE-BASES-COMP] - GET CONTENT CHUNCKS  Array', this.chunks) 
      this.showSpinner = false;
    });

  }

  ngOnInit(): void {
    // this.name = this.kb.name;
    // this.source = this.kb.source;
    // this.content = this.kb.content;
    
  }

  ngAfterViewInit() {
    this.initTagContainerObserver();
  }

  ngOnDestroy() {
    this.logger.log('[MODALS-URLS] ngOnDestroy called');
    if (this.observer) {
      this.observer.disconnect();
    }
    this.closeScrapeSettingsDialog();
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

  // ngOnChanges(changes: SimpleChanges): void {
  //   this.logger.log('[MODAL-DETAIL-KB] kb ', this.kb) 
  // }


  onChangeInput(event): void {
    // if (this.kbForm.valid) {
    //   this.buttonDisabled = false;
    // } else {
    //   this.buttonDisabled = true;
    // }
  }

  onCloseBaseModal() {
    this.closeScrapeSettingsDialog();
    // this.closeBaseModal.emit();
    this.dialogRef.close();
  }

  // KB TAGS
  addsKbTag(kbTag) {
    if (kbTag && kbTag.trim() !== '') {
      const trimmedTag = kbTag.trim();
      // Verifica che il tag non sia già presente
      if (!this.kbTagsArray.includes(trimmedTag)) {
        this.kbTagsArray.push(trimmedTag);
        this.logger.log("[MODALS-SITEMAP] addsKbTags kbTagsArray: ", this.kbTagsArray);
      }
      // Svuota l'input dopo aver aggiunto il tag
      this.kbTag = '';
    }
    // L'observer gestirà automaticamente l'aggiornamento dell'altezza
  }

  removeKbTag(kbTagName){
    const index =  this.kbTagsArray.findIndex((tag) => tag === kbTagName);
    this.logger.log("[MODAL-DETAIL-KB] removeKbTags index: ", index);
    this.kbTagsArray.splice(index, 1)
    this.logger.log("[MODAL-DETAIL-KB] removeKbTags kbTagsArray: ", this.kbTagsArray);
    // L'observer gestirà automaticamente l'aggiornamento dell'altezza
  }


 
  onUpdateKnowledgeBase(){
    if (this.kb.type === 'faq') {
      this.content = this.name + "\n" + this.content
    }
    this.kb.name = this.name;
    this.kb.source = this.source;
    this.kb.content = this.content;
    this.kb.tags = [...this.kbTagsArray];

    if (this.kb.type === 'url' || this.kb.type === 'sitemap') {
      this.kb.scrape_options = this.kb.scrape_options || {};
      this.kb.scrape_options.tags_to_extract = [...this.scrapeConfig.extract_tags];
      this.kb.scrape_options.unwanted_tags = [...this.scrapeConfig.unwanted_tags];
      this.kb.scrape_options.unwanted_classnames = [...this.scrapeConfig.unwanted_classnames];
      if (this.kb.type === 'url') {
        this.kb.scrape_type = this.scrapeConfig.automaticContentExtraction ? 0 : 4;
      }
      this.kb.refresh_rate = this.selectedRefreshRate;
    }

    // URL type mirrors the creation modal: situated_context is meaningful only
    // with automatic extraction on. URL reads from `scrapeConfig`; the other
    // types (faq / text / pdf / ...) read from the inline flat flag.
    if (this.kb.type === 'url') {
      this.kb.situated_context = this.scrapeConfig.automaticContentExtraction && this.scrapeConfig.situatedContextEnabled;
    } else {
      this.kb.situated_context = this.situatedContextEnabled;
    }

    this.closeScrapeSettingsDialog();
    this.dialogRef.close({'kb': this.kb, 'method': 'update'});
    // this.updateKnowledgeBase.emit(this.kb);
  }

  onDeleteKnowledgeBase() {
    this.closeScrapeSettingsDialog();
    this.dialogRef.close({'kb': this.kb, 'method': 'delete'})
  }

  onSelectRefreshRate(value: string): void {
    this.selectedRefreshRate = value;
    this.kb.refresh_rate = value;
    console.log('[MODAL-DETAIL-KB] kb ', this.kb);
  }

  /**
   * Situated context toggle for non-URL types (faq / text / pdf / file). The
   * URL type reads/writes through `scrapeConfig.situatedContextEnabled` inside
   * the side-by-side scrape settings dialog, so no handler is needed here.
   */
  onSituatedContextSlideToggle(event: MatSlideToggleChange): void {
    this.situatedContextEnabled = event.checked;
  }

  /**
   * Open the side-by-side scrape settings dialog (URL only). Mirrors the
   * pattern already in use by `modal-urls-knowledge-base` /
   * `modal-site-map`, but passes `actionMode: 'copy'` so the inner panel
   * shows a Copy button (snapshot current rules to clipboard) instead of the
   * default Paste button used by the create flows.
   */
  openScrapeSettings(): void {
    if (this.scrapeSettingsDialogRef) {
      return;
    }
    this.isScrapeSettingsOpen = true;
    this.scrapeSettingsDialogRef = this.dialog.open(ModalKbScrapeSettingsComponent, {
      width: '380px',
      position: { left: 'calc(50% + 260px)', top: '60px' },
      autoFocus: false,
      hasBackdrop: false,
      data: {
        config: this.scrapeConfig,
        actionMode: 'copy',
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
  private updateTagContainerHeight(): void {
    if (!this.kbTagsContainer?.nativeElement) return;

    // Se non ci sono tag, mantieni un'altezza minima fissa (20px)
    if (this.kbTagsArray.length === 0) {
      this.tagContainerElementHeight = '20px';
      return;
    }

    const element = this.kbTagsContainer.nativeElement as HTMLElement;
    const currentHeight = element.style.height;
    element.style.height = 'auto';
    void element.offsetHeight;
    const naturalHeight = element.offsetHeight;
    element.style.height = currentHeight;
    this.tagContainerElementHeight = naturalHeight > 0 ? naturalHeight + 'px' : '20px';
  }
  
 goToKbTagsDoc() {
    const docsUrl = URL_kb_contents_tags;
    window.open(docsUrl, '_blank');
  }

}


