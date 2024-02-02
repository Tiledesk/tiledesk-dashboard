import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KB, KbSettings } from 'app/models/kbsettings-model';

@Component({
  selector: 'modal-text-file',
  templateUrl: './modal-text-file.component.html',
  styleUrls: ['./modal-text-file.component.scss']
})
export class ModalTextFileComponent implements OnInit {

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
    const contentPattern = /^[^&<>]{3,}$/;
    const namePattern = /^[^&<>]{3,}$/;
    return this.formBuilder.group({
      content: ['', [Validators.required]],
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

  onSaveKnowledgeBase(){
    let body = {
      'name': this.kb.name,
      'source': this.kb.name,
      'content': this.kb.content,
      'type': 'text'
    }
    this.saveKnowledgeBase.emit(body);
  }

  onCloseBaseModal() {
    this.closeBaseModal.emit();
  }

}
