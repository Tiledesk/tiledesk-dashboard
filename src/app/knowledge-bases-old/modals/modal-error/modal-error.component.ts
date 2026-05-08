import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'modal-error-knowledge-base',
  templateUrl: './modal-error.component.html',
  styleUrls: ['./modal-error.component.scss']
})
export class ModalErrorComponent implements OnInit {

  @Input() errorMessage: string;
  @Output() closeBaseModal = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  onCloseBaseModal() {
    this.closeBaseModal.emit();
  }
}
