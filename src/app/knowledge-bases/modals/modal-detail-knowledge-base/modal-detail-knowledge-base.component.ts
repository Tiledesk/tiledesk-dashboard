import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, Inject, ViewChild, ElementRef } from '@angular/core';
import { KB } from 'app/models/kbsettings-model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { LoggerService } from 'app/services/logger/logger.service';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { BrandService } from 'app/services/brand.service';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { URL_kb_contents_tags } from 'app/utils/util';

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
  showCopiedMessage: boolean = false;

  panelOpenState = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  extract_tags: string[] = [];
  unwanted_tags: string[] = [];
  unwanted_classnames: string[] = [];
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
      offsetX: -8
    }
  ];


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalDetailKnowledgeBaseComponent>,
    private logger: LoggerService,
    private kbService: KnowledgeBaseService,
    public brandService: BrandService
  ) { 
    if (data && data.kb) 
      this.kb = data.kb
      this.logger.log('[MODAL-DETAIL-KB] kb ', this.kb) 

      this.name = this.kb.name;
      this.source = this.kb.source;
      this.logger.log('[MODAL-DETAIL-KB] source ', this.source)
      this.content = this.kb.content;
      this.logger.log('[MODAL-DETAIL-KB] content ', this.content)

      if (this.kb.type === 'faq') {
       this.content = this.kb.content.replace(this.kb.name + '\n', '').trimStart()
      }

      if((this.kb.type === 'url' && this.kb.sitemap_origin) || this.kb.type === 'sitemap') {
          this.refresh_rate.splice(0, 1);
      }

      if (this.kb.type === 'url' || this.kb.type === 'sitemap') {
        this.extract_tags = [...(this.kb.scrape_options?.tags_to_extract || [])];
        this.unwanted_tags = [...(this.kb.scrape_options?.unwanted_tags || [])];
        this.unwanted_classnames = [...(this.kb.scrape_options?.unwanted_classnames || [])];
        const savedRate = this.kb.refresh_rate;
        const validRate = this.refresh_rate.some(r => r.value === savedRate);
        this.selectedRefreshRate = validRate ? savedRate : (this.refresh_rate[1]?.value || 'weekly');
        if (data.refreshRateIsEnabled !== undefined) this.refreshRateIsEnabled = data.refreshRateIsEnabled;
        if (data.isAvailableRefreshRateFeature !== undefined) this.isAvailableRefreshRateFeature = data.isAvailableRefreshRateFeature;
        if (data.payIsVisible !== undefined) this.payIsVisible = data.payIsVisible;
      }

      // Popola le tag del contenuto con quelle già esistenti sul kb
      this.kbTagsArray = this.kb.tags && Array.isArray(this.kb.tags) ? [...this.kb.tags] : [];

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
    // Disconnettere l'observer per evitare memory leaks
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

  onChangeInput(event): void {
    // if (this.kbForm.valid) {
    //   this.buttonDisabled = false;
    // } else {
    //   this.buttonDisabled = true;
    // }
  }

  onCloseBaseModal() {
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
      this.kb.scrape_options.tags_to_extract = [...this.extract_tags];
      this.kb.scrape_options.unwanted_tags = [...this.unwanted_tags];
      this.kb.scrape_options.unwanted_classnames = [...this.unwanted_classnames];
      this.kb.refresh_rate = this.selectedRefreshRate;
    }

    this.dialogRef.close({'kb': this.kb, 'method': 'update'});
    // this.updateKnowledgeBase.emit(this.kb);
  }

  onDeleteKnowledgeBase() {
    this.dialogRef.close({'kb': this.kb, 'method': 'delete'})
  }

  /**
   * Copy all scrape options to localStorage and clipboard
   */
 /**
   * Copy all scrape options to localStorage and clipboard
   */
  copyAllScrapeOptions(): void {
    const extract_tags = this.extract_tags?.length ? this.extract_tags : (this.kb.scrape_options?.tags_to_extract || []);
    const unwanted_tags = this.unwanted_tags?.length ? this.unwanted_tags : (this.kb.scrape_options?.unwanted_tags || []);
    const unwanted_classnames = this.unwanted_classnames?.length ? this.unwanted_classnames : (this.kb.scrape_options?.unwanted_classnames || []);
    
    this.logger.log('[MODAL-DETAIL-KB] copyAllScrapeOptions called');
    this.logger.log('[MODAL-DETAIL-KB] Current extract_tags:', extract_tags);
    this.logger.log('[MODAL-DETAIL-KB] Current unwanted_tags:', unwanted_tags);
    this.logger.log('[MODAL-DETAIL-KB] Current unwanted_classnames:', unwanted_classnames);
    
    const scrapeOptions = {
      extract_tags: [...extract_tags],
      unwanted_tags: [...unwanted_tags],
      unwanted_classnames: [...unwanted_classnames]
    };
    this.logger.log('[MODAL-DETAIL-KB] Scrape options object to save:', scrapeOptions);
    
    try {
      const jsonString = JSON.stringify(scrapeOptions);
      this.logger.log('[MODAL-DETAIL-KB] JSON string to save:', jsonString);
      
      // Save to localStorage
      localStorage.setItem('scrape_options', jsonString);
      
      // Copy to clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(jsonString).then(() => {
          this.logger.log('[MODAL-DETAIL-KB] Scrape options copied to clipboard successfully');
          this.showCopiedMessage = true;
          setTimeout(() => {
            this.showCopiedMessage = false;
          }, 2000);
        }).catch((err) => {
          this.logger.error('[MODAL-DETAIL-KB] Error copying to clipboard:', err);
          // Fallback to execCommand
          const success = this.fallbackCopyToClipboard(jsonString);
          if (success) {
            this.showCopiedMessage = true;
            setTimeout(() => {
              this.showCopiedMessage = false;
            }, 2000);
          }
        });
      } else {
        // Fallback for older browsers
        const success = this.fallbackCopyToClipboard(jsonString);
        if (success) {
          this.showCopiedMessage = true;
          setTimeout(() => {
            this.showCopiedMessage = false;
          }, 2000);
        }
      }
      
      // Verify it was saved
      const saved = localStorage.getItem('scrape_options');
      this.logger.log('[MODAL-DETAIL-KB] Verified saved value:', saved);
      this.logger.log('[MODAL-DETAIL-KB] Scrape options copied to storage successfully');
    } catch (error) {
      this.logger.error('[MODAL-DETAIL-KB] Error saving scrape options to storage:', error);
    }
  }

  /**
   * Fallback method to copy text to clipboard for older browsers
   */
  private fallbackCopyToClipboard(text: string): boolean {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        this.logger.log('[MODAL-DETAIL-KB] Scrape options copied to clipboard using fallback method');
        return true;
      } else {
        this.logger.error('[MODAL-DETAIL-KB] Fallback copy command failed');
        return false;
      }
    } catch (err) {
      this.logger.error('[MODAL-DETAIL-KB] Error in fallback copy:', err);
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }

 /**
   * Check if KB has scrape options to copy
   */
  hasScrapeOptions(): boolean {
    if (!this.kb) return false;
    const et = this.extract_tags?.length ? this.extract_tags : (this.kb.scrape_options?.tags_to_extract || []);
    const ut = this.unwanted_tags?.length ? this.unwanted_tags : (this.kb.scrape_options?.unwanted_tags || []);
    const uc = this.unwanted_classnames?.length ? this.unwanted_classnames : (this.kb.scrape_options?.unwanted_classnames || []);
    return et.length > 0 || ut.length > 0 || uc.length > 0;
  }

    addTag(type: 'extract_tags' | 'unwanted_tags' | 'unwanted_classnames', event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      if (type === 'extract_tags') this.extract_tags.push(value);
      if (type === 'unwanted_tags') this.unwanted_tags.push(value);
      if (type === 'unwanted_classnames') this.unwanted_classnames.push(value);
      this.syncScrapeOptionsToKb();
      this.logger.log('[MODAL-DETAIL-KB] kb ', this.kb);
    }
    if (event.input) event.input.value = '';
  }

  removeTag(arrayName: 'extract_tags' | 'unwanted_tags' | 'unwanted_classnames', tag: string): void {
    if (arrayName === 'extract_tags') {
      const i = this.extract_tags.indexOf(tag);
      if (i !== -1) this.extract_tags.splice(i, 1);
    }
    if (arrayName === 'unwanted_tags') {
      const i = this.unwanted_tags.indexOf(tag);
      if (i !== -1) this.unwanted_tags.splice(i, 1);
    }
    if (arrayName === 'unwanted_classnames') {
      const i = this.unwanted_classnames.indexOf(tag);
      if (i !== -1) this.unwanted_classnames.splice(i, 1);
    }
    this.syncScrapeOptionsToKb();
    this.logger.log('[MODAL-DETAIL-KB] kb ', this.kb);
  }

  onSelectRefreshRate(value: string): void {
    this.selectedRefreshRate = value;
    this.kb.refresh_rate = value;
    this.logger.log('[MODAL-DETAIL-KB] kb ', this.kb);
  }

  /** Aggiorna this.kb.scrape_options con i valori correnti delle tag. */
  private syncScrapeOptionsToKb(): void {
    if (!this.kb || (this.kb.type !== 'url' && this.kb.type !== 'sitemap')) return;
    this.kb.scrape_options = this.kb.scrape_options || {};
    this.kb.scrape_options.tags_to_extract = [...this.extract_tags];
    this.kb.scrape_options.unwanted_tags = [...this.unwanted_tags];
    this.kb.scrape_options.unwanted_classnames = [...this.unwanted_classnames];
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
