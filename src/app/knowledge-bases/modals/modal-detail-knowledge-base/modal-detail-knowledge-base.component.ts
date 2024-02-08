import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { KB } from 'app/models/kbsettings-model';

@Component({
  selector: 'modal-detail-knowledge-base',
  templateUrl: './modal-detail-knowledge-base.component.html',
  styleUrls: ['./modal-detail-knowledge-base.component.scss']
})
export class ModalDetailKnowledgeBaseComponent implements OnInit {
  @Input() kb: KB;
  @Output() deleteKnowledgeBase = new EventEmitter();
  @Output() closeBaseModal = new EventEmitter();
  constructor() { }

  ngOnInit(): void {
  }

  onCloseBaseModal() {
    this.closeBaseModal.emit();
  }

}
