import { Component, Input, OnInit, ViewChild, Output, EventEmitter, SimpleChanges, ElementRef, HostListener } from '@angular/core';
// import { MatTableDataSource } from '@angular/material/table';
// import { MatSort, Sort } from '@angular/material/sort';
// import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { KB, KbSettings } from 'app/models/kbsettings-model';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { KB_DEFAULT_PARAMS } from 'app/utils/util';
import { LoggerService } from 'app/services/logger/logger.service';
import { BrandService } from 'app/services/brand.service';


@Component({
  selector: 'knowledge-base-table',
  templateUrl: './knowledge-base-table.component.html',
  styleUrls: ['./knowledge-base-table.component.scss']
})


export class KnowledgeBaseTableComponent implements OnInit {
  @Input() refresh: boolean;
  @Input() kbsList: KB[];
  @Input() kbsListCount: number;
  @Input() selectedNamespaceName: any
  @Input() hasRemovedKb: boolean;
  @Input() hasUpdatedKb: boolean;
  @Input() getKbCompleted: boolean;
  @Output() openBaseModalDetail = new EventEmitter();
  @Output() openBaseModalDelete = new EventEmitter();
  @Output() openBaseModalPreview = new EventEmitter();
  @Output() openAddKnowledgeBaseModal = new EventEmitter();
  @Output() checkStatus = new EventEmitter();
  @Output() runIndexing = new EventEmitter();
  @Output() loadPage = new EventEmitter();
  @Output() loadByFilter = new EventEmitter();
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
  hideHelpLink: boolean
  // kbsListCount: number = 0;

  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    private logger: LoggerService,
    public brandService: BrandService
  ) {
    this.logger.log('[KB TABLE] HELLO SHOW_TABLE !!!!!', this.SHOW_TABLE);
    const brand = brandService.getBrand(); 
    this.hideHelpLink= brand['DOCS'];
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

  // @HostListener('window:scroll', ['$event'])
  // onScroll(event) {
  //   if (this.isScrolledToBottom() && !this.isLoading && this.SHOW_MORE_BTN) {
  //     //this.loadData();
  //   }
  // }


  // onTableScroll(e) {
  //   this.logger.log('onTableScroll', e);
  //   const tableViewHeight = e.target.offsetHeight // viewport
  //   const tableScrollHeight = e.target.scrollHeight // length of all table
  //   const scrollLocation = e.target.scrollTop; // how far user scrolled
  // }



  loadMoreData() {
    this.isLoading = true;
    this.numberPage++;
    this.searchParams.page = this.numberPage;//Math.floor(this.kbsList.length/KB_DEFAULT_PARAMS.LIMIT);
    // console.log('[KB TABLE] emit loadPage searchParams', this.searchParams) 
    this.loadPage.emit(this.searchParams);
  }

  // isScrolledToBottom(): boolean {
  //   const tableBodyElement = this.tableBody.nativeElement;
  //   return tableBodyElement.scrollTop + tableBodyElement.clientHeight >= tableBodyElement.scrollHeight;
  // }

  ngOnChanges(changes: SimpleChanges) {
    this.logger.log('[KB TABLE] ngOnChanges kbsListCount', this.kbsListCount, '  kbsList.length ', this.kbsList.length, ' changes ', changes);
    this.logger.log('[KB TABLE] ngOnChanges kbsList ', this.kbsList);
    this.logger.log('[KB TABLE] ngOnChanges selectedNamespaceName ', this.selectedNamespaceName);
    this.logger.log('[KB TABLE] ngOnChanges hasRemovedKb ', this.hasRemovedKb);
    this.logger.log('[KB TABLE] ngOnChanges hasUpdatedKb ', this.hasUpdatedKb);
    this.logger.log('[KB TABLE] ngOnChanges getKbCompleted ', this.getKbCompleted);
    
    

    if (this.hasRemovedKb && this.kbsList.length === 0)  {
      this.SHOW_TABLE = false;
    }
    


    if (changes.selectedNamespaceName && changes.selectedNamespaceName.firstChange) {
      if (this.getKbCompleted) { 
        this.retrieveKbAndSwowTable('firstChange', this.kbsList, this.getKbCompleted)
      }
      // if ((this.kbsList.length === 0)) {
      //   this.SHOW_TABLE = false;
      // } else {
      //   this.SHOW_TABLE = true;
      // }

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

        // if (this.getKbCompleted) {
          // this.retrieveKbAndSwowTable('namespace-changed', this.kbsList, this.getKbCompleted)
         
        // }
      }
    }
   

    this.logger.log('[KB TABLE] ngOnChanges selectedNamespaceName ', this.selectedNamespaceName);
    this.logger.log('[KB TABLE] ngOnChanges filterStatus ', this.filterStatus);
    this.logger.log('[KB TABLE] ngOnChanges filterType ', this.filterType);
    this.logger.log('[KB TABLE] ngOnChanges filterText ', this.filterText);



    if (this.kbsList.length > 0) {
      this.SHOW_TABLE = true;
    }  
    // else {
    //   this.SHOW_TABLE = false;
    // }
    
    // else if ((this.kbsList.length === 0)) {
    //   if (this.filterStatus === '' && this.filterType === '' && this.filterText === '') {
    //      this.logger.log('[KB TABLE] ngOnChanges HERE YES filterStatus ', this.filterStatus);
    //     this.SHOW_TABLE = false;
    //   }
    // }

    // console.log('[KB TABLE] ngOnChanges SHOW_TABLE ', this.SHOW_TABLE);
    if (changes.kbsList?.currentValue?.length === changes.kbsList?.previousValue?.length) {
      // non è cambiato nulla ho solo rodinato la tab
    } else {
      // if(changes.kbsListCount && changes.kbsListCount.currentValue){
      //   this.kbsListCount = changes.kbsListCount.currentValue;
      // } else if(changes.kbsList && changes.kbsList.currentValue){
      //   this.kbsListCount = changes.kbsList.currentValue.length;
      // }
    }

    // if(this.kbsListCount==0){
    //   this.SHOW_MORE_BTN = false;
    // }
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
    //this.logger.log('ngAfterViewInit!!!-->', this.kbsList);
    // this.dataSource = new MatTableDataSource(this.kbsList);
    // this.dataSource.sort = this.sort;
    // this.sort.active = "updatedAt";
    // this.sort.direction = "desc"
    // this.dataSource.sortData(this.dataSource.data, this.sort);
    // this.dataSource.paginator = this.paginator;
    // this.paginator.length = this.dataSource.data.length;
    // this.paginator.pageSize = 20;
  }

  onOrderBy(type) {
 
    this.searchParams.sortField = type;
    this.directionDesc = this.directionDesc * -1;
    this.searchParams.direction = this.directionDesc;
    this.isLoading = true;
    this.loadByFilter.next(this.searchParams);
    // console.log('[KB TABLE] onOrderBy loadByFilter searchParams ', this.searchParams)
  }

  onLoadByFilter(filterValue: string, column: string) {
    this.hasFiltered = true;
    this.logger.log('[KB TABLE] >>> hasFiltered ', this.hasFiltered)
    this.logger.log('[KB TABLE] >>> filterStatus ', this.filterStatus)
    this.logger.log('[KB TABLE] >>> filterType ', this.filterType)
    // let status = '';
    // let search = '';
    this.logger.log("[KB TABLE] >>> onLoadByFilter value: ", filterValue)
    this.logger.log("[KB TABLE] >>> onLoadByFilter column: ", column)

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
      // console.log('[KB TABLE] onOrderBy onLoadByFilter searchParams ', this.searchParams)
    }, 1000);
  }


  /** Announce the change in sort state for assistive technology. */
  // announceSortChange(sortState: Sort) {
  //   if (sortState.direction) {
  //     this._liveAnnouncer.announce(`Sorted ${sortState.direction} ending`);
  //   } else {
  //     this._liveAnnouncer.announce('Sorting cleared');
  //   }
  // }

  onRunIndexing(kb) {
    // this.logger.log('onRunIndexing:: ', kb);
    this.runIndexing.emit(kb);
  }

  onOpenBaseModalPreview() {
    this.openBaseModalPreview.emit();
  }

  onOpenBaseModalDelete(kb) {
    // kb.deleting = true;
    this.openBaseModalDelete.emit(kb);
  }

  onOpenBaseModalDetail(kb) {
    // this.logger.log("OPEN DETAIL:: ",kb);
    this.openBaseModalDetail.emit(kb);
  }

  getSubtitle(kb) {
    let subtitle = kb.source;
    if (kb.type !== 'url') {
      subtitle = kb.content;
      // const maxLength = 100;
      // if (kb.content.length > maxLength) {
      //   subtitle = kb.content.substring(0, maxLength) + '...';
      // } else {
      //   subtitle = kb.content;
      // }
    }
    return subtitle;
  }

  onOpenAddKnowledgeBaseModal(type) {
    // this.logger.log('onOpenAddKnowledgeBaseModal', type);
    this.openAddKnowledgeBaseModal.emit(type);
  }

  onCheckStatus(kb) {
    // this.logger.log('onCheckStatus:: ', kb);
    this.checkStatus.emit(kb);
  }

}



