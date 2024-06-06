import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'modal-delete-namespace',
  templateUrl: './modal-delete-namespace.component.html',
  styleUrls: ['./modal-delete-namespace.component.scss']
})
export class ModalDeleteNamespaceComponent implements OnInit, OnChanges {

  @Output() closeModal = new EventEmitter();
  @Output() deleteNamespace = new EventEmitter();
  @Input() selectedNamespace: string

  deleteAlsoNamespace: boolean = false
  namespaceTyped: string;
  namespacenameMatch: boolean = false


  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {

    console.log('[MODAL DELETE NAMESPACE AND CONTENTS] selectedNamespace', this.selectedNamespace)

  }

  onCloseModal() {
    // console.log("close modal")
    this.closeModal.emit();
  }

  hasSelectedDeleteNamespace(event) {
    console.log('[MODAL DELETE NAMESPACE AND CONTENTS] hasSelectedDeleteNamespace', event.target.checked)
    this.deleteAlsoNamespace = event.target.checked
  }

  checkNamespaceTyped() {
    console.log('[MODAL DELETE NAMESPACE AND CONTENTS] namespaceTyped ', this.namespaceTyped)
    if (this.namespaceTyped !== this.selectedNamespace) {
      this.namespacenameMatch = false 
    } else {
      this.namespacenameMatch = true 
    }
  }

  onDeleteNamespace() {
    this.deleteNamespace.emit();
  }

}
