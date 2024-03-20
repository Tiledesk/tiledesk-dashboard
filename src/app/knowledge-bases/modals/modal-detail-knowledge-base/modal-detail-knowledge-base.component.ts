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

  name: string;
  source: string;
  content: string;

  constructor() { }

  ngOnInit(): void {
    this.name = this.kb.name;
    this.source = this.kb.source;
    this.content = this.kb.content;
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
    this.kb.name = this.name;
    this.kb.source = this.source;
    this.kb.content = this.content;
    //console.log('onUpdateKnowledgeBase: ', this.kb);
    this.updateKnowledgeBase.emit(this.kb);
  }

}
