import { Component, Input, OnInit, ViewChild, Output, EventEmitter, SimpleChanges, ElementRef, HostListener, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { KB, KbSettings } from 'app/models/kbsettings-model';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { KB_DEFAULT_PARAMS, URL_kb } from 'app/utils/util';
import { LoggerService } from 'app/services/logger/logger.service';
import { BrandService } from 'app/services/brand.service';
import { SatPopover } from '@ncstate/sat-popover';
import { RolesService } from 'app/services/roles.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PERMISSIONS } from 'app/utils/permissions.constants';
import { NotifyService } from 'app/core/notify.service';


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
  @Input() showKBTableSpinner: boolean = false;
  @Input() currentSortParams: any = null;
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
   private unsubscribe$: Subject<any> = new Subject<any>();
  // kbsListCount: number = 0;
  
  hasDefaultRole: boolean;
  ROLE: string;
  PERMISSIONS: any;
  PERMISSION_TO_ADD_CONTENTS: boolean;
  PERMISSION_TO_UPDATE_SETTINGS: boolean;
  // PERMISSION_TO_DELETE_CONTENTS: boolean;
  PERMISSION_TO_DELETE: boolean;
  PERMISSION_TO_UPDATE_CONTENT: boolean;
  PERMISSION_TO_REINDEX_CONTENT: boolean;
  PERMISSION_TO_CHECK_CONTENT_STATUS: boolean;

 
  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    private logger: LoggerService,
    public brandService: BrandService,
    private rolesService: RolesService,
    public notify: NotifyService,
    private cdr: ChangeDetectorRef,
  ) {
    this.logger.log('[KB TABLE] HELLO SHOW_TABLE !!!!!', this.SHOW_TABLE);
    const brand = brandService.getBrand(); 
    this.hideHelpLink= brand['DOCS'];
    this.companyName = brand["BRAND_NAME"] 
  }

  ngOnInit(): void {
    this.resetFilter()
    this.listenToProjectUser()
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();   
    this.unsubscribe$.complete();
  }

  listenToProjectUser() {
      this.rolesService.listenToProjectUserPermissions(this.unsubscribe$);
  
      this.rolesService.getUpdateRequestPermission()
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(status => {
          this.ROLE = status.role;
          this.PERMISSIONS = status.matchedPermissions;
          console.log('[KB TABLE] - this.ROLE:', this.ROLE);
          console.log('[KB TABLE] - this.PERMISSIONS', this.PERMISSIONS);
          this.hasDefaultRole = ['owner', 'admin', 'agent'].includes(status.role);
          console.log('[KB TABLE] - hasDefaultRole', this.hasDefaultRole);
  
          // PERMISSION_TO_ADD_CONTENTS
          if (status.role === 'owner' || status.role === 'admin') {
            // Owner and Admin always has permission
            this.PERMISSION_TO_ADD_CONTENTS = true;
            console.log('[KB TABLE] - Project user is owner or admin (1)', 'PERMISSION_TO_ADD_CONTENTS:', this.PERMISSION_TO_ADD_CONTENTS);
  
          } else if (status.role === 'agent') {
            // Agent never have permission
            this.PERMISSION_TO_ADD_CONTENTS = false;
            console.log('[KB TABLE] - Project user is agent (2)', 'PERMISSION_TO_ADD_CONTENTS:', this.PERMISSION_TO_ADD_CONTENTS);
  
          } else {
            // Custom roles: permission depends on matchedPermissions
            this.PERMISSION_TO_ADD_CONTENTS = status.matchedPermissions.includes(PERMISSIONS.KB_CONTENTS_ADD);
            console.log('[KB TABLE] - Custom role (3)', status.role, 'PERMISSION_TO_ADD_CONTENTS:', this.PERMISSION_TO_ADD_CONTENTS);
          }


          // PERMISSION_TO_UPDATE_CONTENT
          if (status.role === 'owner' || status.role === 'admin') {
            // Owner and Admin always has permission
            this.PERMISSION_TO_UPDATE_CONTENT = true;
            console.log('[KB TABLE] - Project user is owner or admin (1)', 'PERMISSION_TO_UPDATE_CONTENT:', this.PERMISSION_TO_UPDATE_CONTENT);
  
          } else if (status.role === 'agent') {
            // Agent never have permission
            this.PERMISSION_TO_UPDATE_CONTENT = false;
            console.log('[KB TABLE] - Project user is agent (2)', 'PERMISSION_TO_UPDATE_CONTENT:', this.PERMISSION_TO_UPDATE_CONTENT);
  
          } else {
            // Custom roles: permission depends on matchedPermissions
            this.PERMISSION_TO_UPDATE_CONTENT = status.matchedPermissions.includes(PERMISSIONS.KB_CONTENT_UPDATE);
            console.log('[KB TABLE] - Custom role (3)', status.role, 'PERMISSION_TO_UPDATE_CONTENT:', this.PERMISSION_TO_UPDATE_CONTENT);
          }

          // PERMISSION_TO_REINDEX_CONTENTS
          if (status.role === 'owner' || status.role === 'admin') {
            // Owner and Admin always has permission
            this.PERMISSION_TO_REINDEX_CONTENT = true;
            console.log('[KB TABLE] - Project user is owner or admin (1)', 'PERMISSION_TO_REINDEX_CONTENT:', this.PERMISSION_TO_REINDEX_CONTENT);
  
          } else if (status.role === 'agent') {
            // Agent never have permission
            this.PERMISSION_TO_REINDEX_CONTENT = false;
            console.log('[KB TABLE] - Project user is agent (2)', 'PERMISSION_TO_REINDEX_CONTENT:', this.PERMISSION_TO_REINDEX_CONTENT);
  
          } else {
            // Custom roles: permission depends on matchedPermissions
            this.PERMISSION_TO_REINDEX_CONTENT = status.matchedPermissions.includes(PERMISSIONS.KB_CONTENT_REINDEX);
            console.log('[KB TABLE] - Custom role (3)', status.role, 'PERMISSION_TO_REINDEX_CONTENT:', this.PERMISSION_TO_REINDEX_CONTENT);
          }

          // PERMISSION_TO_CHECK_CONTENT_STATUS
          if (status.role === 'owner' || status.role === 'admin') {
            // Owner and Admin always has permission
            this.PERMISSION_TO_CHECK_CONTENT_STATUS = true;
            console.log('[KB TABLE] - Project user is owner or admin (1)', 'PERMISSION_TO_CHECK_CONTENT_STATUS:', this.PERMISSION_TO_CHECK_CONTENT_STATUS);
  
          } else if (status.role === 'agent') {
            // Agent never have permission
            this.PERMISSION_TO_CHECK_CONTENT_STATUS = false;
            console.log('[KB TABLE] - Project user is agent (2)', 'PERMISSION_TO_CHECK_CONTENT_STATUS:', this.PERMISSION_TO_CHECK_CONTENT_STATUS);
  
          } else {
            // Custom roles: permission depends on matchedPermissions
            this.PERMISSION_TO_CHECK_CONTENT_STATUS = status.matchedPermissions.includes(PERMISSIONS.KB_CONTENT_CHECK_STATUS);
            console.log('[KB TABLE] - Custom role (3)', status.role, 'PERMISSION_TO_REINDEX_CONTENTS:', this.PERMISSION_TO_CHECK_CONTENT_STATUS);
          }

          // PERMISSION_TO_UPDATE_SETTINGS
          if (status.role === 'owner' || status.role === 'admin') {
            // Owner and Admin always has permission
            this.PERMISSION_TO_UPDATE_SETTINGS = true;
            console.log('[KB TABLE] - Project user is owner or admin (1)', 'PERMISSION_TO_UPDATE_SETTINGS:', this.PERMISSION_TO_UPDATE_SETTINGS);
  
          } else if (status.role === 'agent') {
            // Agent never have permission
            this.PERMISSION_TO_UPDATE_SETTINGS = false;
            console.log('[KB TABLE] - Project user is agent (2)', 'PERMISSION_TO_UPDATE_SETTINGS:', this.PERMISSION_TO_UPDATE_SETTINGS);
  
          } else {
            // Custom roles: permission depends on matchedPermissions
            this.PERMISSION_TO_UPDATE_SETTINGS = status.matchedPermissions.includes(PERMISSIONS.KB_SETTINGS_EDIT);
            console.log('[KB TABLE] - Custom role (3)', status.role, 'PERMISSION_TO_UPDATE_SETTINGS:', this.PERMISSION_TO_UPDATE_SETTINGS);
          }

          // PERMISSION_TO_DELETE
          if (status.role === 'owner' || status.role === 'admin') {
            // Owner and Admin always has permission
            this.PERMISSION_TO_DELETE = true;
            console.log('[KB TABLE] - Project user is owner or admin (1)', 'PERMISSION_TO_DELETE:', this.PERMISSION_TO_DELETE);
  
          } else if (status.role === 'agent') {
            // Agent never have permission
            this.PERMISSION_TO_DELETE = false;
            console.log('[KB TABLE] - Project user is agent (2)', 'PERMISSION_TO_DELETE:', this.PERMISSION_TO_DELETE);
  
          } else {
            // Custom roles: permission depends on matchedPermissions
            this.PERMISSION_TO_DELETE = status.matchedPermissions.includes(PERMISSIONS.KB_DELETE);
            console.log('[KB TABLE] - Custom role (3)', status.role, 'PERMISSION_TO_DELETE:', this.PERMISSION_TO_DELETE);
          }


        });
  
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
    // Reset numberPage when kbsList is completely replaced (e.g., after-add or after-update)
    if (changes['kbsList'] && changes['kbsList'].previousValue && changes['kbsList'].previousValue.length > 0) {
      const previousLength = changes['kbsList'].previousValue.length;
      const currentLength = this.kbsList?.length || 0;
      // If list was replaced and we're starting fresh, reset numberPage
      if (currentLength > 0 && previousLength !== currentLength && this.searchParams?.page === 0) {
        this.numberPage = 0;
        this.logger.log('[KB TABLE] Reset numberPage due to list replacement, previous length:', previousLength, 'current length:', currentLength);
      }
    }

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
    this.logger.log('[KB TABLE] ngOnChanges kbsList ', this.kbsList);
    this.logger.log('[KB TABLE] ngOnChanges selectedNamespaceName ', this.selectedNamespaceName);
    this.logger.log('[KB TABLE] ngOnChanges hasRemovedKb ', this.hasRemovedKb);
    console.log('[KB TABLE] ngOnChanges hasUpdatedKb ', this.hasUpdatedKb);
    this.logger.log('[KB TABLE] ngOnChanges getKbCompleted ', this.getKbCompleted);
    this.logger.log('[KB TABLE] ngOnChanges hasAlreadyVisitedKb ', this.hasAlreadyVisitedKb);
    this.logger.log('[KB TABLE] ngOnChanges project_name ', this.project_name);
    
    
    if (this.hasUpdatedKb) {
      // this.onLoadByFilter()
    }

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
    
    // Sync internal sorting state when parent changes sort params (e.g., after adding content)
    if (changes.currentSortParams) {
      if (this.currentSortParams && this.currentSortParams.sortField && this.currentSortParams.direction !== undefined) {
        const previousDirection = this.directionDesc;
        this.searchParams.sortField = this.currentSortParams.sortField;
        this.searchParams.direction = this.currentSortParams.direction;
        this.directionDesc = this.currentSortParams.direction;
        // Reset numberPage when sort params change from parent (e.g., after add/update)
        // This ensures we're on page 0 when parent forces a reload
        if (this.searchParams.page === 0 || changes.currentSortParams.previousValue === null) {
          this.numberPage = 0;
          this.searchParams.page = 0;
        }
        this.logger.log('[KB TABLE] Synced sort params from parent:', this.currentSortParams);
        this.logger.log('[KB TABLE] Previous directionDesc:', previousDirection, 'New directionDesc:', this.directionDesc);
        this.logger.log('[KB TABLE] Reset numberPage to:', this.numberPage);
        this.logger.log('[KB TABLE] Updated searchParams:', this.searchParams);
        // Force change detection with OnPush strategy
        this.cdr.markForCheck();
      }
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
    // Reset page to 0 when sorting
    this.searchParams.page = 0;
    this.numberPage = 0;
    this.isLoading = true;
    this.loadByFilter.next(this.searchParams);
    this.logger.log('[KB TABLE] onOrderBy loadByFilter searchParams ', this.searchParams)
  }

  onLoadByFilter(filterValue?: string, column?: string) {
    this.hasFiltered = true;
    console.log('[KB TABLE] >>>  onLoadByFilter hasFiltered ', this.hasFiltered)
    console.log('[KB TABLE] >>> onLoadByFilter filterStatus ', this.filterStatus)
    console.log('[KB TABLE] >>> onLoadByFilter filterType ', this.filterType)
    // let status = '';
    // let search = '';
    console.log("[KB TABLE] >>> onLoadByFilter value: ", filterValue)
    console.log("[KB TABLE] >>> onLoadByFilter column: ", column)
    console.log("[KB TABLE] >>> onLoadByFilter searchParams: ", this.searchParams)
    
    // If called without parameters (manual refresh), reset page to 0
    if (filterValue === undefined && column === undefined) {
      this.searchParams.page = 0;
      this.numberPage = 0;
      this.logger.log('[KB TABLE] >>> onLoadByFilter - Manual refresh: reset page to 0');
    }
    
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
    if (!this.PERMISSION_TO_REINDEX_CONTENT) {
      this.notify.presentDialogNoPermissionToPermomfAction()
      return;
    } 
    // this.logger.log('onRunIndexing:: ', kb);
    this.runIndexing.emit(kb);
  }

  onOpenBaseModalPreview() {
    if (!this.PERMISSION_TO_UPDATE_SETTINGS) {
      this.notify.presentDialogNoPermissionToPermomfAction()
      return;
    } 
    this.openBaseModalPreview.emit();
  }

  onOpenBaseModalPreviewSettings() {
    if (!this.PERMISSION_TO_UPDATE_SETTINGS) {
      this.notify.presentDialogNoPermissionToPermomfAction()
      return;
    } 

    this.openBaseModalPreviewSettings.emit();
  }

  onOpenAddContent() {
    if (!this.PERMISSION_TO_ADD_CONTENTS) {
    this.notify.presentDialogNoPermissionToPermomfAction()
      return;
    }

    this.logger.log('onOpenAddContent');
    this.onOpenAddContents.emit();
  }

  onOpenBaseModalDelete(kb) {
    if (!this.PERMISSION_TO_DELETE) {
      this.notify.presentDialogNoPermissionToPermomfAction()
      return;
    }
    // kb.deleting = true;
    this.openBaseModalDelete.emit(kb);
  }

  onOpenBaseModalDetail(kb) {
    if (!this.PERMISSION_TO_UPDATE_CONTENT) {
      this.notify.presentDialogNoPermissionToPermomfAction()
      return;
    }
    // this.logger.log("OPEN DETAIL:: ",kb);
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
    if (!this.PERMISSION_TO_CHECK_CONTENT_STATUS) {
      this.notify.presentDialogNoPermissionToPermomfAction()
      return;
    }
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



