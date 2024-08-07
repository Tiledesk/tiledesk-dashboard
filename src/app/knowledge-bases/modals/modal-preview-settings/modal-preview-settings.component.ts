import { Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppConfigService } from 'app/services/app-config.service';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { TYPE_GPT_MODEL, URL_AI_model_doc, URL_chunk_Limit_doc, URL_max_tokens_doc, URL_system_context_doc, URL_temperature_doc, loadTokenMultiplier } from 'app/utils/util';
import { SatPopover } from '@ncstate/sat-popover';
@Component({
  selector: 'modal-preview-settings',
  templateUrl: './modal-preview-settings.component.html',
  styleUrls: ['./modal-preview-settings.component.scss']
})

export class ModalPreviewSettingsComponent implements OnInit, OnChanges {
  @ViewChild('aiModel') aiModel: SatPopover;
  @ViewChild('maxTokens') maxTokens: SatPopover;
  @ViewChild('aiModeltemperature')  aiModeltemperature: SatPopover;
  @ViewChild('chunkLimit')  chunkLimit: SatPopover;
  @ViewChild('systemContext')  systemContext: SatPopover;
  

 

  // @Output() closeBaseModal = new EventEmitter();
  // @Input() hasCickedAiSettingsModalBackdrop: boolean;

  selectedNamespace: any;
  selectedNamespaceClone: any;
  namespaceid: string;
  model_list: Array<{ name: string, value: string }>;
  models__list = [
    { name: "GPT-3.5 Turbo (ChatGPT)", value: "gpt-3.5-turbo" },
    { name: "GPT-4 (ChatGPT)", value: "gpt-4" },
    { name: "GPT-4 Turbo Preview (ChatGPT)", value: "gpt-4-turbo-preview" },
    { name: "GPT-4o (ChatGPT)", value: "gpt-4o" },
    { name: "GPT-4o-mini (ChatGPT)", value: "gpt-4o-mini" }
  ];



  public selectedModel: any // = this.models_list[0].value;
  public max_tokens: number;
  public temperature: number; // 0.7
  public topK: number;
  public context: string
  public context_placeholder: string
  wasOpenedFromThePreviewKBModal: boolean

  private modelDefaultValue = "gpt-4o";
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
      this.selectedNamespaceClone = JSON.parse(JSON.stringify(this.selectedNamespace))

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

