import { Component, Input, OnInit, ViewChild, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { KB, KbSettings } from 'app/models/kbsettings-model';
import { LiveAnnouncer } from '@angular/cdk/a11y';


@Component({
  selector: 'knowledge-base-table',
  templateUrl: './knowledge-base-table.component.html',
  styleUrls: ['./knowledge-base-table.component.scss']
})


export class KnowledgeBaseTableComponent implements OnInit {
  @Input() refresh: boolean;
  @Input() kbs: any;
  //@Input() kbsList: KB[];
  //@Input() pagConfig: any;
  @Output() openBaseModalDetail = new EventEmitter();
  @Output() openBaseModalDelete = new EventEmitter();
  @Output() openBaseModalPreview = new EventEmitter();
  @Output() runIndexing = new EventEmitter();
  @Output() reloadKbs = new EventEmitter();

  kbsList: KB[] = [];
  kbsListfilterTypeFilter: KB[] = [];
  dataSource: MatTableDataSource<KB>;
  displayedColumns: string[] = ['type', 'status', 'createdAt', 'name', 'actions'];
  filterType: string;
  // filterText: string;
  pagConfig: any;
  pageSize: number = 10;
  pageIndex: number = 0;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    public pag: MatPaginatorIntl
  ) { }

  ngOnInit(): void {
    this.filterType = '';
    // this.filterText = '';
    this.pag.firstPageLabel = 'first page:';
    this.pag.itemsPerPageLabel = 'items per page';
    this.pag.lastPageLabel = 'last page';
    this.pag.nextPageLabel = 'next page';
    this.pag.previousPageLabel = 'previous page';

    this.pagConfig = {
      length: 0,
      pageSize: this.pageSize,
      pageIndex: 0,
      status: '',
      search: '',
      direction: -1,
      sortField: 'updatedAt'
    }

  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.kbs) {
      this.kbsList = this.kbs.kbs;
      this.pagConfig = {
        length: this.kbs.count,
        pageSize: this.pageSize,
        pageIndex: 0,
        status: '',
        search: '',
        direction: -1,
        sortField: 'updatedAt'
      }
    }

    this.dataSource = new MatTableDataSource(this.kbsList);
    if (this.kbsList) {
      this.dataSource = new MatTableDataSource(this.kbsList);
      // this.dataSource.sort = this.sort;
      // this.dataSource.paginator = this.paginator;
    }
    if (this.pagConfig && this.kbs) {
      this.pagConfig.length = this.kbs.count;
    }
    // Math.ceil(this.kbs.count/this.pagConfig.pageSize);
  }

  ngAfterViewInit() {
    //console.log('ngAfterViewInit!!!-->', this.kbsList);
    this.kbsList = [];
    if (this.kbs && this.kbs.kbs) {
      this.kbsList = this.kbs.kbs;
    }
    this.dataSource = new MatTableDataSource(this.kbsList);

    this.dataSource.sort = this.sort;
    this.sort.active = "updatedAt";
    this.sort.direction = "desc"
    // this.dataSource.paginator = this.paginator;
    this.dataSource.sortData(this.dataSource.data, this.sort);
    this.dataSource.paginator = this.paginator;
    // this.paginator.length = this.dataSource.data.length;
    // this.paginator.pageSize = 20;
  }


  applyFilter(filterValue: string, column: string) {
    //let params = "?limit="+this.pageSize+"&page="+this.pageIndex;
    if (column == 'type') {
      // this.filterType = filterValue;
      this.pagConfig.status = filterValue;
    } else if (column == 'name') {
      // this.filterText= filterValue;
      this.pagConfig.search = filterValue;
    }
    this.onReloadKbs();
    //console.log('onOptionSelected:: ', filterValue, column, this.filterType, this.filterText);
    // this.dataSource.filterPredicate = (data: KB, filter: string) => {
    //   if(this.filterType && this.filterText){
    //     return data.name.toLowerCase().includes(this.filterText) && data.status.toString() === this.filterType;
    //   } 
    //   if(this.filterText && this.filterText != ""){
    //     return data.name.toLowerCase().includes(this.filterText);
    //   } 
    //   if(this.filterType && this.filterType != ""){
    //     return data.status.toString() === this.filterType;
    //   } 
    //   return true;

    // }
    // this.dataSource.filter = filterValue;
    // if (this.dataSource.paginator) {
    //   this.dataSource.paginator.firstPage();
    // }
  }


  /** Announce the change in sort state for assistive technology. */
  // announceSortChange(sortState: Sort) {
  //   if (sortState.direction) {
  //     this._liveAnnouncer.announce(`Sorted ${sortState.direction} ending`);
  //   } else {
  //     this._liveAnnouncer.announce('Sorting cleared');
  //   }
  // }

  onShortBy(type) {
    if (type == 'createdAt') {
      this.pagConfig.sortField = type;
    } else if (type == 'name') {
      this.pagConfig.sortField = type;
    }
    this.pagConfig.direction = this.pagConfig.direction * -1;
    this.onReloadKbs();
  }

  onRunIndexing(kb) {
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



  handlePageChange(event: any) {
    // console.log('Page change event:', event);
    this.pagConfig.pageSize = event.pageSize;
    this.pagConfig.pageIndex = event.pageIndex,
      this.onReloadKbs();
  }

  onReloadKbs() {
    let params = "?limit=" + this.pagConfig.pageSize + "&page=" + this.pagConfig.pageIndex + "&direction=" + this.pagConfig.direction + "&sortField=" + this.pagConfig.sortField + "&status=" + this.pagConfig.status + "&search=" + this.pagConfig.search;
    this.reloadKbs.emit(params);
  }
  // handlePageSizeChange(event: any) {
  //   console.log('Page size change event:', event);n
  // }

  // handlePageSizeOptionsChange(event: any) {
  //   console.log('Page size options change event:', event);
  // }

  // handleLengthChange(event: any) {
  //   console.log('Length change event:', event);
  // }

  // handlePageIndexChange(event: any) {
  //   console.log('Page index change event:', event);
  // }

  // handlePageEvent(event: any) {
  //   console.log('Generic page event:', event);
  // }
}



