import { Component, Input, OnInit, ViewChild, Output, EventEmitter, SimpleChanges, ElementRef, HostListener } from '@angular/core';
// import { MatTableDataSource } from '@angular/material/table';
// import { MatSort, Sort } from '@angular/material/sort';
// import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { KB, KbSettings } from 'app/models/kbsettings-model';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import { KB_DEFAULT_PARAMS } from 'app/utils/util';


@Component({
  selector: 'knowledge-base-table',
  templateUrl: './knowledge-base-table.component.html',
  styleUrls: ['./knowledge-base-table.component.scss']
})


export class KnowledgeBaseTableComponent implements OnInit {
  @Input() refresh: boolean;
  @Input() kbsList: KB[];
  @Input() kbsListCount: number;
  @Output() openBaseModalDetail = new EventEmitter();
  @Output() openBaseModalDelete = new EventEmitter();
  @Output() openBaseModalPreview = new EventEmitter();
  @Output() openAddKnowledgeBaseModal = new EventEmitter();
  @Output() checkStatus = new EventEmitter();
  @Output() runIndexing = new EventEmitter();
  @Output() loadPage = new EventEmitter();
  @Output() loadByFilter = new EventEmitter();
  

  timeoutId: any;
  // kbsListfilterTypeFilter: KB[] = [];
  filterType: string;
  filterText: string;
  @ViewChild('tableBody') tableBody: ElementRef;

  directionDesc: number = KB_DEFAULT_PARAMS.DIRECTION;
  isLoading: boolean = false;
  SHOW_MORE_BTN: boolean = true;
  SHOW_TABLE: boolean = false;
  searchParams: any;
  numberPage: number = 0;
  // kbsListCount: number = 0;

  constructor(
    private _liveAnnouncer: LiveAnnouncer
  ) { }

  ngOnInit(): void {
    this.filterType = '';
    this.filterText = '';
    this.searchParams = {
      "page":0,
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
  //   console.log('onTableScroll', e);
  //   const tableViewHeight = e.target.offsetHeight // viewport
  //   const tableScrollHeight = e.target.scrollHeight // length of all table
  //   const scrollLocation = e.target.scrollTop; // how far user scrolled
  // }



  loadMoreData() {
    this.isLoading = true;
    this.numberPage++;
    this.searchParams.page =  this.numberPage;//Math.floor(this.kbsList.length/KB_DEFAULT_PARAMS.LIMIT);
    
    this.loadPage.emit(this.searchParams);
  }

  // isScrolledToBottom(): boolean {
  //   const tableBodyElement = this.tableBody.nativeElement;
  //   return tableBodyElement.scrollTop + tableBodyElement.clientHeight >= tableBodyElement.scrollHeight;
  // }

  ngOnChanges(changes: SimpleChanges){
    // console.log('ngOnChanges start ------> ', this.kbsListCount, this.kbsList.length, changes);
    if(this.kbsList.length>0){
      this.SHOW_TABLE = true;
    }
    if(changes.kbsList?.currentValue?.length === changes.kbsList?.previousValue?.length){
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
    if(this.kbsListCount > this.kbsList.length){
      this.SHOW_MORE_BTN = true;
    } else {
      this.SHOW_MORE_BTN = false;
    }
    if(changes.refresh){
      this.isLoading = false;
    }
    if(this.kbsList?.length == 0){
      this.SHOW_MORE_BTN = false;
    }

    // console.log('ngOnChanges end -------> ', this.kbsListCount, this.kbsList.length);
  }

  ngAfterViewInit() {
    //console.log('ngAfterViewInit!!!-->', this.kbsList);
    // this.dataSource = new MatTableDataSource(this.kbsList);
    // this.dataSource.sort = this.sort;
    // this.sort.active = "updatedAt";
    // this.sort.direction = "desc"
    // this.dataSource.sortData(this.dataSource.data, this.sort);
    // this.dataSource.paginator = this.paginator;
    // this.paginator.length = this.dataSource.data.length;
    // this.paginator.pageSize = 20;
  }

  onOrderBy(type){
    this.searchParams.sortField = type;
    this.directionDesc = this.directionDesc*-1;
    this.searchParams.direction = this.directionDesc;
    this.isLoading = true;
    this.loadByFilter.next(this.searchParams);
  }
  
  onLoadByFilter(filterValue: string, column: string) {
    // let status = '';
    // let search = '';
    if( column == 'type'){
      this.searchParams.status = filterValue;
    } else if(column == 'name'){
      this.searchParams.search = filterValue;
    }
    // console.log("this.searchParams ", this.searchParams);
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => {
      this.isLoading = true;
      this.loadByFilter.next(this.searchParams);
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

  onRunIndexing(kb){
    // console.log('onRunIndexing:: ', kb);
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
    // console.log("OPEN DETAIL:: ",kb);
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

  onOpenAddKnowledgeBaseModal(type){
    // console.log('onOpenAddKnowledgeBaseModal', type);
    this.openAddKnowledgeBaseModal.emit(type);
  }

  onCheckStatus(kb){
    // console.log('onCheckStatus:: ', kb);
    this.checkStatus.emit(kb);
  }

}



