import { Component, OnInit, Output, EventEmitter, SimpleChanges, Input, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KB, KbSettings } from 'app/models/kbsettings-model';
import { KB_LIMIT_CONTENT, URL_kb_contents_tags, URL_kb_synced_Sitemap } from 'app/utils/util';
import { MAT_DIALOG_DATA, MatDialog MatDialogRef } from '@angular/material/dialog';
//import { COMMA, ENTER } from '@angular/cdk/keycodes';
//import { MatChipInputEvent } from '@angular/material/chips';
import { LoggerService } from 'app/services/logger/logger.service';
import { BrandService } from 'app/services/brand.service';
import { ConnectedPosition } from '@angular/cdk/overlay';
//import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { buildDefaultKbScrapeConfig, KbScrapeConfig } from 'app/models/kb-scrape-config-model';
import { ModalKbScrapeSettingsComponent } from '../modal-kb-scrape-settings/modal-kb-scrape-settings.component';

@Component({
  selector: 'modal-site-map',
  templateUrl: './modal-site-map.component.html',
  styleUrls: ['./modal-site-map.component.scss']
})
export class ModalSiteMapComponent implements OnInit {
  
  // @Input() listSitesOfSitemap: any[];
  // @Output() sendSitemap = new EventEmitter();
  // @Output() saveKnowledgeBase = new EventEmitter();
  // @Output() closeBaseModal = new EventEmitter();
  listSitesOfSitemap: any[];
  KB_LIMIT_CONTENT = KB_LIMIT_CONTENT;
  kbForm: FormGroup;
  buttonDisabled: boolean = true;
  isSitemapLoaded: boolean = false;
  listOfUrls: string;
  countSitemap: number;
  errorLimit: boolean = false;
  selectedNamespace: string;

  // -----------------------------------------------------------------------
  // Scrape settings — data flow between components
  // -----------------------------------------------------------------------
  // The body sent to the server is assembled in `onSaveKnowledgeBase()` from
  // two distinct sources:
  //
  //   1. Parent-owned fields (this component) — modal-specific data that
  //      lives here and ONLY here:
  //        - `siteMap`             → body.name / body.source
  //        - `selectedRefreshRate` → body.refresh_rate
  //        - `kbTagsArray`         → body.tags
  //        - `selectedNamespace`   → body.namespace
  //        - `type` (constant)     → body.type ("sitemap")
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

  /** Reference to the side-by-side scrape settings dialog (null when closed). */
  private scrapeSettingsDialogRef: MatDialogRef<ModalKbScrapeSettingsComponent> | null = null;
  /** Drives the gear/remove icon swap in the header. */
  isScrapeSettingsOpen = false;

  refresh_rate: Array<any> = [ 
    // { name: "Never", value: 'never' },
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
  siteMap: string;
  kb: KB = {
    _id: null,
    type: '',
    name: '',
    url: '',
    content: ''
  }

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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalSiteMapComponent>,
    private formBuilder: FormBuilder,
    private logger: LoggerService,
    public brandService: BrandService,
    private dialog: MatDialog,
  ) { 
    this.selectedRefreshRate = this.refresh_rate[0].value;
    this.logger.log("[MODALS-SITEMAP] data: ", data);
   
    this.selectedRefreshRate = this.refresh_rate[2].value
    this.logger.log("[MODALS-SITEMAP] this.refresh_rate[2]: ", this.refresh_rate[2].value);

    if (data ) {
      this.isAvailableRefreshRateFeature = data.isAvailableRefreshRateFeature
      this.refreshRateIsEnabled =  data.refreshRateIsEnabled;
      this.t_params = data.t_params
      this.id_project = data.id_project;
      this.project_name = data.project_name;
      this.payIsVisible =  data.payIsVisible;
      this.selectedNamespace = data.selectedNamespace
      this.logger.log("[MODALS-SITEMAP] data > selectedNamespace: ", this.selectedNamespace);
      this.logger.log("[MODALS-SITEMAP] data > t_params: ", this.t_params);
      this.logger.log("[MODALS-SITEMAP] data > isAvailableRefreshRateFeature: ", this.isAvailableRefreshRateFeature);
      this.logger.log("[MODALS-SITEMAP] data > refreshRateIsEnabled: ", this.refreshRateIsEnabled);
      this.logger.log("[MODALS-SITEMAP] data > id_project: ", this.id_project);
      this.logger.log("[MODALS-SITEMAP] data > project_name: ", this.project_name);
      this.logger.log("[MODALS-SITEMAP] data > payIsVisible: ", this.payIsVisible);
    }
    const brand = brandService.getBrand();
    this.salesEmail = brand['CONTACT_SALES_EMAIL'];
    this.hideHelpLink = brand['DOCS'];
  }

  ngOnInit(): void {
    // this.kbForm = this.createConditionGroup();
    this.listenToOnSenSitemapSiteListEvent()
   // this.hasStoredScrapeOptions()
  }

  ngAfterViewInit() {
    this.initTagContainerObserver();
  }

