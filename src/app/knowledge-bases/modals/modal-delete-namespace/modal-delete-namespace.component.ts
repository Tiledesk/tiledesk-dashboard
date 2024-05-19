import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'modal-delete-namespace',
  templateUrl: './modal-delete-namespace.component.html',
  styleUrls: ['./modal-delete-namespace.component.scss']
})
export class ModalDeleteNamespaceComponent implements OnInit {

  @Output() closeModal = new EventEmitter();
  @Output() deleteNamespace = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  onCloseModal() {
    // console.log("close modal")
    this.closeModal.emit();
  }

  onDeleteNamespace(){
    this.deleteNamespace.emit();
  }

}
