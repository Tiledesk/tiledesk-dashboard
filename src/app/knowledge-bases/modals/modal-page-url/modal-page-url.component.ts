import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KB, KbSettings } from 'app/models/kbsettings-model';

@Component({
  selector: 'modal-page-url',
  templateUrl: './modal-page-url.component.html',
  styleUrls: ['./modal-page-url.component.scss']
})
export class ModalPageUrlComponent implements OnInit {
  @Output() saveKnowledgeBase = new EventEmitter();
  @Output() closeBaseModal = new EventEmitter();

  kbForm: FormGroup;
  buttonDisabled: boolean = true;

  kb: KB = {
    _id: null,
    type: '',
    name: '',
    url: '',
    content: ''
  }

  constructor(
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.kbForm = this.createConditionGroup();
  }

  createConditionGroup(): FormGroup {
    const namePattern = /^[^&<>]{3,}$/;
    return this.formBuilder.group({
      url: ['', [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]],
      name: ['', [Validators.required, Validators.pattern(namePattern)]]
    })
  }

  onChangeInput(event): void {
    if (this.kbForm.valid) {
      this.buttonDisabled = false;
    } else {
      this.buttonDisabled = true;
    }
  }

  onCloseBaseModal() {
    this.closeBaseModal.emit();
  }

  onSaveKnowledgeBase(){
    let body = {
      'name': this.kb.name,
      'source': this.kb.url,
      'type': 'url'
    }
    this.saveKnowledgeBase.emit(body);
  }

}
