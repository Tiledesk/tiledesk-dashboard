import { Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { KB } from 'app/models/kbsettings-model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'modal-delete-namespace',
  templateUrl: './modal-delete-namespace.component.html',
  styleUrls: ['./modal-delete-namespace.component.scss']
})
export class ModalDeleteNamespaceComponent implements OnInit {

  // @Output() closeModal = new EventEmitter();
  // @Output() deleteNamespace = new EventEmitter<any>();
  // @Input() selectedNamespace: any;
  // @Input() selectedNamespaceIsDefault: boolean
  // @Input() kbsList: KB[];

  public selectedNamespace: any;
  namespaces: any;
  kbsList: KB[];
  deleteAlsoNamespace: boolean = false;
  namespaceTyped: string;
  namespacenameMatch: boolean = false;
  nameSpaceIndex: any;




  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalDeleteNamespaceComponent>,
  ) { 
    // console.log('[MODAL DELETE NAMESPACE AND CONTENTS] data ', data)
    if (data && data.selectedNamespace ) {
        this.selectedNamespace = data.selectedNamespace;
        // console.log('[MODAL DELETE NAMESPACE AND CONTENTS] selectedNamespace ',  this.selectedNamespace)
    }

    if (data && data.namespaces ) {
      this.namespaces = data.namespaces;
      // console.log('[MODAL DELETE NAMESPACE AND CONTENTS] namespaces ',  this.namespaces)
    }


    if (data && data.kbsList ) {
      this.kbsList = data.kbsList;
      // console.log('[MODAL DELETE NAMESPACE AND CONTENTS] kbsList ',  this.kbsList)

      if( this.kbsList.length === 0) {
        this.deleteAlsoNamespace = true
      }
    }

    this.nameSpaceIndex = this.namespaces.findIndex((e) => e.id === this.selectedNamespace.id);
    // console.log('[MODAL DELETE NAMESPACE AND CONTENTS] nameSpaceIndex ',  this.nameSpaceIndex)
  }

  ngOnInit(): void {
  }

  // ngOnChanges(changes: SimpleChanges): void {

  //   console.log('[MODAL DELETE NAMESPACE AND CONTENTS] selectedNamespace', this.selectedNamespace)
  //   // console.log('[MODAL DELETE NAMESPACE AND CONTENTS] selectedNamespaceIsDefault', this.selectedNamespaceIsDefault)
  //   console.log('[MODAL DELETE NAMESPACE AND CONTENTS] kbsList', this.kbsList)
  //   if( this.kbsList.length === 0) {
  //     this.deleteAlsoNamespace = true
  //   }
  // }

 

  hasSelectedDeleteNamespace(event) {
    // console.log('[MODAL DELETE NAMESPACE AND CONTENTS] hasSelectedDeleteNamespace', event.target.checked)
    this.deleteAlsoNamespace = event.target.checked
  }

  checkNamespaceTyped() {
    // console.log('[MODAL DELETE NAMESPACE AND CONTENTS] namespaceTyped ', this.namespaceTyped)
    if (this.namespaceTyped !== this.selectedNamespace.name) {
      this.namespacenameMatch = false 
    } else {
      this.namespacenameMatch = true 
    }
  }

  onCloseModal() {
    // this.closeModal.emit();
    this.dialogRef.close();
  }

  onDeleteNamespace() {
    this.dialogRef.close({deleteAlsoNamespace: this.deleteAlsoNamespace, nameSpaceIdex: this.nameSpaceIndex});
    // this.deleteNamespace.emit(this.deleteAlsoNamespace );
  }

}
