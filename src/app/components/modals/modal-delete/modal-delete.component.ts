import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'appdashboard-modal-delete',
  templateUrl: './modal-delete.component.html',
  styleUrls: ['./modal-delete.component.scss']
})
export class ModalDeleteComponent implements OnInit {
  @Output() confirmDeleteModal = new EventEmitter();
  @Output() closeDeleteModal = new EventEmitter();
  @Input() translateMap: any;
  @Input() objectId: string;
  
  constructor() { }

  ngOnInit(): void {
  }


  confirmDelete() {
    // console.log('confirmDelete: ', this.objectId);
    this.confirmDeleteModal.emit(this.objectId);
  }

  closeDelete() {
    this.closeDeleteModal.emit();
  }

}
