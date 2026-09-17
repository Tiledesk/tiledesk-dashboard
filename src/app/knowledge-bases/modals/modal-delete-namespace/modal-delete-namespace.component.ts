import { Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { KB } from 'app/models/kbsettings-model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { RolesService } from 'app/services/roles.service';
import { takeUntil } from 'rxjs/operators';
import { PERMISSIONS } from 'app/utils/permissions.constants';

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
  private unsubscribe$: Subject<any> = new Subject<any>();  

  hasDefaultRole: boolean;
  ROLE: string;
  PERMISSIONS: any;
  PERMISSION_TO_DELETE_NAMESPACE: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalDeleteNamespaceComponent>,
    private rolesService: RolesService,
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
    //  this.listenToProjectUser()
  }

    listenToProjectUser() {
        this.rolesService.listenToProjectUserPermissions(this.unsubscribe$);
    
        this.rolesService.getUpdateRequestPermission()
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(status => {
            this.ROLE = status.role;
            this.PERMISSIONS = status.matchedPermissions;
            console.log('[MODAL-DELETE] - this.ROLE:', this.ROLE);
            console.log('[MODAL-DELETE] - this.PERMISSIONS', this.PERMISSIONS);
            this.hasDefaultRole = ['owner', 'admin', 'agent'].includes(status.role);
            console.log('[MODAL-DELETE] - hasDefaultRole', this.hasDefaultRole);
    
  
            // PERMISSION_TO_DELETE_NAMESPACE
            if (status.role === 'owner' || status.role === 'admin') {
              // Owner and Admin always has permission
              this.PERMISSION_TO_DELETE_NAMESPACE = true;
              console.log('[MODAL-DELETE] - Project user is owner or admin (1)', 'PERMISSION_TO_DELETE_NAMESPACE:', this.PERMISSION_TO_DELETE_NAMESPACE);
    
            } else if (status.role === 'agent') {
              // Agent never have permission
              this.PERMISSION_TO_DELETE_NAMESPACE = false;
              console.log('[KB TABLE] - Project user is agent (2)', 'PERMISSION_TO_DELETE_NAMESPACE:', this.PERMISSION_TO_DELETE_NAMESPACE);
    
            } else {
              // Custom roles: permission depends on matchedPermissions
              this.PERMISSION_TO_DELETE_NAMESPACE = status.matchedPermissions.includes(PERMISSIONS.KB_DELETE);
              console.log('[KB TABLE] - Custom role (3)', status.role, 'PERMISSION_TO_DELETE_NAMESPACE:', this.PERMISSION_TO_DELETE_NAMESPACE);
            }
  
  
          });
    
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