      this.max_tokens = this.selectedNamespace.preview_settings.max_tokens;
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
    if (data && data.calledBy && data.calledBy === 'modal-preview-kb') {
      this.wasOpenedFromThePreviewKBModal = true;
    } else {
      this.wasOpenedFromThePreviewKBModal = false;
    }
  }

  ngOnInit(): void {

    const ai_models = loadTokenMultiplier(this.appConfigService.getConfig().aiModels)
    // console.log("[MODAL PREVIEW SETTINGS] ai_models ", ai_models)

    this.model_list = Object.values(TYPE_GPT_MODEL).filter(el => el.status !== 'inactive').map((el) => {
      if (ai_models[el.value])
        return { ...el, multiplier: ai_models[el.value] + ' x tokens' }
      else
        return { ...el, multiplier: null }
    })

    // console.log("[MODAL PREVIEW SETTINGS] model_list ", this.model_list )
    if (this.selectedNamespace.preview_settings.model === "gpt-3.5-turbo") {
      this.selectedModel = this.model_list[0].value;
    } else if (this.selectedNamespace.preview_settings.model === "gpt-4") {
      this.selectedModel = this.model_list[1].value;
    } else if (this.selectedNamespace.preview_settings.model === "gpt-4-turbo-preview") {
      this.selectedModel = this.model_list[2].value;
    } else if (this.selectedNamespace.preview_settings.model === "gpt-4o") {
      this.selectedModel = this.model_list[3].value;
    } else if (this.selectedNamespace.preview_settings.model === "gpt-4o-mini") {
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
    this.listenToOnClickedBackdrop()
  }





  ngOnChanges(changes: SimpleChanges): void {

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
    this.kbService.hasChagedAiSettings(this.aiSettingsObject)

    if (selectedModel !== this.modelDefaultValue) {
      if (this.hasAlreadyOverridedModel !== true) {
        this.countOfOverrides = this.countOfOverrides + 1;
      }
      this.hasAlreadyOverridedModel = true
    } else {
      this.countOfOverrides = this.countOfOverrides - 1;
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
        if (this.hasAlreadyOverridedMaxTokens !== true) {
          this.countOfOverrides = this.countOfOverrides + 1;
        }
        this.hasAlreadyOverridedMaxTokens = true
      } else {
        this.countOfOverrides = this.countOfOverrides - 1;
      }

      // Comunicate to the subscriber "modal-preview-k-b" the change of the max_tokens
      this.aiSettingsObject[0].maxTokens = value
      // console.log("[MODAL PREVIEW SETTINGS] updateSliderValue aiSettingsObject", this.aiSettingsObject)
      this.kbService.hasChagedAiSettings(this.aiSettingsObject)
    }

    if (type === "temperature") {
      if (!this.wasOpenedFromThePreviewKBModal) {
        this.selectedNamespace.preview_settings.temperature = value
      }

      // if (value !== this.temperatureDefaultValue) {
      if (value !== this.selectedNamespace.preview_settings.temperature) {
        if (this.hasAlreadyOverridedTemperature !== true) {
          this.countOfOverrides = this.countOfOverrides + 1;
        }
        this.hasAlreadyOverridedTemperature = true
      } else {
        this.countOfOverrides = this.countOfOverrides - 1;
      }

      // Comunicate to the subscriber "modal-preview-k-b" the change of the temperature
      this.aiSettingsObject[0].temperature = value
      // console.log("[MODAL PREVIEW SETTINGS] updateSliderValue aiSettingsObject", this.aiSettingsObject)
      this.kbService.hasChagedAiSettings(this.aiSettingsObject)
    }

    if (type === "top_k") {
      if (!this.wasOpenedFromThePreviewKBModal) {
        this.selectedNamespace.preview_settings.top_k = value;
      }

      // if (value !== this.topkDefaultValue) {
      if (value !== this.selectedNamespace.preview_settings.top_k) {
        if (this.hasAlreadyOverridedTopk !== true) {
          this.countOfOverrides = this.countOfOverrides + 1;
        }
        this.hasAlreadyOverridedTopk = true
      } else {
        this.countOfOverrides = this.countOfOverrides - 1;
      }

      // Comunicate to the subscriber "modal-preview-k-b" the change of the topK
      this.aiSettingsObject[0].top_k = value
      // console.log("[MODAL PREVIEW SETTINGS] updateSliderValue aiSettingsObject", this.aiSettingsObject)
      this.kbService.hasChagedAiSettings(this.aiSettingsObject)
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
    if (event !== this.selectedNamespace.preview_settings.context) {
      if (this.hasAlreadyOverridedContex !== true) {
        this.countOfOverrides = this.countOfOverrides + 1;
      }
      this.hasAlreadyOverridedContex = true
    } else {
      this.countOfOverrides = this.countOfOverrides - 1;
    }
    // console.log("[MODAL PREVIEW SETTINGS] onChangeTextInContex selectedNamespace", this.selectedNamespace)

    // Comunicate to the subscriber "modal-preview-k-b" the change of the context
    this.aiSettingsObject[0].context = event
    // console.log("[MODAL PREVIEW SETTINGS] updateSliderValue aiSettingsObject", this.aiSettingsObject)
    this.kbService.hasChagedAiSettings(this.aiSettingsObject)
  }

  onSavePreviewSettings() {
    // console.log('[MODAL PREVIEW SETTINGS] onSavePreviewSettings')
    this.dialogRef.close({ action: "update", selectedNamespace: this.selectedNamespace });
  }

  closeSettingsAndOpenPreviewKBModal() {
    this.dialogRef.close({ action: "update-and-open-preview", selectedNamespace: this.selectedNamespace });

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
    this.max_tokens = this.selectedNamespaceClone.preview_settings.max_tokens;
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
    this.kbService.hasChagedAiSettings(this.aiSettingsObject)

  }

  resetToDefault() {


    this.selectedModel = this.model_list[3].value;
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
    this.kbService.hasChagedAiSettings(this.aiSettingsObject)

  }

  // onCloseBaseModal() { 
  //   this.closeBaseModal.emit();
  // }



  listenToOnClickedBackdrop() {
    document.addEventListener(
      "on-backdrop-clicked", (e: CustomEvent) => {
        console.log("[MODAL PREVIEW SETTINGS] on-backdrop-clicked e:", e);

        console.log("[MODAL PREVIEW SETTINGS] on-backdrop-clicked e.detail:", e.detail);
        if (e.detail && e.detail === true) {
          this.aiModel.close()
          this.maxTokens.close()
          this.aiModeltemperature.close()
          this.chunkLimit.close()
          this.systemContext.close()
        }
      }
    );
  }

  handleClickInside(event: MouseEvent): void {
    // this.clickedInside = true;
    // this.clickedOutside = false;
    console.log('Clicked inside the div');
    this.aiModel.close()
    this.maxTokens.close()
    this.aiModeltemperature.close()
    this.chunkLimit.close()
    this.systemContext.close()
  }

  // onMouseEnter(event: MouseEvent): void {
  //   console.log('Mouse entered  event ', event);
  //   const hoveredElement = event.target as HTMLElement;
  //   console.log('Mouse entered:', hoveredElement.tagName);
  // }

  // onMouseMove(event: MouseEvent): void {
  //   // if (this.isMouseInside) {
  //     // You can perform actions continuously while the mouse is inside
  //     console.log(`Mouse is moving inside event: `, event.target['id']);
  //     console.log(`Mouse is moving inside the div at (${event.clientX}, ${event.clientY})`);
  //     if (event.target['id'] !== "ai-settings-label")  {
  //       // this.aiModel.close()
  //       // this.maxTokens.close()
  //       // this.aiModeltemperature.close()
  //       // this.chunkLimit.close()
  //       // this.systemContext.close()
  //     }
    
  // }


  aiModelPopoverIsOpened() {
    console.log('[MODAL PREVIEW SETTINGS] aiModelPopoverIsOpened')
    console.log("[MODAL PREVIEW SETTINGS] aiModel sat popover", this.aiModel)
  }

  maxTokenPopoverIsOpened() {
    console.log('[MODAL PREVIEW SETTINGS] maxTokenPopoverIsOpened')
    console.log("[MODAL PREVIEW SETTINGS] maxTokens sat popover", this.maxTokens)
  }

  temperaturePopoverIsOpened() {
    console.log('[MODAL PREVIEW SETTINGS] temperaturePopoverIsOpened')
    console.log("[MODAL PREVIEW SETTINGS] aiModeltemperature sat popover", this.aiModeltemperature)
  }

  chunkLimitPopoverIsOpened() {
    console.log('[MODAL PREVIEW SETTINGS] chunkLimitPopoverIsOpened')
    console.log("[MODAL PREVIEW SETTINGS] chunkLimit sat popover", this.chunkLimit
    )
  }

  systemContextPopoverIsOpened() {
    console.log('[MODAL PREVIEW SETTINGS] systemContextPopoverIsOpened')
    console.log("[MODAL PREVIEW SETTINGS] systemContext sat popover", this.systemContext)
  }

  goToAIModelDoc() {
    const url = URL_AI_model_doc;
    window.open(url, '_blank');
  }

  goToMaxTokenDoc() {
    const url = URL_max_tokens_doc;
    window.open(url, '_blank');
  }

  goToTemperatureDoc() {
    const url = URL_temperature_doc;
    window.open(url, '_blank');
  }

  goToChunkLimitDoc() {
    const url = URL_chunk_Limit_doc;
    window.open(url, '_blank');
  }

  goToSystemContextDoc() {
    const url = URL_system_context_doc;
    window.open(url, '_blank');
  }
}
