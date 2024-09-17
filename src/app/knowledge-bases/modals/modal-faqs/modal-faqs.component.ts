import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { KB } from 'app/models/kbsettings-model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'appdashboard-modal-faqs',
  templateUrl: './modal-faqs.component.html',
  styleUrls: ['./modal-faqs.component.scss']
})
export class ModalFaqsComponent implements OnInit {

  kbForm: FormGroup;
  buttonDisabled: boolean = true;
  uploadFromCSV: boolean = false;

  kb: KB = {
    _id: null,
    type: '',
    name: '',
    url: '',
    content: ''
  }

  constructor(
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalFaqsComponent>,
  ) { }

  ngOnInit(): void {
    this.kbForm = this.createConditionGroup();
  }

  createConditionGroup(): FormGroup {
    // const contentPattern = /^[^&<>]{3,}$/;
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

  onSaveKnowledgeBase() {
    console.log('[MODAL-FAQS] onSaveKnowledgeBase kb ', this.kb)
    const content = this.kb.name + "\n" + this.kb.content
    let body = {
      'name': this.kb.name,
      'source': this.kb.name,
      'content': content, // this.kb.content,
      'type': 'faqs'
    }
    this.dialogRef.close(body);

  }

  onCloseBaseModal() {
    this.dialogRef.close();
  }

  uploadFaqsFromCSV() {

  }



}
