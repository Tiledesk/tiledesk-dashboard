import { Component, Input, OnInit, ViewChild, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { KB, KbSettings } from 'app/models/kbsettings-model';
import {LiveAnnouncer} from '@angular/cdk/a11y';


@Component({
  selector: 'knowledge-base-table',
  templateUrl: './knowledge-base-table.component.html',
  styleUrls: ['./knowledge-base-table.component.scss']
})


export class KnowledgeBaseTableComponent implements OnInit {
  @Input() refresh: boolean;
  @Input() kbsList: KB[];
  @Output() openBaseModalDetail = new EventEmitter();
  @Output() openBaseModalDelete = new EventEmitter();
  @Output() openBaseModalPreview = new EventEmitter();
  @Output() runIndexing = new EventEmitter();
  
  
  kbsListfilterTypeFilter: KB[] = [];
  dataSource: MatTableDataSource<KB>;
  displayedColumns: string[] = ['type','status','createdAt','name','actions'];
  filterType: string;
  filterText: string;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    public pag: MatPaginatorIntl
  ) { }

  ngOnInit(): void {
    this.filterType = '';
    this.filterText = '';
    this.pag.firstPageLabel = 'first page:';
    this.pag.itemsPerPageLabel = 'items per page';
    this.pag.lastPageLabel = 'last page';
    this.pag.nextPageLabel = 'next page';
    this.pag.previousPageLabel = 'previous page';
  }

  ngOnChanges(changes: SimpleChanges){
    //console.log('ngOnChanges!!!', changes);
    //let xx: MatPaginatorIntl;
    //xx.itemsPerPageLabel = "xxx";

    this.dataSource = new MatTableDataSource(this.kbsList);
    if(this.kbsList) {
      this.dataSource = new MatTableDataSource(this.kbsList);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }
  }

  ngAfterViewInit() {
    //console.log('ngAfterViewInit!!!-->', this.kbsList);
    this.dataSource = new MatTableDataSource(this.kbsList);
    this.dataSource.sort = this.sort;
    this.sort.active = "updatedAt";
    this.sort.direction = "desc"
    this.dataSource.sortData(this.dataSource.data, this.sort);
    this.dataSource.paginator = this.paginator;
    this.paginator.length = this.dataSource.data.length;
    this.paginator.pageSize = 20;
  }


  applyFilter(filterValue: string, column: string) {
    if( column == 'type'){
      this.filterType = filterValue;
    } else if(column == 'name'){
      this.filterText= filterValue;
    }
    //console.log('onOptionSelected:: ', filterValue, column, this.filterType, this.filterText);
    this.dataSource.filterPredicate = (data: KB, filter: string) => {
      if(this.filterType && this.filterText){
        return data.name.toLowerCase().includes(this.filterText) && data.status.toString() === this.filterType;
      } 
      if(this.filterText && this.filterText != ""){
        return data.name.toLowerCase().includes(this.filterText);
      } 
      if(this.filterType && this.filterType != ""){
        return data.status.toString() === this.filterType;
      } 
      return true;
      
    }
    this.dataSource.filter = filterValue;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction} ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }


  onRunIndexing(kb){
    console.log('onRunIndexing:: ', kb);
    this.runIndexing.emit(kb);
  }

  onOpenBaseModalPreview(){
    this.openBaseModalPreview.emit();
  }

  onOpenBaseModalDelete(kb){
    kb.status = 2;
    this.openBaseModalDelete.emit(kb);
  }

  onOpenBaseModalDetail(kb){
    console.log("OPEN DETAIL:: ",kb);
    this.openBaseModalDetail.emit(kb);
  }

}



