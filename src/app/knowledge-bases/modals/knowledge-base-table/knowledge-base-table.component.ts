import { Component, Input, OnInit, ViewChild, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
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
  @Output() openBaseModalDelete = new EventEmitter();
  @Output() openBaseModalPreview = new EventEmitter();
  @Output() runIndexing = new EventEmitter();
  
  

  dataSource: MatTableDataSource<KB>;
  displayedColumns: string[] = ['type','status','createdAt','name','actions'];

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private _liveAnnouncer: LiveAnnouncer
  ) { }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.kbsList);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  ngOnChanges(changes: SimpleChanges){
    console.log('ngOnChanges!!!', changes);
    if(this.kbsList) {
      this.dataSource = new MatTableDataSource(this.kbsList);
    }
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event): void {
   
    const filterValue = (event.target as HTMLInputElement).value;
    console.log('onOptionSelected:: ', filterValue);
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onOptionSelected(event): void {
    console.log('onOptionSelected:: ', event);
    const statusValue = event.value;
    //(event.target as HTMLSelectElement).value;
    //  console.log('onOptionSelected:: ', statusValue);
    this.dataSource.filterPredicate = (data: KB, filter: string) => {
      if (statusValue === '') {
        return true; // Mostra tutti gli elementi se nessun filtro è selezionato
      } else {
        return data.status.toString() === statusValue;
      }
    };
    this.dataSource.filter = statusValue;
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
    this.openBaseModalDelete.emit(kb);
  }


}



