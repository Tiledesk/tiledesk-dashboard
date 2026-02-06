import { Component, OnInit, Output, EventEmitter, SimpleChanges, Inject, ChangeDetectorRef } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KB_LIMIT_CONTENT } from 'app/utils/util';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { LoggerService } from 'app/services/logger/logger.service';
import { BrandService } from 'app/services/brand.service';


@Component({
  selector: 'modal-urls-knowledge-base',
  templateUrl: './modal-urls-knowledge-base.component.html',
  styleUrls: ['./modal-urls-knowledge-base.component.scss']
})
export class ModalUrlsKnowledgeBaseComponent implements OnInit {

  @Output() saveKnowledgeBase = new EventEmitter();
  @Output() closeBaseModal = new EventEmitter();

  KB_LIMIT_CONTENT = KB_LIMIT_CONTENT;
  buttonDisabled: boolean = true;

  listOfUrls: string;
  countSitemap: number;
  errorLimit: boolean = false;

  panelOpenState = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  scrape_types: Array<any> = [
    // { name: "Full HTML page", value: 1 },
    { name: "Standard", value: 2 },
    // { name: "Headless (Text Only)", value: 3 },
    { name: "Advanced", value: 4 },
  ];

  selectedScrapeType = 4;
  extract_tags = ['body']; // Always preset to 'body'
  unwanted_tags = [];
  unwanted_classnames = [];
  stored_scrape_option: boolean

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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalUrlsKnowledgeBaseComponent>,
    private logger: LoggerService,
    public brandService: BrandService,
    private cdr: ChangeDetectorRef
  ) { 
    this.selectedRefreshRate = this.refresh_rate[0].value;
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
  }

  /** */
  ngOnInit(): void {
    // this.kbForm = this.createConditionGroup();
    this.hasStoredScrapeOptions()
  }

  /** */
  ngOnChanges(changes: SimpleChanges){
    // this.logger.log('ModalSiteMapComponent changes: ', changes);
    // if(this.listSitesOfSitemap.length > 0){
    //   this.listOfUrls = this.listSitesOfSitemap.join('\n');
    //   this.countSitemap = this.listSitesOfSitemap.length;
    // } 
  }

  /** */
  onChangeInput(event): void {
    let listSitesOfSitemap = this.listOfUrls.split("\n").filter(function(row) {
      return row.trim() !== '';
    });
    var lines = this.listOfUrls.split('\n');
    if (lines.length > KB_LIMIT_CONTENT) {
      this.errorLimit = true;
      this.buttonDisabled = true;
      this.listOfUrls = lines.slice(0, KB_LIMIT_CONTENT).join('\n');
      // this.logger.log("onChangeInput: ",this.listOfUrls);
    } else {
      this.errorLimit = false;
      this.buttonDisabled = false;
    }
    this.countSitemap = listSitesOfSitemap.length;
  }



  onSelectRefreshRate(refreshRateSelected) {
    this.logger.log("[MODALS-URLS] onSelectRefreshRate: ", refreshRateSelected);
  }

  /** */
  onSaveKnowledgeBase(){
    //const arrayURLS = this.content.split('\n');
    const arrayURLS = this.listOfUrls.split("\n").filter(function(row) {
      return row.trim() !== '';
    });
    let body: any = {
      list: arrayURLS,
      scrape_type: this.selectedScrapeType,
      refresh_rate: this.selectedRefreshRate
    }

    if (this.selectedScrapeType === 4) {
      body.scrape_options = {
        tags_to_extract: this.extract_tags,
        unwanted_tags: this.unwanted_tags,
        unwanted_classnames: this.unwanted_classnames
      }
    }
    
    this.dialogRef.close(body);
    // this.saveKnowledgeBase.emit(body);
  }

  onSelectScrapeType(selectedType) {
    // this.logger.log("onSelectScrapeType: ", selectedType);
  }

  addTag(type, event: MatChipInputEvent): void {
    // this.logger.log("Tag Event: ", event);
    const value = (event.value || '').trim();
    if (value) {
      if (type === 'extract_tags') {
        this.extract_tags.push(value);
      }
      if (type === 'unwanted_tags') {
        this.unwanted_tags.push(value);
      }
      if (type === 'unwanted_classnames') {
        this.unwanted_classnames.push(value);
      }
    }
    // Clear the input value
    if (event.input) {
      event.input.value = "";
    }
    //this.logger.log("Tags: ", this.content.tags);
  }

  removeTag(arrayName, tag) {
    this.logger.log("Remove tag arrayName: ", arrayName, ' tag ', tag);
    if (arrayName === 'extract_tags')  {
      this.logger.log('extract_tags array',  this.extract_tags)
      const index =  this.extract_tags.findIndex((val) => val === tag); 
      this.logger.log("Remove tag index: ", index);
      this.extract_tags.splice(index, 1)
    }

    if (arrayName === 'unwanted_tags')  {
      this.logger.log('unwanted_tags array',  this.extract_tags)
      const index =  this.unwanted_tags.findIndex((val) => val === tag); // Returns 1  
      this.logger.log("Remove tag index: ", index);
      this.unwanted_tags.splice(index, 1)
    }

    if (arrayName === 'unwanted_classnames')  {
      this.logger.log('unwanted_classnames array',  this.extract_tags)
      const index =  this.unwanted_classnames.findIndex((val) => val === tag); // Returns 1  
      this.logger.log("Remove tag index: ", index);
      this.unwanted_classnames.splice(index, 1)
    }

  }

  goToPricing() {
    // this.onCloseBaseModal()
    let body: any = { upgrade_plan: true}
    this.dialogRef.close(body);
  }

  /** */
  onCloseBaseModal() {
    this.countSitemap = 0;
    this.dialogRef.close();
    // this.closeBaseModal.emit();
  }

  contacUsViaEmail() {
    window.open(`mailto:${this.salesEmail}?subject=Enable refresh rate for project ${this.project_name} (${this.id_project})`);
  }

  /**
   * Copy all scrape options to localStorage
   */
  copyAllScrapeOptions(): void {
    this.logger.log('[MODALS-URLS] copyAllScrapeOptions called');
    this.logger.log('[MODALS-URLS] Current extract_tags:', this.extract_tags);
    this.logger.log('[MODALS-URLS] Current unwanted_tags:', this.unwanted_tags);
    this.logger.log('[MODALS-URLS] Current unwanted_classnames:', this.unwanted_classnames);
    
    const scrapeOptions = {
      extract_tags: [...this.extract_tags],
      unwanted_tags: [...this.unwanted_tags],
      unwanted_classnames: [...this.unwanted_classnames]
    };
    this.logger.log('[MODALS-URLS] Scrape options object to save:', scrapeOptions);
    
    try {
      const jsonString = JSON.stringify(scrapeOptions);
      this.logger.log('[MODALS-URLS] JSON string to save:', jsonString);
      localStorage.setItem('scrape_options', jsonString);
      
      // Verify it was saved
      const saved = localStorage.getItem('scrape_options');
      this.logger.log('[MODALS-URLS] Verified saved value:', saved);
      this.logger.log('[MODALS-URLS] Scrape options copied to storage successfully');
    } catch (error) {
      this.logger.error('[MODALS-URLS] Error saving scrape options to storage:', error);
    }
  }

  /**
   * Check if stored scrape options exist
   */
  hasStoredScrapeOptions(): boolean {
    try {
      this.stored_scrape_option =
        localStorage.getItem('scrape_options') !== null;

      return this.stored_scrape_option;
    } catch (error) {
      this.logger.error(
        '[MODALS-URLS] Error reading scrape options from storage:',
        error
      );
      this.stored_scrape_option = false;
      return false;
    }
  }

  /**
   * Paste all scrape options from localStorage
   */
  pasteAllScrapeOptions(): void {
    try {
      const stored = localStorage.getItem('scrape_options');
      this.logger.log('[MODALS-URLS] Stored value from localStorage:', stored);
      if (stored) {
        const scrapeOptions = JSON.parse(stored);
        this.logger.log('[MODALS-URLS] Parsed scrape options:', scrapeOptions);
        // Replace existing tags with stored ones
        if (scrapeOptions.extract_tags && Array.isArray(scrapeOptions.extract_tags)) {
          this.extract_tags = [...scrapeOptions.extract_tags];
          this.logger.log('[MODALS-URLS] extract_tags after paste:', this.extract_tags);
        } else {
          this.extract_tags = [];
        }
        if (scrapeOptions.unwanted_tags && Array.isArray(scrapeOptions.unwanted_tags)) {
          this.unwanted_tags = [...scrapeOptions.unwanted_tags];
          this.logger.log('[MODALS-URLS] unwanted_tags after paste:', this.unwanted_tags);
        } else {
          this.unwanted_tags = [];
        }
        if (scrapeOptions.unwanted_classnames && Array.isArray(scrapeOptions.unwanted_classnames)) {
          this.unwanted_classnames = [...scrapeOptions.unwanted_classnames];
          this.logger.log('[MODALS-URLS] unwanted_classnames after paste:', this.unwanted_classnames);
        } else {
          this.unwanted_classnames = [];
        }
        this.logger.log('[MODALS-URLS] All arrays after paste - extract_tags:', this.extract_tags, 'unwanted_tags:', this.unwanted_tags, 'unwanted_classnames:', this.unwanted_classnames);
        // Force change detection to update the view
        this.cdr.detectChanges();
      } else {
        this.logger.log('[MODALS-URLS] No stored value found in localStorage');
      }
    } catch (error) {
      this.logger.error('[MODALS-URLS] Error reading scrape options from storage:', error);
    }
  }
  
}
