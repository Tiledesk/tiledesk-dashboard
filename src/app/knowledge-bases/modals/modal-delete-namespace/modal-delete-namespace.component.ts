import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { KB } from 'app/models/kbsettings-model';

@Component({
  selector: 'modal-delete-namespace',
  templateUrl: './modal-delete-namespace.component.html',
  styleUrls: ['./modal-delete-namespace.component.scss']
})
export class ModalDeleteNamespaceComponent implements OnInit, OnChanges {

  @Output() closeModal = new EventEmitter();
  @Output() deleteNamespace = new EventEmitter<any>();
  @Input() selectedNamespace: any;
  // @Input() selectedNamespaceIsDefault: boolean
  @Input() kbsList: KB[];

  deleteAlsoNamespace: boolean = false
  namespaceTyped: string;
  namespacenameMatch: boolean = false


  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {

    console.log('[MODAL DELETE NAMESPACE AND CONTENTS] selectedNamespace', this.selectedNamespace)
    // console.log('[MODAL DELETE NAMESPACE AND CONTENTS] selectedNamespaceIsDefault', this.selectedNamespaceIsDefault)
    console.log('[MODAL DELETE NAMESPACE AND CONTENTS] kbsList', this.kbsList)
    if( this.kbsList.length === 0) {
      this.deleteAlsoNamespace = true
    }
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
    if (this.namespaceTyped !== this.selectedNamespace.name) {
      this.namespacenameMatch = false 
    } else {
      this.namespacenameMatch = true 
    }
  }

  onDeleteNamespace() {
    this.deleteNamespace.emit(this.deleteAlsoNamespace );
  }

}
