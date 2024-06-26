import { Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppConfigService } from 'app/services/app-config.service';
import { TYPE_GPT_MODEL, loadTokenMultiplier } from 'app/utils/util';
@Component({
  selector: 'modal-preview-settings',
  templateUrl: './modal-preview-settings.component.html',
  styleUrls: ['./modal-preview-settings.component.scss']
})
export class ModalPreviewSettingsComponent implements OnInit, OnChanges {

  // @Output() closeBaseModal = new EventEmitter();
  // @Input() selectedNamespace: any;

  selectedNamespace: any;
  namespaceid: string; 
  model_list: Array<{ name: string, value: string }>;
  models__list = [
    { name: "GPT-3.5 Turbo (ChatGPT)", value: "gpt-3.5-turbo" }, 
    { name: "GPT-4 (ChatGPT)", value: "gpt-4" },
    { name: "GPT-4 Turbo Preview (ChatGPT)", value: "gpt-4-turbo-preview" }, 
    { name: "GPT-4o (ChatGPT)", value: "gpt-4o" }
  ];

  

  public selectedModel: any // = this.models_list[0].value;

  public max_tokens: number;
  public temperature: number; // 0.7
  public topK: number; 
  public context: string
  public context_placeholder: string

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalPreviewSettingsComponent>,
    public appConfigService: AppConfigService,
  ) { 
    // console.log("[MODAL PREVIEW SETTINGS] data ", data)
    if (data && data.selectedNaspace) {
      this.selectedNamespace = data.selectedNaspace
      // console.log("[MODAL PREVIEW SETTINGS] selectedNamespace ", this.selectedNamespace)

      this.selectedNamespace.preview_settings
      // console.log("[MODAL PREVIEW SETTINGS] selectedNamespace > selectedNamespace.preview_settings", this.selectedNamespace.preview_settings) 
      // if (namespaceAiSettings.model === "gpt-3.5-turbo") {
      //   this.selectedModel = this.models_list[0].value;
      // } else if (namespaceAiSettings.model === "gpt-4") {
      //   this.selectedModel = this.models_list[1].value;
      // } else if (namespaceAiSettings.model === "gpt-4-turbo-preview" ) {
      //   this.selectedModel = this.models_list[2].value;
      // } else if (namespaceAiSettings.model === "gpt-4o" ) {
      //   this.selectedModel = this.models_list[3].value;
      // }
      // console.log("[MODAL PREVIEW SETTINGS] selectedModel ", this.selectedModel)

      this.max_tokens =  this.selectedNamespace.preview_settings.max_tokens;
      // console.log("[MODAL PREVIEW SETTINGS] max_tokens ", this.max_tokens)

      this.temperature = this.selectedNamespace.preview_settings.temperature
      // console.log("[MODAL PREVIEW SETTINGS] temperature ", this.temperature)

      this.topK = this.selectedNamespace.preview_settings.top_k
      // console.log("[MODAL PREVIEW SETTINGS] topK ", this.topK)
      this.context = this.selectedNamespace.preview_settings.context
      // if (this.selectedNamespace.preview_settings.context !== "You are an awesome AI Assistant.")  {
      //   this.context = this.selectedNamespace.preview_settings.context
      // } else {
      //   this.context_placeholder = this.selectedNamespace.preview_settings.context
      // }
      

    }
  }

  ngOnInit(): void {
    // console.log("[MODAL PREVIEW SETTINGS] on init")
    const ai_models = loadTokenMultiplier(this.appConfigService.getConfig().aiModels)
    // console.log("[MODAL PREVIEW SETTINGS] ai_models ", ai_models)

    this.model_list = Object.values(TYPE_GPT_MODEL).filter(el=> el.status !== 'inactive').map((el)=> {
      if(ai_models[el.value])
        return { ...el, multiplier: ai_models[el.value] + ' x tokens' }
      else
        return { ...el, multiplier: null }
    })

    // console.log("[MODAL PREVIEW SETTINGS] model_list ", this.model_list )
       if (this.selectedNamespace.preview_settings.model === "gpt-3.5-turbo") {
        this.selectedModel = this.model_list[0].value;
      } else if (this.selectedNamespace.preview_settings.model === "gpt-4") {
        this.selectedModel = this.model_list[1].value;
      } else if (this.selectedNamespace.preview_settings.model === "gpt-4-turbo-preview" ) {
        this.selectedModel = this.model_list[2].value;
      } else if (this.selectedNamespace.preview_settings.model === "gpt-4o" ) {
        this.selectedModel = this.model_list[3].value;
      }
      // console.log("[MODAL PREVIEW SETTINGS] selectedModel ", this.selectedModel)

    
  }
  ngOnChanges(changes: SimpleChanges): void {
    // console.log("[MODAL PREVIEW SETTINGS] namespaceid ", this.selectedNamespace)
    this.namespaceid = this.selectedNamespace.id
  }


  onSelectModel(selectedModel) {
    // console.log("[MODAL PREVIEW SETTINGS] onSelectModel selectedModel", selectedModel)
    this.selectedNamespace.preview_settings.model = selectedModel

    // console.log("[MODAL PREVIEW SETTINGS] onSelectModel selectedNamespace", this.selectedNamespace)
  }

  updateSliderValue(value, type) {
    // console.log("[MODAL PREVIEW SETTINGS] value: ", value);
    // console.log("[MODAL PREVIEW SETTINGS] type: ", type);
    if (type === "max_tokens") {
      this.selectedNamespace.preview_settings.max_tokens = value
    }

    if (type === "temperature") {
      this.selectedNamespace.preview_settings.temperature = value
    }

    if (type === "top_k") {
      this.selectedNamespace.preview_settings.top_k = value
    }

    // console.log("[MODAL PREVIEW SETTINGS] updateSliderValue selectedNamespace", this.selectedNamespace)

  }


  onChangeTextInContex(event) {
    // console.log("[MODAL PREVIEW SETTINGS] onChangeTextInContex event: ", event);
    this.context = event
    this.selectedNamespace.preview_settings.context = this.context
    // console.log("[MODAL PREVIEW SETTINGS] onChangeTextInContex selectedNamespace", this.selectedNamespace)
  }

  onSavePreviewSettings() {
    // console.log('[MODAL PREVIEW SETTINGS] onSavePreviewSettings')
    this.dialogRef.close({action: "update", selectedNamespace: this.selectedNamespace});
  }

  closeSettingsAndOpenPreviewKBModal () {
    this.dialogRef.close({action: "update-and-open-preview", selectedNamespace: this.selectedNamespace});
    
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  // onCloseBaseModal() { 
  //   this.closeBaseModal.emit();
  // }

}
