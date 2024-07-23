import { Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppConfigService } from 'app/services/app-config.service';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
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
  selectedNamespaceClone: any;
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
  wasOpenedFromThePreviewKBModal: boolean

  private modelDefaultValue = "gpt-3.5-turbo";
  private maxTokensDefaultValue = 256;
  private temperatureDefaultValue = 0.7
  private topkDefaultValue = 4
  private contextDefaultValue = null

  public countOfOverrides = 0

  private hasAlreadyOverridedModel: boolean;
  private hasAlreadyOverridedMaxTokens: boolean;
  private hasAlreadyOverridedTemperature: boolean;
  private hasAlreadyOverridedTopk: boolean;
  private hasAlreadyOverridedContex: boolean;

  aiSettingsObject = [{
    model: null,
    maxTokens: null,
    temperature: null,
    top_k: null,
    context: null,
    
  }]

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalPreviewSettingsComponent>,
    public appConfigService: AppConfigService,
    private kbService: KnowledgeBaseService,
  ) { 
    // console.log("[MODAL PREVIEW SETTINGS] data ", data)
    if (data && data.selectedNamespace) {
      this.selectedNamespace = data.selectedNamespace
      // console.log("[MODAL PREVIEW SETTINGS] selectedNamespace ", this.selectedNamespace)
      this.selectedNamespaceClone=JSON.parse(JSON.stringify(this.selectedNamespace))

      // console.log("[MODAL PREVIEW SETTINGS] selectedNamespace ", this.selectedNamespace)


      // console.log("[MODAL PREVIEW SETTINGS] selectedNamespaceClone ", this.selectedNamespaceClone)

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
    if (data && data.calledBy && data.calledBy === 'modal-preview-kb')  {
      this.wasOpenedFromThePreviewKBModal = true;
    } else {
      this.wasOpenedFromThePreviewKBModal = false;
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
      } else if (this.selectedNamespace.preview_settings.model === "gpt-4o-mini" ) {
        this.selectedModel = this.model_list[4].value;
      }
      // console.log("[MODAL PREVIEW SETTINGS] selectedModel ", this.selectedModel)

    

      // if(this.selectedModel !== this.selectedNamespaceClone.preview_settings.model) {
      //   this.countOfOverrides =  this.countOfOverrides + 1;
      //   this.hasAlreadyOverridedModel = true;
      //   console.log("[MODAL PREVIEW SETTINGS] onInit hasAlreadyOverridedModel", this.hasAlreadyOverridedModel)
      // }

      // if(this.max_tokens !== this.selectedNamespaceClone.preview_settings.max_tokens) {
      //   this.countOfOverrides =  this.countOfOverrides + 1;
      //   this.hasAlreadyOverridedMaxTokens = true;
      //    console.log("[MODAL PREVIEW SETTINGS] onInit hasAlreadyOverridedMaxTokens", this.hasAlreadyOverridedMaxTokens)
      // }

      // // if(this.temperature !== this.temperatureDefaultValue) {
      // if(this.temperature !== this.selectedNamespace.preview_settings.temperature) {
      //   this.countOfOverrides =  this.countOfOverrides + 1;
      //   this.hasAlreadyOverridedTemperature = true;
      //   console.log("[MODAL PREVIEW SETTINGS] onInit hasAlreadyOverridedTemperature", this.hasAlreadyOverridedTemperature)
      // }

      // if(this.topK !== this.selectedNamespace.preview_settings.top_k) {
      //   this.countOfOverrides =  this.countOfOverrides + 1
      //   this.hasAlreadyOverridedTopk = true;
      //   console.log("[MODAL PREVIEW SETTINGS] onInit hasAlreadyOverridedTopk", this.hasAlreadyOverridedTopk)
      // }


      // if (this.context !== this.selectedNamespace.preview_settings.context) {
      //   this.countOfOverrides =  this.countOfOverrides + 1;
      //   this.hasAlreadyOverridedContex = true
      //   console.log("[MODAL PREVIEW SETTINGS] onInit hasAlreadyOverridedContex", this.hasAlreadyOverridedContex)
      // }

  }
  ngOnChanges(changes: SimpleChanges): void {
    // console.log("[MODAL PREVIEW SETTINGS] namespaceid ", this.selectedNamespace)
    this.namespaceid = this.selectedNamespace.id
  }


  onSelectModel(selectedModel) {
    // console.log("[MODAL PREVIEW SETTINGS] onSelectModel selectedModel", selectedModel)
    if (!this.wasOpenedFromThePreviewKBModal) {
      this.selectedNamespace.preview_settings.model = selectedModel
    }

    // Comunicate to the subscriber "modal-preview-k-b" the change of the model
    this.aiSettingsObject[0].model = selectedModel
    // console.log("[MODAL PREVIEW SETTINGS] onSelectModel aiSettingsObject", this.aiSettingsObject)
    this.kbService.hasChagedAiSettings(this.aiSettingsObject )

    if(selectedModel !== this.modelDefaultValue) {
      if (this.hasAlreadyOverridedModel !== true) { 
        this.countOfOverrides =  this.countOfOverrides + 1;
      }
      this.hasAlreadyOverridedModel = true
    } else {
      this.countOfOverrides =  this.countOfOverrides - 1;
    }
  }

  updateSliderValue(value, type) {
    //console.log("[MODAL PREVIEW SETTINGS] value: ", value);
    // console.log("[MODAL PREVIEW SETTINGS] type: ", type);
    // console.log("[MODAL PREVIEW SETTINGS] wasOpenedFromThePreviewKBModal: ", this.wasOpenedFromThePreviewKBModal);
    if (type === "max_tokens") {
      if (!this.wasOpenedFromThePreviewKBModal) {
        this.selectedNamespace.preview_settings.max_tokens = value
      }
      
      // if (value !== this.maxTokensDefaultValue) {
      if (value !== this.selectedNamespace.preview_settings.max_tokens) {
        if (this.hasAlreadyOverridedMaxTokens !== true ) {
        this.countOfOverrides =  this.countOfOverrides + 1;
        }
        this.hasAlreadyOverridedMaxTokens = true
      } else {
        this.countOfOverrides =  this.countOfOverrides - 1;
      }
      
      // Comunicate to the subscriber "modal-preview-k-b" the change of the max_tokens
      this.aiSettingsObject[0].maxTokens = value
      // console.log("[MODAL PREVIEW SETTINGS] updateSliderValue aiSettingsObject", this.aiSettingsObject)
      this.kbService.hasChagedAiSettings(this.aiSettingsObject )
    }

    if (type === "temperature") {
      if (!this.wasOpenedFromThePreviewKBModal) {
        this.selectedNamespace.preview_settings.temperature = value
      }

      // if (value !== this.temperatureDefaultValue) {
      if (value !== this.selectedNamespace.preview_settings.temperature) {
        if (this.hasAlreadyOverridedTemperature !== true) {
          this.countOfOverrides =  this.countOfOverrides + 1;
        }
        this.hasAlreadyOverridedTemperature = true
      } else {
        this.countOfOverrides =  this.countOfOverrides - 1;
      }
       
      // Comunicate to the subscriber "modal-preview-k-b" the change of the temperature
      this.aiSettingsObject[0].temperature = value
      // console.log("[MODAL PREVIEW SETTINGS] updateSliderValue aiSettingsObject", this.aiSettingsObject)
      this.kbService.hasChagedAiSettings(this.aiSettingsObject )
    }

    if (type === "top_k") {
      if (!this.wasOpenedFromThePreviewKBModal) {
        this.selectedNamespace.preview_settings.top_k = value;
      }

      // if (value !== this.topkDefaultValue) {
      if (value !== this.selectedNamespace.preview_settings.top_k) {
        if(this.hasAlreadyOverridedTopk !== true) {
          this.countOfOverrides = this.countOfOverrides + 1;
        }
        this.hasAlreadyOverridedTopk = true
      } else {
        this.countOfOverrides =  this.countOfOverrides - 1;
      }

      // Comunicate to the subscriber "modal-preview-k-b" the change of the topK
      this.aiSettingsObject[0].top_k = value
      // console.log("[MODAL PREVIEW SETTINGS] updateSliderValue aiSettingsObject", this.aiSettingsObject)
      this.kbService.hasChagedAiSettings(this.aiSettingsObject )
    }

    // console.log("[MODAL PREVIEW SETTINGS] updateSliderValue selectedNamespace", this.selectedNamespace)
  }

 


  onChangeTextInContex(event) {
    // console.log("[MODAL PREVIEW SETTINGS] onChangeTextInContex event: ", event);
    this.context = event
    if (!this.wasOpenedFromThePreviewKBModal) {
      this.selectedNamespace.preview_settings.context = this.context
    }

    // if (event !== this.contextDefaultValue) {
    if (event !==  this.selectedNamespace.preview_settings.context) {
      if (this.hasAlreadyOverridedContex !== true ) {
        this.countOfOverrides =  this.countOfOverrides + 1;
      }
      this.hasAlreadyOverridedContex = true
    } else {
      this.countOfOverrides =  this.countOfOverrides - 1;
    }
    // console.log("[MODAL PREVIEW SETTINGS] onChangeTextInContex selectedNamespace", this.selectedNamespace)
  
    // Comunicate to the subscriber "modal-preview-k-b" the change of the context
    this.aiSettingsObject[0].context = event
    // console.log("[MODAL PREVIEW SETTINGS] updateSliderValue aiSettingsObject", this.aiSettingsObject)
    this.kbService.hasChagedAiSettings(this.aiSettingsObject )
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

  reset() {

    this.countOfOverrides = 0;
    this.hasAlreadyOverridedModel = false;
    this.hasAlreadyOverridedMaxTokens = false;
    this.hasAlreadyOverridedTemperature = false;
    this.hasAlreadyOverridedTopk = false;
    this.hasAlreadyOverridedContex = false;

    this.selectedModel = this.selectedNamespaceClone.preview_settings.model;
    // this.selectedNamespace.preview_settings.model = this.modelDefaultValue

    // console.log('[MODAL PREVIEW SETTINGS] RESET TO DEFAULT selectedModel', this.selectedModel)
    this.max_tokens =  this.selectedNamespaceClone.preview_settings.max_tokens;
    // this.selectedNamespace.preview_settings.max_tokens = this.maxTokensDefaultValue;

    this.temperature = this.selectedNamespaceClone.preview_settings.temperature;
    // this.selectedNamespace.preview_settings.temperature = this.temperatureDefaultValue;

    this.topK = this.selectedNamespaceClone.preview_settings.top_k;
    // this.selectedNamespace.preview_settings.top_k = this.topkDefaultValue;

    this.context = this.selectedNamespaceClone.preview_settings.context;
    // this.selectedNamespace.preview_settings.context = this.contextDefaultValue;
    
    this.aiSettingsObject[0].model = this.modelDefaultValue;
    this.aiSettingsObject[0].maxTokens = this.maxTokensDefaultValue
    this.aiSettingsObject[0].temperature = this.temperatureDefaultValue;
    this.aiSettingsObject[0].top_k = this.topkDefaultValue;
    this.aiSettingsObject[0].context = this.contextDefaultValue;
    this.kbService.hasChagedAiSettings(this.aiSettingsObject )

  }

  resetToDefault() {


    this.selectedModel = this.model_list[0].value;
    this.selectedNamespace.preview_settings.model = this.modelDefaultValue

    // console.log('[MODAL PREVIEW SETTINGS] RESET TO DEFAULT selectedModel', this.selectedModel)
    this.max_tokens =  this.maxTokensDefaultValue;
    this.selectedNamespace.preview_settings.max_tokens = this.maxTokensDefaultValue;

    this.temperature = this.temperatureDefaultValue;
    this.selectedNamespace.preview_settings.temperature = this.temperatureDefaultValue;

    this.topK = this.topkDefaultValue;
    this.selectedNamespace.preview_settings.top_k = this.topkDefaultValue;

    this.context = this.contextDefaultValue;
    this.selectedNamespace.preview_settings.context = this.contextDefaultValue;
    
    this.aiSettingsObject[0].model = this.modelDefaultValue;
    this.aiSettingsObject[0].maxTokens = this.maxTokensDefaultValue
    this.aiSettingsObject[0].temperature = this.temperatureDefaultValue;
    this.aiSettingsObject[0].top_k = this.topkDefaultValue;
    this.aiSettingsObject[0].context = this.contextDefaultValue;
    this.kbService.hasChagedAiSettings(this.aiSettingsObject )

  }

  // onCloseBaseModal() { 
  //   this.closeBaseModal.emit();
  // }

}
