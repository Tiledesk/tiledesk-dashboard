import { Component, OnInit, Output, EventEmitter, Input, Inject } from '@angular/core';
import { KB } from 'app/models/kbsettings-model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'modal-delete-knowledge-base',
  templateUrl: './modal-delete-knowledge-base.component.html',
  styleUrls: ['./modal-delete-knowledge-base.component.scss']
})
export class ModalDeleteKnowledgeBaseComponent implements OnInit {
  // @Input() kb: KB;
  // @Output() deleteKnowledgeBase = new EventEmitter();
  @Output() closeBaseModal = new EventEmitter();

  kb: KB;

  deleteKnowledgeBaseModal = 'block';
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalDeleteKnowledgeBaseComponent>,
  ) { 
    // console.log('[MODAL-DELETE-KB] data ', data)
    if (data && data.kb) {
      this.kb = data.kb
    }
  }

  ngOnInit(): void {
  }

  onCloseBaseModal() {
    this.kb.deleting = false;
    this.dialogRef.close();
    // this.closeBaseModal.emit();
  }

  onDeleteKnowledgeBase(kb){
    this.dialogRef.close(kb);
    // this.deleteKnowledgeBase.emit(kb);
  }
}
