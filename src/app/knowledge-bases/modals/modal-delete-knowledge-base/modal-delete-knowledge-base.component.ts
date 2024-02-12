import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { KB } from 'app/models/kbsettings-model';

@Component({
  selector: 'modal-delete-knowledge-base',
  templateUrl: './modal-delete-knowledge-base.component.html',
  styleUrls: ['./modal-delete-knowledge-base.component.scss']
})
export class ModalDeleteKnowledgeBaseComponent implements OnInit {
  @Input() kb: KB;
  @Output() deleteKnowledgeBase = new EventEmitter();
  @Output() closeBaseModal = new EventEmitter();

  deleteKnowledgeBaseModal = 'block';
  constructor() { }

  ngOnInit(): void {
  }

  onCloseBaseModal() {
    this.kb.deleting = false;
    this.closeBaseModal.emit();
  }

  onDeleteKnowledgeBase(kb){
    this.deleteKnowledgeBase.emit(kb);
  }
}