  ngOnDestroy() { 
    this.logger.log('[MODALS-URLS] ngOnDestroy called');
    // Cascade close: ensure the side-by-side settings dialog cannot outlive the parent.
    this.closeScrapeSettingsDialog();
    // Disconnect the MutationObserver to avoid memory leaks.
    if (this.observer) {
      this.observer.disconnect();
    }
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

  listenToOnSenSitemapSiteListEvent() {
    document.addEventListener(
      "on-send-sitemap-site-list", (e: CustomEvent) => {
        // this.logger.log("[MODAL-SITE-MAP] on-send-sitemap-site-list :", e.detail);
        this.listSitesOfSitemap=e.detail;
        // this.logger.log("[MODAL-SITE-MAP] on-send-sitemap-site-list listSitesOfSitemap length:", this.listSitesOfSitemap.length);
       
        if(this.listSitesOfSitemap.length > 0){
          this.buttonDisabled = false;
          this.listOfUrls = this.listSitesOfSitemap.join('\n');
          // this.logger.log('MODAL-SITE-MAP listOfUrls: ', this.listOfUrls);
          this.countSitemap = this.listSitesOfSitemap.length;
          this.isSitemapLoaded = true;
          // this.logger.log('MODAL-SITE-MAP isSitemapLoaded: ', this.isSitemapLoaded);
        } else {
          this.buttonDisabled = true;
          this.isSitemapLoaded = false;
        } 
      }
    );
  }






  // createConditionGroup(): FormGroup {
  //   const namePattern = /^[^&<>]{3,}$/;
  //   return this.formBuilder.group({
  //     //url: ['', [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]],
  //     // url: ['', [Validators.required]],
  //     siteMap: ['', [Validators.required]],
  //     // name: ['', [Validators.required, Validators.pattern(namePattern)]]
  //   })
  // }

  onChangeInput(event): void {
    // if (this.kbForm.valid) {
    //   this.buttonDisabled = false;
    // } else {
    //   this.buttonDisabled = true;
    // }
  }

  // importSitemap() {
  //   let body  = {
  //       "name": "https://www.sitemaps.org/sitemap.xml",
  //       "source": "https://www.sitemaps.org/sitemap.xml",
  //       "content": "",
  //       "type": "sitemap",
  //       "namespace": "{{namespace_id}}",
  //       "refresh_rate": "never",
  //       "scrape_type": 2
  //     }
    
  // }


  onChangeList(event):void {
    // this.listSitesOfSitemap = this.listOfUrls.split("\n");
    this.listSitesOfSitemap = this.listOfUrls.split("\n").filter(function(row) {
      return row.trim() !== '';
    });
    var lines = this.listOfUrls.split('\n');
    if (lines.length > KB_LIMIT_CONTENT) {
      this.errorLimit = true;
      this.buttonDisabled = true;
      // this.listOfUrls = lines.slice(0, KB_LIMIT_CONTENT).join('\n');
    } else {
      this.errorLimit = false;
      this.buttonDisabled = false;
    }
    this.countSitemap = this.listSitesOfSitemap.length;
  }


  goToPricing() {
    this.closeScrapeSettingsDialog();
    let body: any = { upgrade_plan: true}
    this.dialogRef.close(body);
  }

  onCloseBaseModal() {
    this.closeScrapeSettingsDialog();
    this.listSitesOfSitemap = [];
    this.listOfUrls = "";
    this.countSitemap = 0;
    this.isSitemapLoaded = false;
    this.buttonDisabled = false;
    // this.closeBaseModal.emit();
    this.dialogRef.close()
  }

  onSendSitemap(){
    let body = {
      'sitemap': this.kb.url
    }
    this.logger.log('[MODAL-SITE-MAP] onSendSitemap body ', body)
    this.buttonDisabled = true;

    const event = new CustomEvent("on-send-sitemap", { detail:  body  });
    document.dispatchEvent(event);
    // this.sendSitemap.emit(body);

  }

  onSelectRefreshRate(refreshRateSelected) {
    this.logger.log("[MODALS-SITEMAP] onSelectRefreshRate: ", refreshRateSelected);
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
    this.logger.log("[MODALS-SITEMAP] removeKbTags index: ", index);
    this.kbTagsArray.splice(index, 1)
    this.logger.log("[MODALS-SITEMAP] removeKbTags kbTagsArray: ", this.kbTagsArray);
    // L'observer gestirà automaticamente l'aggiornamento dell'altezza
  }




  onSaveKnowledgeBase(){
   if(!this.refreshRateIsEnabled) {
    return
   } 
   
      const scrapeType = this.scrapeConfig.automaticContentExtraction ? 0 : this.scrapeConfig.selectedScrapeType;
      let body  = {
          "name":   this.siteMap,
          "source": this.siteMap,
          "content": "",
          "type": "sitemap",
          "namespace": this.selectedNamespace['id'],
          "refresh_rate": this.selectedRefreshRate,
          "scrape_type": scrapeType,
          "tags": this.kbTagsArray,
          "situated_context": this.scrapeConfig.situatedContextEnabled
        }

      // Send scrape_options even when scrape_type is 0 so the server can persist them and reuse on manual mode.
      if (this.scrapeConfig.selectedScrapeType === 4) {
        body['scrape_options'] = {
          tags_to_extract: this.scrapeConfig.extract_tags,
          unwanted_tags: this.scrapeConfig.unwanted_tags,
          unwanted_classnames: this.scrapeConfig.unwanted_classnames
        }
      }
      this.closeScrapeSettingsDialog();
      this.dialogRef.close(body)
      // this.saveKnowledgeBase.emit(body);
    // }
    
  }


openScrapeSettings(): void {
    if (this.scrapeSettingsDialogRef) {
      // Already open: no-op to avoid stacking dialogs.
      return;
    }
    this.isScrapeSettingsOpen = true;
    this.scrapeSettingsDialogRef = this.dialog.open(ModalKbScrapeSettingsComponent, {
      width: '380px',
      // Place the dialog flush to the right of the sitemap modal (sitemap is 500px wide → half is 250px,
      // plus a 10px gap so the two cards do not touch).
      position: { left: 'calc(50% + 260px)', top: '60px' },
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
      this.tagContainerElementHeight = '15px';
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

  goToDocs() {
    const docsUrl = URL_kb_synced_Sitemap;
    window.open(docsUrl, '_blank');
  }



}
