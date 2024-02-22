import { Component, Input, OnInit, ViewChild, Output, EventEmitter, SimpleChanges, HostListener, ElementRef } from '@angular/core';
// import { MatTableDataSource } from '@angular/material/table';
// import { MatSort, Sort } from '@angular/material/sort';
// import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { KB, KbSettings } from 'app/models/kbsettings-model';
// import {LiveAnnouncer} from '@angular/cdk/a11y';


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
  
  @ViewChild('tableBody') tableBody: ElementRef;
  data: any[] = [];
  isLoading: boolean = false;
  canLoadMore: boolean = true; 

  kbsList: KB[]= [];
  filterType: string;
  pagConfig: any = {};
  pageSize: number = 1;

  constructor(
  ) { }


  ngOnInit(): void {
    this.filterType = '';
    this.kbsList = this.kbs.count;
    this.pagConfig = {
      length: this.kbs.count,
      pageSize: this.pageSize,
      pageIndex: 0,
      status: '',
      search: '',
      direction: -1,
      sortField: 'updatedAt'
    }
    this.onReloadKbs();
  }

  // @HostListener('window:scroll', ['$event'])
  onScroll(event) {
    console.log('onScroll!!!', event);
    // if (this.isScrolledToBottom() && !this.isLoading) {
    //   this.onReloadKbs();
    // }
  }

  // isScrolledToBottom(): boolean {
  //   const tableBodyElement = this.tableBody.nativeElement;
  //   return tableBodyElement.scrollTop + tableBodyElement.clientHeight >= tableBodyElement.scrollHeight;
  // }

  ngOnChanges(changes: SimpleChanges){
    console.log('ngOnChanges!!!', changes);
    // let xx: MatPaginatorIntl;
    //xx.itemsPerPageLabel = "xxx";
    this.kbsList += this.kbs.kbs;
    // this.dataSource = new MatTableDataSource(this.kbsList);
    // if(this.kbsList) {
    //   this.dataSource = new MatTableDataSource(this.kbsList);
    // }
    if( this.pagConfig)this.pagConfig.length = this.kbs.count;
  }

  ngAfterViewInit() {
    //console.log('ngAfterViewInit!!!-->', this.kbsList);
    this.kbsList = this.kbs.kbs;
    // Crea un observer per rilevare quando l'ultimo elemento diventa visibile
    // const observer = new IntersectionObserver(entries => {
    //   console.log('ultimo elemento diventa visibile!!!', entries);
    //   if (entries[0].isIntersecting) {
    //     // Carica ulteriori dati quando l'ultimo elemento diventa visibile
    //     this.loadData();
    //   }
    // });
    // // Collega l'observer all'ultimo elemento della tabella
    // observer.observe(this.tableBody.nativeElement.lastElementChild);


    // this.dataSource = new MatTableDataSource(this.kbsList);
    // this.dataSource.sort = this.sort;
    // this.sort.active = "updatedAt";
    // this.sort.direction = "desc"
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.sortData(this.dataSource.data, this.sort);
    // if(this.paginator) {
    //   this.paginator.length = 30;
    //   // this.paginator.pageSize = 1;
    //   // this.paginator.pageIndex = 1;
    // }
    // this.ellipsText("th-width", "ellipsis-max-width");
  }
  
  // ellipsText(idDivWidth, classNameEllipsis){
  //   var divThName = document.getElementById(idDivWidth);
  //   if (divThName) {
  //     var larghezzaDiv = divThName.offsetWidth;
  //     var elements = document.getElementsByClassName(classNameEllipsis);
  //     for (var i = 0; i < elements.length; i++) {
  //       elements[i].classList.add("ellipsis-text");
  //       var elementoConStyle = elements[i] as HTMLElement;
  //       elementoConStyle.style.maxWidth = larghezzaDiv+'px!important';
  //     }
  //   }
  // }

  applyFilter(filterValue: string, column: string) {
    //let params = "?limit="+this.pageSize+"&page="+this.pageIndex;
    if( column == 'type'){
      // this.filterType = filterValue;
      this.pagConfig.status = filterValue;
    } else if(column == 'name'){
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

  onReloadKbs(): void {
    // Simuliamo il caricamento dei dati (20 elementi alla volta)
    //this.isLoading = true;
    setTimeout(() => {
      let params = "?limit="+this.pagConfig.pageSize+"&page="+this.pagConfig.pageIndex+"&direction="+this.pagConfig.direction+"&sortField="+this.pagConfig.sortField+"&status="+this.pagConfig.status+"&search="+this.pagConfig.search;
      this.reloadKbs.emit(params);
      //this.isLoading = false;
    }, 1000); // Simuliamo un ritardo di caricamento di 1 secondo
  }




  loadMoreData() {
    this.onReloadKbs();
  }


  getListOfKb(params?) {
    //this.showSpinner = true;
    let paramsDefault = "?limit=10&page=0";
    let urlParams = params?params:paramsDefault;
    // this.kbService.getListOfKb(urlParams).subscribe((kbResp:any) => {
    //   this.kbs = kbResp;
    //   this.kbsList = kbResp.kbs;
    //   //this.kbsListCount = kbList.count;
    //   //this.refreshKbsList = !this.refreshKbsList;
    //   //this.showSpinner = false;
    // }, (error) => {
    //   //this.logger.error("[KNOWLEDGE BASES COMP] ERROR get kbSettings: ", error);
    //   //this.showSpinner = false;
    // }, () => {
    //   //this.logger.log("[KNOWLEDGE BASES COMP] get kbSettings *COMPLETE*");
    //   //this.showSpinner = false;
    // })
  }

  onShortBy(type){
    // if(type == 'createdAt'){
    //   this.pagConfig.sortField = type;
    // } else if(type == 'name'){
    //   this.pagConfig.sortField = type;
    // }
    this.pagConfig.sortField = type;
    this.pagConfig.direction = this.pagConfig.direction*-1;
    this.onReloadKbs();
  }

  onRunIndexing(kb){
    // console.log('onRunIndexing:: ', kb);
    this.runIndexing.emit(kb);
  }

  onOpenBaseModalPreview(){
    this.openBaseModalPreview.emit();
  }

  onOpenBaseModalDelete(kb){
    // kb.deleting = true;
    this.openBaseModalDelete.emit(kb);
  }

  onOpenBaseModalDetail(kb){
    // console.log("OPEN DETAIL:: ",kb);
    this.openBaseModalDetail.emit(kb);
  }

  getSubtitle(kb){
    let subtitle = kb.source;
    if(kb.type !== 'url'){
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
    console.log('Page change event:', event);
    this.pagConfig.pageSize = event.pageSize;
    this.pagConfig.pageIndex = event.pageIndex,
    this.onReloadKbs();
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



