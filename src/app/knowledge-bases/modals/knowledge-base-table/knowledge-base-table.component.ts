import { Component, Input, OnInit, ViewChild, Output, EventEmitter, SimpleChanges, ElementRef, HostListener, ChangeDetectionStrategy } from '@angular/core';

import { KB, KbSettings } from 'app/models/kbsettings-model';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { KB_DEFAULT_PARAMS, URL_kb } from 'app/utils/util';
import { LoggerService } from 'app/services/logger/logger.service';
import { BrandService } from 'app/services/brand.service';
import { SatPopover } from '@ncstate/sat-popover';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { R } from '@angular/cdk/keycodes';

@Component({
  selector: 'knowledge-base-table',
  templateUrl: './knowledge-base-table.component.html',
  styleUrls: ['./knowledge-base-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class KnowledgeBaseTableComponent implements OnInit {
  @ViewChild('refresRate') refresRate!: SatPopover;
  @Input() salesEmail:string
  @Input() project_name:string;
  @Input() id_project: string;
  @Input() refresh: boolean;
  @Input() kbsList: KB[];
  @Input() kbsListCount: number;
  @Input() selectedNamespaceName: any
  @Input() hasRemovedKb: boolean;
  @Input() hasUpdatedKb: boolean;
  @Input() getKbCompleted: boolean;
  @Input() hasAlreadyVisitedKb: string;
  @Input() isAvailableRefreshRateFeature: boolean;
  @Input() refreshRateIsEnabled: boolean;
  @Input() payIsVisible: boolean;
  @Input() t_params: string;
  @Output() openBaseModalDetail = new EventEmitter();
  @Output() openBaseModalDelete = new EventEmitter();
  @Output() openBaseModalPreview = new EventEmitter();
  @Output() openAddKnowledgeBaseModal = new EventEmitter();
  @Output() checkStatus = new EventEmitter();
  @Output() runIndexing = new EventEmitter();
  @Output() loadPage = new EventEmitter();
  @Output() loadByFilter = new EventEmitter();
  
  // last added
  @Output() openBaseModalPreviewSettings = new EventEmitter();
  @Output() onOpenAddContents = new EventEmitter();
  
  kbsListCountCurrentValue: number;

  timeoutId: any;
  // kbsListfilterTypeFilter: KB[] = [];
  filterStatus: string;
  filterType: string;
  filterText: string;
  @ViewChild('tableBody') tableBody: ElementRef;

  directionDesc: number = KB_DEFAULT_PARAMS.DIRECTION;
  isLoading: boolean = false;
  SHOW_MORE_BTN: boolean = true;
  SHOW_TABLE: boolean  = false;
  searchParams: any;
  numberPage: number = 0;
  hasFiltered: boolean = false;
  hideHelpLink: boolean;
  companyName: string;
  // kbsListCount: number = 0;

  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    private logger: LoggerService,
    public brandService: BrandService,
    private kbService: KnowledgeBaseService,
  ) {
    this.logger.log('[KB TABLE] HELLO SHOW_TABLE !!!!!', this.SHOW_TABLE);
    const brand = brandService.getBrand(); 
    this.hideHelpLink= brand['DOCS'];
    this.companyName = brand["BRAND_NAME"] 
  }

  ngOnInit(): void {
    this.resetFilter()
  }

  resetFilter() {
    this.logger.log('[KB TABLE] resetFilter')
    this.filterStatus = '';
    this.filterType = '';
    this.filterText = '';
    this.searchParams = {
      "page": 0,
      "sortField": KB_DEFAULT_PARAMS.SORT_FIELD,
      "direction": KB_DEFAULT_PARAMS.DIRECTION,
      "status": '',
      "search": '',
    }
  }

 

  contacUsViaEmail() {
    this.logger.log('[KB TABLE] - Satpopover ', this.refresRate)
    document.body.focus(); // Force the browser to lose focus
    if (this.refresRate) {
    this.refresRate.close();
    }

    setTimeout(() => {
      const mailLink = document.createElement('a');
      mailLink.href = `mailto:${this.salesEmail}?subject=Enable refresh rate for project ${this.project_name} (${this.id_project})`;
      mailLink.click(); // Simulate a user click
    }, 50);
  }


  loadMoreData() {
    this.isLoading = true;
    this.numberPage++;
    this.logger.log('[KB TABLE] - numberPage ', this.numberPage) 
    this.searchParams.page = this.numberPage;
    this.logger.log('[KB TABLE] -  this.searchParams.page ', this.searchParams.page) 
    // Math.floor(this.kbsList.length/KB_DEFAULT_PARAMS.LIMIT);
    // this.logger.log('[KB TABLE] emit loadPage searchParams', this.searchParams) 
    this.loadPage.emit(this.searchParams);
  }


  ngOnChanges(changes: SimpleChanges) {

    if (changes['kbsList'] && this.kbsList && this.kbsList.length > 0) {
      performance.mark('kb-table-data-ready');
  
      // Verifica se il mark kb-parent-init esiste prima di misurare
      const parentInitMark = performance.getEntriesByName('kb-parent-init');
  
      // Misura SOLO il tempo di rendering del componente figlio (da kb-parent-init a kb-table-data-ready)
      if (parentInitMark.length > 0) {
        performance.measure('kb-table-render', 'kb-parent-init', 'kb-table-data-ready');
        
        const tableMeasures = performance.getEntriesByName('kb-table-render');
        if (tableMeasures.length) {
          const tableDurationMs = tableMeasures[0].duration;
          const tableDurationSec = tableDurationMs / 1000;
          this.logger.log('[KB TABLE][PERF] KnowledgeBaseTableComponent render time:', tableDurationMs.toFixed(2), 'ms', `(${tableDurationSec.toFixed(2)} seconds)`);
        }
      }
  
      // Misura il tempo dal click alla visualizzazione dei dati
      const clickTime = (window as any).kbNavigationStartTime;
      if (clickTime) {
        const currentTime = performance.now();
        const totalTimeFromClick = currentTime - clickTime;
        this.logger.log('[KB TABLE][PERF] Total time from sidebar click to data ready:', totalTimeFromClick.toFixed(2), 'ms', `(${(totalTimeFromClick/1000).toFixed(2)} seconds)`);
      }
  
      // Pulizia opzionale
      performance.clearMarks('kb-table-data-ready');
      performance.clearMeasures('kb-table-render');
    }

    this.logger.log('[KB TABLE] ngOnChanges kbsListCount', this.kbsListCount, '  kbsList.length ', this.kbsList.length, ' changes ', changes);
    console.log('[KB TABLE] ngOnChanges kbsList ', this.kbsList);
    this.logger.log('[KB TABLE] ngOnChanges selectedNamespaceName ', this.selectedNamespaceName);
    this.logger.log('[KB TABLE] ngOnChanges hasRemovedKb ', this.hasRemovedKb);
    this.logger.log('[KB TABLE] ngOnChanges hasUpdatedKb ', this.hasUpdatedKb);
    this.logger.log('[KB TABLE] ngOnChanges getKbCompleted ', this.getKbCompleted);
    this.logger.log('[KB TABLE] ngOnChanges hasAlreadyVisitedKb ', this.hasAlreadyVisitedKb);
    this.logger.log('[KB TABLE] ngOnChanges project_name ', this.project_name);
    
    

    if (this.hasRemovedKb && this.kbsList.length === 0)  {
      this.SHOW_TABLE = false;
    }
    


    if (changes.selectedNamespaceName && changes.selectedNamespaceName.firstChange) {
      if (this.getKbCompleted) { 
        this.retrieveKbAndSwowTable('firstChange', this.kbsList, this.getKbCompleted)
      }
    }
    if (changes.selectedNamespaceName && changes.selectedNamespaceName.currentValue && changes.selectedNamespaceName.previousValue) {
      let selectedNamespaceNameCurrentValue = changes.selectedNamespaceName.currentValue
      this.logger.log('[KB TABLE] ngOnChanges -> -> -> selectedNamespaceNameCurrentValue ', selectedNamespaceNameCurrentValue);

      let selectedNamespaceNamePreviousValue = changes.selectedNamespaceName.previousValue
      this.logger.log('[KB TABLE] ngOnChanges -> -> -> selectedNamespaceNamePreviousValue ', selectedNamespaceNamePreviousValue);

      if (selectedNamespaceNameCurrentValue !== selectedNamespaceNamePreviousValue) {
        this.logger.log('[KB TABLE] ngOnChanges -> -> -> NAMESPACE CHANGED changes' , changes);
        if (changes.kbsList && changes.kbsList.currentValue) {
          this.logger.log('[KB TABLE] ngOnChanges -> -> -> NAMESPACE CHANGED changes kbsList.currentValue' , changes.kbsList.currentValue);

          if (changes.kbsList.currentValue.length === 0) {
            this.SHOW_TABLE = false;
          }
        }

        this.resetFilter()

      }
    }
   

    this.logger.log('[KB TABLE] ngOnChanges selectedNamespaceName ', this.selectedNamespaceName);
    this.logger.log('[KB TABLE] ngOnChanges filterStatus ', this.filterStatus);
    this.logger.log('[KB TABLE] ngOnChanges filterType ', this.filterType);
    this.logger.log('[KB TABLE] ngOnChanges filterText ', this.filterText);



    if (this.kbsList.length > 0) {
      this.SHOW_TABLE = true;
    }  
   

    // this.logger.log('[KB TABLE] ngOnChanges SHOW_TABLE ', this.SHOW_TABLE);
    if (changes.kbsList?.currentValue?.length === changes.kbsList?.previousValue?.length) {
      // non è cambiato nulla ho solo rodinato la tab
    } else {
    
    }
    if (this.kbsListCount > this.kbsList.length) {
      this.SHOW_MORE_BTN = true;
    } else {
      this.SHOW_MORE_BTN = false;
    }
    if (changes.refresh) {
      this.isLoading = false;
    }
    if (this.kbsList?.length == 0) {
      this.SHOW_MORE_BTN = false;
    }

    // this.logger.log('ngOnChanges end -------> ', this.kbsListCount, this.kbsList.length);
  }

  


  retrieveKbAndSwowTable(calledBy, kbsList, getKbCompleted) {
    this.logger.log('[KB TABLE] >>> retrieveKbAndSwowTable calledBy', calledBy )
    if ((kbsList.length === 0)) {
      this.SHOW_TABLE = false;
      this.logger.log('[KB TABLE] >>> retrieveKbAndSwowTable calledBy', calledBy , ' kbsList.length ', kbsList.length, ' SHOW_TABLE',  this.SHOW_TABLE , 'getKbCompleted' , getKbCompleted )
    } else {
      this.SHOW_TABLE = true;
      this.logger.log('[KB TABLE] >>> retrieveKbAndSwowTable calledBy', calledBy , ' kbsList.length ', kbsList.length, ' SHOW_TABLE',  this.SHOW_TABLE , 'getKbCompleted' , getKbCompleted )
    }
  }

  ngAfterViewInit() {
   
  }

 

  onOrderBy(type) {
 
    this.searchParams.sortField = type;
    this.directionDesc = this.directionDesc * -1;
    this.searchParams.direction = this.directionDesc;
    this.isLoading = true;
    this.loadByFilter.next(this.searchParams);
    this.logger.log('[KB TABLE] onOrderBy loadByFilter searchParams ', this.searchParams)
  }

  onLoadByFilter(filterValue?: string, column?: string) {
    this.hasFiltered = true;
    this.logger.log('[KB TABLE] >>> hasFiltered ', this.hasFiltered)
    this.logger.log('[KB TABLE] >>> filterStatus ', this.filterStatus)
    this.logger.log('[KB TABLE] >>> filterType ', this.filterType)
    // let status = '';
    // let search = '';
    this.logger.log("[KB TABLE] >>> onLoadByFilter value: ", filterValue)
    this.logger.log("[KB TABLE] >>> onLoadByFilter column: ", column)
    console.log("[KB TABLE] >>> onLoadByFilter searchParams: ", this.searchParams)
    
    if (column == 'status') {
      this.searchParams.status = filterValue;
    }
    else if (column == 'type') {
      this.searchParams.type = filterValue;
    }
    else if (column == 'name') {
      this.searchParams.search = filterValue;
    }
    // this.logger.log("this.searchParams ", this.searchParams);
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => {
      this.isLoading = true;
      this.loadByFilter.next(this.searchParams);
      // this.logger.log('[KB TABLE] onOrderBy onLoadByFilter searchParams ', this.searchParams)
    }, 1000);
  }



  onRunIndexing(kb) {
    // this.logger.log('onRunIndexing:: ', kb);
    this.runIndexing.emit(kb);
  }

  onOpenBaseModalPreview() {
    this.openBaseModalPreview.emit();
  }

  onOpenBaseModalPreviewSettings() {
    this.openBaseModalPreviewSettings.emit();
  }

  onOpenAddContent() {
    this.logger.log('onOpenAddContent');
    this.onOpenAddContents.emit();
  }

  onOpenBaseModalDelete(kb) {
    // kb.deleting = true;
    this.openBaseModalDelete.emit(kb);
  }


 getkbById(kbid) {
    console.log('[KB TABLE] - GET KB BY ID -  kbid', kbid);
    this.kbService.getKbId(kbid).subscribe((kb: any) => {
      console.log('[KB TABLE] - GET DEPTS RES ', kb);
      
      if (kb) {
        this.onOpenBaseModalDetail(kb)
      }

    }, error => {
      this.logger.error('[KB TABLE] - GET KB BY ID - ERROR: ', error);
    }, () => {
      this.logger.log('[KB TABLE] - GET KB BY ID * COMPLETE *')
    });
  }


  onOpenBaseModalDetail(kb: any ) {
    console.log("[KB TABLE] - OPEN DETAIL kb:  ",kb);
    this.openBaseModalDetail.emit(kb);
  }

  


  getSubtitle(kb) {
    this.logger.log('getSubtitle')
    let subtitle = kb.source;
    if (kb.type !== 'url') {
      // subtitle = kb.content;
      const maxLength = 100;
      if (kb.content.length > maxLength) {
        subtitle = kb.content.substring(0, maxLength) + '...';
      } else {
        subtitle = kb.content;
      }
    }
    return subtitle;
  }

  onOpenAddKnowledgeBaseModal(type) {
    this.logger.log('onOpenAddKnowledgeBaseModal', type);
    this.openAddKnowledgeBaseModal.emit(type);
  }

  onCheckStatus(kb) {
    // this.logger.log('onCheckStatus:: ', kb);
    this.checkStatus.emit(kb);
  }

  goToKbDoc() {
    const url = URL_kb;
    window.open(url, '_blank');
  }

  trackByKbId(_index: number, kb: KB) { 
    return kb._id; 
  }

}



