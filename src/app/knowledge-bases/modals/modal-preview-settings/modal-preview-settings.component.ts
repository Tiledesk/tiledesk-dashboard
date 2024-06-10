import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'modal-preview-settings',
  templateUrl: './modal-preview-settings.component.html',
  styleUrls: ['./modal-preview-settings.component.scss']
})
export class ModalPreviewSettingsComponent implements OnInit, OnChanges {

  @Output() closeBaseModal = new EventEmitter();
  @Input() selectedNamespace: any;

  namespaceid: string; 

  models_list = [
    { name: "GPT-3.5 Turbo (ChatGPT)", value: "gpt-3.5-turbo" }, 
    { name: "GPT-4 (ChatGPT)", value: "gpt-4" },
    { name: "GPT-4 Turbo Preview (ChatGPT)", value: "gpt-4-turbo-preview" }, 
    { name: "GPT-4o (ChatGPT)", value: "gpt-4o" }
  ];
  selectedModel: any = this.models_list[0].value;

  max_tokens = 128;
  temperature = 0.7

  constructor() { }

  ngOnInit(): void {
    console.log("[MODAL PREVIEW SETTINGS] on init")
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log("[MODAL PREVIEW SETTINGS] namespaceid ", this.selectedNamespace)
    this.namespaceid = this.selectedNamespace.id
  }

  updateSliderValue(value, type) {
    console.log("value: ", value);
    console.log("type: ", type);
  }

  onSavePreviewSettings() {
    console.log("Save settins --> ")
  }

  onCloseBaseModal() { 
    this.closeBaseModal.emit();
  }

}
