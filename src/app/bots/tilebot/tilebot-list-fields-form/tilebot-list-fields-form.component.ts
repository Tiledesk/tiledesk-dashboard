import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'appdashboard-tilebot-list-fields-form',
  templateUrl: './tilebot-list-fields-form.component.html',
  styleUrls: ['./tilebot-list-fields-form.component.scss']
})
export class TilebotListFieldsFormComponent implements OnInit, OnChanges {
  @Output() eventEditField = new EventEmitter();
  @Output() openDeleteFieldModal = new EventEmitter();
  @Output() eventDropField = new EventEmitter();
  
  @Input() fields: [any];

  // modal
  displayMODAL = false;
  translateMap: any;
  selectedObjectId: number;

  // add edit form
  selectedField: any;


  constructor(
    private logger: LoggerService,
  ) {
    // void
  }

  ngOnInit(): void {
    this.selectedObjectId = null;
  }

  ngOnChanges() {
    // console.log('[TILEBOT LIST FIELD] fields', this.fields)
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.fields, event.previousIndex, event.currentIndex);
    this.selectedField = null;
    this.eventDropField.emit(this.fields);
  }

  logValue() {
    // console.log(this.fields);
  }

  // EVENTS //
  /** Event modal open delete field */
  deleteFieldModal(index: number) {
    this.openDeleteFieldModal.emit(index);
  }

  /** Event edit field */
  editField(index: number) {
    this.selectedObjectId = index;
    this.eventEditField.emit(index);
  }

}
