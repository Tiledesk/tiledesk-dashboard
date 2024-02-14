import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { KB } from 'app/models/kbsettings-model';

@Component({
  selector: 'modal-detail-knowledge-base',
  templateUrl: './modal-detail-knowledge-base.component.html',
  styleUrls: ['./modal-detail-knowledge-base.component.scss']
})
export class ModalDetailKnowledgeBaseComponent implements OnInit {
  @Input() kb: KB;
  @Output() closeBaseModal = new EventEmitter();
  @Output() updateKnowledgeBase = new EventEmitter();
  constructor() { }

  ngOnInit(): void {
  }


  onChangeInput(event): void {
    // if (this.kbForm.valid) {
    //   this.buttonDisabled = false;
    // } else {
    //   this.buttonDisabled = true;
    // }
  }

  onCloseBaseModal() {
    this.closeBaseModal.emit();
  }

  onUpdateKnowledgeBase(){
    // console.log('onUpdateKnowledgeBase: ', this.kb);
    this.updateKnowledgeBase.emit(this.kb);
  }


}
