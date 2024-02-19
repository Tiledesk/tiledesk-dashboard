import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KB, KbSettings } from 'app/models/kbsettings-model';

@Component({
  selector: 'modal-site-map',
  templateUrl: './modal-site-map.component.html',
  styleUrls: ['./modal-site-map.component.scss']
})
export class ModalSiteMapComponent implements OnInit {

  @Output() saveKnowledgeBase = new EventEmitter();
  @Output() closeAddKnowledgeBaseModal = new EventEmitter();

  kbForm: FormGroup;
  buttonDisabled: boolean = true;
  selectedFile: File;
  fileContent: any;

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
      name: ['', [Validators.required, Validators.pattern(namePattern)]],
      file: [null, [Validators.required, this.validateFileType(['xml'])]]
    })
  }

  onFileSelected(event): void {
    this.selectedFile = event.target.files[0];
    // console.log("onFileSelected: ", this.selectedFile, this.kbForm);
    if (this.kbForm.valid) {
      this.buttonDisabled = false;
    } else {
      this.buttonDisabled = true;
      this.readFile();
    }
  }

  private readFile(): void {
    if (!this.selectedFile) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.fileContent = reader.result as string;
    };
    reader.readAsText(this.selectedFile);
  }


  validateFileType(allowedTypes: string[]) {
    return (control) => {
      // console.log('Controllo file:', control);
      const file = control.value;
      if (file) {
        // console.log('File selezionato:', file);
        const extension = file.split('.').pop().toLowerCase();
        // console.log('Estensione del file:', extension);
        if (allowedTypes.indexOf(extension) === -1) {
          // console.log('Estensione non consentita');
          return {
            invalidFileType: true
          };
        }
      }
      return null;
    };
  }

  onChangeInput(event): void {
    if (this.kbForm.valid) {
      this.buttonDisabled = false;
    } else {
      this.buttonDisabled = true;
    }
    // console.log("onChangeInput: ", event, this.kbForm);
  }

  onCloseAddKnowledgeBaseModal() {
    this.closeAddKnowledgeBaseModal.emit();
  }

  onSaveKnowledgeBase(){
    let body = {
      'name': this.kb.name,
      'source': this.fileContent,
      'content': '',
      'type': 'map'
    }
    this.saveKnowledgeBase.emit(body);
  }


}
