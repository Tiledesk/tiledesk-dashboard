import { Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppConfigService } from 'app/services/app-config.service';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { LLM_MODEL, URL_AI_model_doc, URL_advanced_context_doc, URL_chunk_Limit_doc, URL_contents_sources_doc, URL_max_tokens_doc, URL_reranking_doc, URL_system_context_doc, URL_temperature_doc, loadTokenMultiplier } from 'app/utils/util'; // TYPE_GPT_MODEL,
import { SatPopover } from '@ncstate/sat-popover';
import { BrandService } from 'app/services/brand.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { NavigationEnd, Router } from '@angular/router';
import { IntegrationService } from 'app/services/integration.service';
@Component({
  selector: 'modal-preview-settings',
  templateUrl: './modal-preview-settings.component.html',
  styleUrls: ['./modal-preview-settings.component.scss']
})

export class ModalPreviewSettingsComponent implements OnInit, OnChanges {
  @ViewChild('aiModel') aiModel: SatPopover;
  @ViewChild('maxTokens') maxTokens: SatPopover;
  @ViewChild('aiModeltemperature') aiModeltemperature: SatPopover;
  @ViewChild('aiSearchType') aiSearchType: SatPopover;
  @ViewChild('chunkLimit') chunkLimit: SatPopover;
  @ViewChild('systemContext') systemContext: SatPopover;
  @ViewChild('advancedContext') advancedContext: SatPopover;
  @ViewChild('contentsSources') contentsSources: SatPopover;



  // @Output() closeBaseModal = new EventEmitter();
  // @Input() hasCickedAiSettingsModalBackdrop: boolean;
  diplaySearchTypeSlider: boolean
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
  public max_tokens_min: number;
  public max_tokens_max: number;
  public temperature: number; // 0.7
  public alpha: number; // 0.7
  public topK: number;
  public context: string
  public context_placeholder: string
  public chunkOnly: boolean
  public reRanking: boolean
  public reRankingMultipler: number
  public advancedPrompt: boolean // = false;
  public citations: boolean // = false;
  wasOpenedFromThePreviewKBModal: boolean

  private modelDefaultValue = "gpt-4o";
  private maxTokensDefaultValue = 256;
  private temperatureDefaultValue = 0.7
  private alphaDefaultValue = 0.5

  private topkDefaultValue = 4
  private contextDefaultValue = null
  private advancedPromptDefaultValue = false
  private citationsDefaultValue = false
  private chunksOnlyDefaultValue = false
  private reRankigDefaultValue = false
  private reRankigMultiplerDefaultValue = 2

  public countOfOverrides = 0

  private hasAlreadyOverridedModel: boolean;
  private hasAlreadyOverridedMaxTokens: boolean;
  private hasAlreadyOverridedTemperature: boolean;
  private hasAlreadyOverridedAlpha: boolean;
  private hasAlreadyOverridedTopk: boolean;
  private hasAlreadyOverridedContex: boolean;
  private hasAlreadyOverrideAdvancedContex: boolean;
  private hasAlreadyOverrideChunckOnly: boolean;
  private hasAlreadyOverrideReRanking: boolean;
  private hasAlreadyOverrideReRankingMultipler: boolean;
  private hasAlreadyOverrideCitations: boolean;

  public hideHelpLink: boolean;

  temperature_slider_disabled: boolean;
  modelGroups: any[] = [];
  flattenedModels: any[] = [];

  aiSettingsObject = [{
    model: null,
    maxTokens: null,
    temperature: null,
    alpha: null,
    top_k: null,
    context: null,
    chunkOnly: null,
    reRanking: null,
    reRankingMultipler: null,
    advancedPrompt: null,
    citations: null,
  }]

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalPreviewSettingsComponent>,
    public appConfigService: AppConfigService,
    private kbService: KnowledgeBaseService,
    public brandService: BrandService,
    private logger: LoggerService,
    private router: Router,
    private integrationService: IntegrationService
  ) {
    // this.logger.log("[MODAL PREVIEW SETTINGS] data ", data)
    const brand = brandService.getBrand();
    this.hideHelpLink = brand['DOCS'];
    if (data && data.selectedNamespace) {
      this.selectedNamespace = data.selectedNamespace
      this.logger.log("[MODAL PREVIEW SETTINGS] selectedNamespace ", this.selectedNamespace)
      this.selectedNamespaceClone = JSON.parse(JSON.stringify(this.selectedNamespace))

      if (this.selectedNamespace && this.selectedNamespace.engine) {
        if (this.selectedNamespace.hybrid === true) {
          this.diplaySearchTypeSlider = true;
        } else {
          this.diplaySearchTypeSlider = false;
        }
      } else {
        this.diplaySearchTypeSlider = false;
      }

      this.logger.log("[MODAL PREVIEW SETTINGS] selectedNamespace ", this.selectedNamespace)

      // this.logger.log("[MODAL PREVIEW SETTINGS] selectedNamespaceClone ", this.selectedNamespaceClone)

      this.selectedNamespace.preview_settings
      this.logger.log("[MODAL PREVIEW SETTINGS] selectedNamespace preview_settings 1", this.selectedNamespace.preview_settings)
      this.logger.log("[MODAL PREVIEW SETTINGS] onSelectModel aiSettingsObject 1", this.aiSettingsObject)

      // new
      // this.selectedNamespace.preview_settings.advancedPrompt = this.advancedPrompt
      // this.selectedNamespace.preview_settings.citations = this.citations
      // this.logger.log("[MODAL PREVIEW SETTINGS] selectedNamespace preview_settings 2", this.selectedNamespace.preview_settings)


      this.max_tokens = this.selectedNamespace.preview_settings.max_tokens;
      this.logger.log("[MODAL PREVIEW SETTINGS] max_tokens ", this.max_tokens)

      if (this.selectedNamespace.preview_settings.model.startsWith('gpt-5')) {

        // this.temperature = 1
        // this.aiSettingsObject[0].temperature = 1
        // this.kbService.hasChagedAiSettings(this.aiSettingsObject)
        this.temperature_slider_disabled = true;
        // this.max_tokens_max = 100000
        this.logger.log("[MODAL PREVIEW SETTINGS] selectedNamespace is gpt-5 family", this.selectedNamespace.preview_settings.model)
      } else {
        // this.temperature = this.selectedNamespace.preview_settings.temperature
        this.temperature_slider_disabled = false;
        // this.max_tokens_max = 9999
        // if (this.max_tokens > 9999 ) {
        //   this.max_tokens = this.maxTokensDefaultValue;
        // }
      }


      if (this.selectedNamespace.preview_settings.model.startsWith('gpt-5'))  {
        this.temperature_slider_disabled = true;
        console.log("[MODAL PREVIEW SETTINGS] selectedNamespace is gpt-5 family", this.selectedNamespace.preview_settings.model)
      } else { 
        // this.temperature = this.selectedNamespace.preview_settings.temperature
        this.temperature_slider_disabled = false;
      }

      this.temperature = this.selectedNamespace.preview_settings.temperature
      // this.logger.log("[MODAL PREVIEW SETTINGS] temperature ", this.temperature)

      this.topK = this.selectedNamespace.preview_settings.top_k
      // this.logger.log("[MODAL PREVIEW SETTINGS] topK ", this.topK)

      // Hibrid search
      if (this.selectedNamespace.preview_settings.alpha) {
        this.alpha = this.selectedNamespace.preview_settings.alpha
      } else {
        this.alpha = 0.5
      }


      this.context = this.selectedNamespace.preview_settings.context

       if (!this.selectedNamespace.preview_settings.chunks_only) {
        this.chunkOnly = false
        this.selectedNamespace.preview_settings.chunks_only = this.chunkOnly
      } else {
        this.chunkOnly = this.selectedNamespace.preview_settings.chunks_only
        this.logger.log("[MODAL PREVIEW SETTINGS] chunkOnly ", this.chunkOnly)
      }

      if (!this.selectedNamespace.preview_settings.reranking) {
        this.reRanking = false
        this.selectedNamespace.preview_settings.reranking = this.reRanking
      } else {
        this.reRanking = this.selectedNamespace.preview_settings.reranking
        this.logger.log("[MODAL PREVIEW SETTINGS] reRanking ", this.reRanking)
      }

      if (this.selectedNamespace.preview_settings.reranking_multiplier) {
        this.reRankingMultipler = this.selectedNamespace.preview_settings.reranking_multiplier
      } else {
        this.reRankingMultipler = 2
      }

      this.logger.log("[MODAL PREVIEW SETTINGS] this.selectedNamespace.preview_settings.advancedPrompt ", this.selectedNamespace.preview_settings.advancedPrompt)
      if (!this.selectedNamespace.preview_settings.advancedPrompt) {
        this.advancedPrompt = false
        this.selectedNamespace.preview_settings.advancedPrompt = this.advancedPrompt
      } else {
        this.advancedPrompt = this.selectedNamespace.preview_settings.advancedPrompt
        this.logger.log("[MODAL PREVIEW SETTINGS] advancedPrompt ", this.advancedPrompt)
      }



      this.logger.log("[MODAL PREVIEW SETTINGS] this.selectedNamespace.preview_settings.advancedPrompt ", this.selectedNamespace.preview_settings.citations)
      if (!this.selectedNamespace.preview_settings.citations) {
        this.citations = false
        this.selectedNamespace.preview_settings.citations = this.citations
        this.max_tokens_min = 10
        this.logger.log("[MODAL PREVIEW SETTINGS] max_tokens_min ", this.max_tokens_min)
      } else {
        this.citations = this.selectedNamespace.preview_settings.citations;
        this.max_tokens_min = 1024;
        // this.max_tokens = 1024;
        // this.selectedNamespace.preview_settings.max_tokens = this.max_tokens
        this.logger.log("[MODAL PREVIEW SETTINGS] citations ", this.citations)
        this.logger.log("[MODAL PREVIEW SETTINGS] max_tokens_min ", this.max_tokens_min)
      }



      this.logger.log("[MODAL PREVIEW SETTINGS] selectedNamespace preview_settings 2", this.selectedNamespace.preview_settings)
      // if (this.selectedNamespace.preview_settings.context !== "You are an awesome AI Assistant.")  {
      //   this.context = this.selectedNamespace.preview_settings.context
      // } else {
      //   this.context_placeholder = this.selectedNamespace.preview_settings.context
      // }
    }
    if (data && data.calledBy && data.calledBy === 'modal-preview-kb') {
      this.wasOpenedFromThePreviewKBModal = true;
      this.logger.log('[MODAL PREVIEW SETTINGS] wasOpenedFromThePreviewKBModal ', this.wasOpenedFromThePreviewKBModal)

    } else {
      this.wasOpenedFromThePreviewKBModal = false;
      this.logger.log('[MODAL PREVIEW SETTINGS] wasOpenedFromThePreviewKBModal ', this.wasOpenedFromThePreviewKBModal)
    }

    this.listenToCurrentURL()
  }

  listenToCurrentURL() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.logger.log('[MODAL PREVIEW SETTINGS] - NavigationEnd event url ', event.url)
        const currentUrl: string = event.url;

        if (currentUrl.includes('/knowledge-bases')) {
          this.logger.log("✅ User is on the 'knowledge-bases' route.");
        } else {
          this.logger.log("❌ User is NOT on the 'knowledge-bases' route.");
          this.dialogRef.close();
          // if (this.dialogRefAiSettings) {
          //   this.dialogRefAiSettings.close()
          // }
        }
      }
    })
  }

  ngOnInit(): void {

    // const ai_models = loadTokenMultiplier(this.appConfigService.getConfig().aiModels)
    // this.logger.log("[MODAL PREVIEW SETTINGS] ai_models ", ai_models)

    // this.model_list = TYPE_GPT_MODEL.filter(el => Object.keys(ai_models).includes(el.value)).map((el) => {
    //   if (ai_models[el.value])
    //     return { ...el, multiplier: ai_models[el.value] + ' x tokens' }
    //   else
    //     return { ...el, multiplier: null }
    // })

    // this.selectedModel = this.model_list.find(el => el.value === this.selectedNamespace.preview_settings.model).value
    // this.logger.log("[MODAL PREVIEW SETTINGS] selectedModel ", this.selectedModel)

    // this.listenToAiSettingsChanges()
    this.listenToOnClickedBackdrop()
    this.listenToHasClickedInsideModalPreviewKb()
    this.loadModelGroups();
  }

 
  // listenToAiSettingsChanges() {
  //   this.logger.log('[MODAL PREVIEW SETTINGS] wasOpenedFromThePreviewKBModal 2', this.wasOpenedFromThePreviewKBModal)
  //   this.kbService.editedAiSettings$.subscribe((editedAiSettings: any) => {
  //     this.logger.log('[MODAL PREVIEW SETTINGS] editedAiSettings ', editedAiSettings)
  //     if (editedAiSettings) {
  //       if (editedAiSettings.model) {
  //         this.selectedModel = editedAiSettings.model
  //       }
  //     }
  //   })
  // }

   loadModelGroups() {
    const ai_models = loadTokenMultiplier(this.appConfigService.getConfig().aiModels)
    this.logger.log('LLM_MODEL', LLM_MODEL)
    const orderedProviders = [
      ...LLM_MODEL.filter(p => p.value === 'openai'),
      ...LLM_MODEL.filter(p => p.value !== 'openai')
    ];

    // crea l’array dei gruppi di modelli per la select
    this.modelGroups = orderedProviders.map(provider => ({
      providerName: provider.name,
      models: (provider.models || [])  // fallback se models è undefined
        .filter(m => m.status === 'active')  // solo modelli attivi
        .sort((a, b) => a.name.localeCompare(b.name))  // ordine alfabetico
        .map(model => ({
          ...model,
          multiplier: ai_models[model.value] ? `${ai_models[model.value]}x tokens` : null
        }))
    }));

    this.logger.log('[MODAL PREVIEW SETTINGS]  modelGroups', this.modelGroups)

    this.flattenedModels = this.modelGroups.flatMap(group => {
      // trova il provider corrispondente in LLM_MODEL
      const provider = LLM_MODEL.find(p => p.name.toLowerCase() === group.providerName.toLowerCase());

      return group.models.map(model => ({
        ...model,
        providerName: group.providerName,
        llmValue: provider ? provider.value : null, // <- aggiungo il valore dell'LLM
        llmSrc: provider ? provider.src : null // <- se vuoi anche l’icona
      }));
    });

    this.logger.log('[MODAL PREVIEW SETTINGS] flattenedModels ', this.flattenedModels)
    // eventualmente seleziona il modello corrente
    const selectedProvider = this.modelGroups.find(g =>
      g.models.some(m => m.value === this.selectedNamespace.preview_settings.model)
    );
    if (selectedProvider) {
      const selectedModelObj = selectedProvider.models.find(m =>
        m.value === this.selectedNamespace.preview_settings.model
      );
      this.selectedModel = selectedModelObj?.value;
    }

    this.logger.log('[MODAL PREVIEW SETTINGS] selectedModel ', this.selectedModel)
    this.logger.log('[MODAL PREVIEW SETTINGS] flattenedModels ', this.flattenedModels)
    this.logger.log('[MODAL PREVIEW SETTINGS] modelDefaultValue ', this.modelDefaultValue)



    this.selectedModel = this.flattenedModels.find(el => el.value === this.selectedNamespace.preview_settings.model).value
    this.logger.log("[MODAL PREVIEW SETTINGS] selectedModel on init", this.selectedModel)

    const selectedLlmProvider = this.getLlmProviderByModel(this.selectedNamespace.preview_settings.model);
    this.logger.log("[MODAL PREVIEW SETTINGS] selectedLlmProvider on init", selectedLlmProvider)
    this.selectedNamespace.preview_settings.llm = selectedLlmProvider;
  }

  getLlmProviderByModel(modelValue: string): string | null {
    const found = this.flattenedModels.find(el => el.value === modelValue);
    return found ? found.llmValue : null;
  }



  ngOnChanges(changes: SimpleChanges): void {

    this.namespaceid = this.selectedNamespace.id
  }


  onSelectModel(selectedModel) {
    this.logger.log("[MODAL PREVIEW SETTINGS] onSelectModel selectedModel", selectedModel)

    const selected = this.flattenedModels.find(m => m.value === selectedModel);
    if (selected) {
      this.logger.log('Modello selezionato:', selected.name);
      this.logger.log('LLM Provider:', selected.llmValue);
      this.logger.log('Icona provider:', selected.llmSrc);
      this.selectedNamespace.preview_settings.llm = selected.llmValue
    }

    if (selectedModel.startsWith('gpt-5')) {

      this.temperature = 1;
      this.aiSettingsObject[0].temperature = 1;
      this.selectedNamespace.preview_settings.temperature = 1;
      this.kbService.hasChagedAiSettings(this.aiSettingsObject);
      this.temperature_slider_disabled = true;
      // this.max_tokens_max = 100000
      this.logger.log("[MODAL PREVIEW SETTINGS] onSelectModel selectedModel 2", selectedModel)
    } else {

      this.aiSettingsObject[0].temperature = this.temperatureDefaultValue;
      this.selectedNamespace.preview_settings.temperature = this.temperatureDefaultValue;
      this.kbService.hasChagedAiSettings(this.aiSettingsObject);
      this.temperature = this.temperatureDefaultValue;
      this.temperature_slider_disabled = false;
      // this.max_tokens_max = 9999
      //  if (this.max_tokens > 9999 ) {
      //   this.max_tokens = this.maxTokensDefaultValue;
      // }
    }

    if (!this.wasOpenedFromThePreviewKBModal) {
      this.selectedNamespace.preview_settings.model = selectedModel
    }

    // Comunicate to the subscriber "modal-preview-k-b" the change of the model
    this.aiSettingsObject[0].model = selectedModel
    this.logger.log("[MODAL PREVIEW SETTINGS] onSelectModel aiSettingsObject", this.aiSettingsObject)
    this.kbService.hasChagedAiSettings(this.aiSettingsObject)

    if (selectedModel !== this.selectedNamespace.preview_settings.model) {
      if (this.hasAlreadyOverridedModel !== true) {
        this.countOfOverrides = this.countOfOverrides + 1;
      }
      this.hasAlreadyOverridedModel = true
    } else {
      this.countOfOverrides = this.countOfOverrides - 1;
    }
  }

  updateSliderValue(value, type) {
    // this.logger.log("[MODAL PREVIEW SETTINGS] wasOpenedFromThePreviewKBModal: ", this.wasOpenedFromThePreviewKBModal);
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
      // this.logger.log("[MODAL PREVIEW SETTINGS] updateSliderValue aiSettingsObject", this.aiSettingsObject)
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
      // this.logger.log("[MODAL PREVIEW SETTINGS] updateSliderValue aiSettingsObject", this.aiSettingsObject)
      this.kbService.hasChagedAiSettings(this.aiSettingsObject)
    }


    if (type === "alpha") {
      if (!this.wasOpenedFromThePreviewKBModal) {
        this.selectedNamespace.preview_settings.alpha = value
      }


      if (value !== this.selectedNamespace.preview_settings.alpha) {
        if (this.hasAlreadyOverridedAlpha !== true) {
          this.countOfOverrides = this.countOfOverrides + 1;
        }
        this.hasAlreadyOverridedAlpha = true
      } else {
        this.countOfOverrides = this.countOfOverrides - 1;
      }

      // Comunicate to the subscriber "modal-preview-k-b" the change of the alpha
      this.aiSettingsObject[0].alpha = value
      this.logger.log("[MODAL PREVIEW SETTINGS] updateSliderValue aiSettingsObject", this.aiSettingsObject)
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
      // this.logger.log("[MODAL PREVIEW SETTINGS] updateSliderValue aiSettingsObject", this.aiSettingsObject)
      this.kbService.hasChagedAiSettings(this.aiSettingsObject)
    }

    if (type === "re_ranking_multipler") {
      if (!this.wasOpenedFromThePreviewKBModal) {
        this.selectedNamespace.preview_settings.reranking_multiplier = value;
      }

      if (value !== this.selectedNamespace.preview_settings.reranking_multiplier) {
        if (this.hasAlreadyOverrideReRankingMultipler !== true) {
          this.countOfOverrides = this.countOfOverrides + 1;
        }
        this.hasAlreadyOverrideReRankingMultipler = true
      } else {
        this.countOfOverrides = this.countOfOverrides - 1;
      }

    // Comunicate to the subscriber "modal-preview-k-b" the change of the topK
    this.aiSettingsObject[0].reRankingMultipler = value
    // this.logger.log("[MODAL PREVIEW SETTINGS] updateSliderValue aiSettingsObject", this.aiSettingsObject)
    this.kbService.hasChagedAiSettings(this.aiSettingsObject)
  }

    // this.logger.log("[MODAL PREVIEW SETTINGS] updateSliderValue selectedNamespace", this.selectedNamespace)
  }




  onChangeTextInContex(event) {
    // this.logger.log("[MODAL PREVIEW SETTINGS] onChangeTextInContex event: ", event);
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
    // this.logger.log("[MODAL PREVIEW SETTINGS] onChangeTextInContex selectedNamespace", this.selectedNamespace)

    // Comunicate to the subscriber "modal-preview-k-b" the change of the context
    this.aiSettingsObject[0].context = event
    // this.logger.log("[MODAL PREVIEW SETTINGS] updateSliderValue aiSettingsObject", this.aiSettingsObject)
    this.kbService.hasChagedAiSettings(this.aiSettingsObject)
  }

  changeChunkOnly(event) {
    this.logger.log("[MODAL PREVIEW SETTINGS] changeChunkOnly event ", event.target.checked)
    this.chunkOnly = event.target.checked
    if (!this.wasOpenedFromThePreviewKBModal) {
      this.selectedNamespace.preview_settings.chunks_only = this.chunkOnly
      this.logger.log("[MODAL PREVIEW SETTINGS] changeChunkOnly this.selectedNamespace ", this.selectedNamespace)
    }

    // Comunicate to the subscriber "modal-preview-k-b" the change of the model
    this.aiSettingsObject[0].chunkOnly = event.target.checked
    this.kbService.hasChagedAiSettings(this.aiSettingsObject)

    if (this.chunkOnly !== this.selectedNamespace.preview_settings.chunks_only) {   
      if (this.hasAlreadyOverrideChunckOnly !== true) {
        this.countOfOverrides = this.countOfOverrides + 1;
      }
      this.hasAlreadyOverrideChunckOnly = true
    } else if (this.chunkOnly === this.selectedNamespace.preview_settings.chunks_only) {
      this.countOfOverrides = this.countOfOverrides - 1;
      this.hasAlreadyOverrideChunckOnly = false
    }
  }

  changeReranking(event) {
    // this.saveDialogScrollPosition();
    this.logger.log("[MODAL PREVIEW SETTINGS] changeReranking event ", event.target.checked)
    this.reRanking = event.target.checked
    if (!this.wasOpenedFromThePreviewKBModal) {
      this.selectedNamespace.preview_settings.reranking = this.reRanking
      this.logger.log("[MODAL PREVIEW SETTINGS] changeReranking this.selectedNamespace ", this.selectedNamespace)
    }

    // Comunicate to the subscriber "modal-preview-k-b" the change of the model
    this.aiSettingsObject[0].reRanking = event.target.checked
    this.kbService.hasChagedAiSettings(this.aiSettingsObject)

    if (this.reRanking !== this.selectedNamespace.preview_settings.reranking) {   
      if (this.hasAlreadyOverrideReRanking !== true) {
        this.countOfOverrides = this.countOfOverrides + 1;
      }
      this.hasAlreadyOverrideReRanking = true
    } else if (this.reRanking === this.selectedNamespace.preview_settings.reranking) {
      this.countOfOverrides = this.countOfOverrides - 1;
      this.hasAlreadyOverrideReRanking = false
    }
    // this.restoreDialogScrollPosition();
  }

  changeAdvancePrompt(event) {
    this.logger.log("[MODAL PREVIEW SETTINGS] changeAdvancedContext event ", event.target.checked)
    this.advancedPrompt = event.target.checked
    

    if (!this.wasOpenedFromThePreviewKBModal) {
      this.selectedNamespace.preview_settings.advancedPrompt = this.advancedPrompt
      this.logger.log("[MODAL PREVIEW SETTINGS] changeAdvancedContext this.selectedNamespace ", this.selectedNamespace)
    }
    // Comunicate to the subscriber "modal-preview-k-b" the change of the model
    this.aiSettingsObject[0].advancedPrompt = event.target.checked
    this.kbService.hasChagedAiSettings(this.aiSettingsObject)

    if (this.advancedPrompt !== this.selectedNamespace.preview_settings.advancedPrompt) {
      // if (this.hasAlreadyOverrideAdvancedContex !== true) {
      this.countOfOverrides = this.countOfOverrides + 1;
      // }
      this.hasAlreadyOverrideAdvancedContex = true
    } else if (this.advancedPrompt !== this.selectedNamespace.preview_settings.advancedPrompt) {
      this.countOfOverrides = this.countOfOverrides - 1;
      this.hasAlreadyOverrideAdvancedContex = false
    }

  }

  changeCitations(event) {
    this.logger.log("[MODAL PREVIEW SETTINGS] changeCitations event ", event.target.checked)
    this.citations = event.target.checked;
    if (this.citations === true) {
      this.max_tokens_min = 1024
      this.max_tokens = 1024
      this.selectedNamespace.preview_settings.max_tokens = this.max_tokens
    } else {
      this.max_tokens_min = 10;
      this.max_tokens = 256
      this.selectedNamespace.preview_settings.max_tokens = this.max_tokens
    }


    if (!this.wasOpenedFromThePreviewKBModal) {
      this.selectedNamespace.preview_settings.citations = this.citations
      this.logger.log("[MODAL PREVIEW SETTINGS] changeCitations this.selectedNamespace ", this.selectedNamespace)
    }

    this.aiSettingsObject[0].citations = this.citations;
    this.kbService.hasChagedAiSettings(this.aiSettingsObject)

    // if (this.citations !== this.selectedNamespace.preview_settings.citations) {
    //   if (this.hasAlreadyOverrideCitations !== true) {
    //     this.countOfOverrides = this.countOfOverrides + 1;
    //   }
    //   this.hasAlreadyOverrideCitations = true
    //   this.logger.log('hasAlreadyOverrideCitations ' , this.hasAlreadyOverrideCitations) 
    // } else {
    //   this.logger.log('here y hasAlreadyOverrideCitations' , this.hasAlreadyOverrideCitations) 
    //   this.countOfOverrides = this.countOfOverrides - 1;
    // }

    if (this.citations !== this.selectedNamespace.preview_settings.citations) {
      // if (this.hasAlreadyOverrideCitations !== true) {
      this.countOfOverrides = this.countOfOverrides + 1;
      // }
      this.hasAlreadyOverrideCitations = true
      this.logger.log('hasAlreadyOverrideCitations ', this.hasAlreadyOverrideCitations)
    } else if (this.citations === this.selectedNamespace.preview_settings.citations) {
      this.hasAlreadyOverrideCitations = false
      this.logger.log('here y hasAlreadyOverrideCitations', this.hasAlreadyOverrideCitations)
      this.countOfOverrides = this.countOfOverrides - 1;
    }



  }

  onSavePreviewSettings() {
    // this.logger.log('[MODAL PREVIEW SETTINGS] onSavePreviewSettings')
    this.dialogRef.close({ action: "update", selectedNamespace: this.selectedNamespace });
  }

  // closeSettingsAndOpenPreviewKBModal() {
  //   this.dialogRef.close({ action: "update-and-open-preview", selectedNamespace: this.selectedNamespace });
  // }

  onNoClick(): void {
    this.logger.log('onNoClick ')
    this.dialogRef.close();

  }

  reset() {

    this.countOfOverrides = 0;
    this.hasAlreadyOverridedModel = false;
    this.hasAlreadyOverridedMaxTokens = false;
    this.hasAlreadyOverridedTemperature = false;
    this.hasAlreadyOverridedAlpha = false;
    this.hasAlreadyOverridedTopk = false;
    this.hasAlreadyOverridedContex = false;
    this.hasAlreadyOverrideAdvancedContex = false;
    this.hasAlreadyOverrideCitations = false;
    this.hasAlreadyOverrideChunckOnly = false;
    this.hasAlreadyOverrideReRanking = false;
    this.hasAlreadyOverrideReRankingMultipler = false;

    this.selectedModel = this.selectedNamespaceClone.preview_settings.model;
    // this.selectedNamespace.preview_settings.model = this.modelDefaultValue


    // this.logger.log('[MODAL PREVIEW SETTINGS] RESET TO DEFAULT selectedModel', this.selectedModel)
    this.max_tokens = this.selectedNamespaceClone.preview_settings.max_tokens;
    // this.selectedNamespace.preview_settings.max_tokens = this.maxTokensDefaultValue;

    if (this.selectedModel.startsWith('gpt-5')) {
      this.temperature = 1
      this.temperature_slider_disabled = true;
      //  this.max_tokens_max = 100000
    } else {
      this.temperature = this.selectedNamespaceClone.preview_settings.temperature;
      this.temperature_slider_disabled = false;
      // this.max_tokens_max = 9999
      // if (this.max_tokens > 9999 ) {
      //   this.max_tokens = this.maxTokensDefaultValue;
      // }
    }

    // this.temperature = this.selectedNamespaceClone.preview_settings.temperature;


    this.topK = this.selectedNamespaceClone.preview_settings.top_k;
    // this.selectedNamespace.preview_settings.top_k = this.topkDefaultValue;

    this.alpha = this.selectedNamespaceClone.preview_settings.alpha

    this.context = this.selectedNamespaceClone.preview_settings.context;

    this.advancedPrompt = this.selectedNamespaceClone.preview_settings.advancedPrompt;

    this.chunkOnly = this.selectedNamespaceClone.preview_settings.chunks_only;

    this.reRanking = this.selectedNamespaceClone.preview_settings.reranking;

    this.citations = this.selectedNamespaceClone.preview_settings.citations
    this.logger.log('Reset this.citations ', this.citations)
    if (this.citations) {
      this.max_tokens_min = 1024;
    } else {
      this.max_tokens_min = 10;
    }
    // this.selectedNamespace.preview_settings.context = this.contextDefaultValue;

    // this.aiSettingsObject[0].model = this.modelDefaultValue;
    // this.aiSettingsObject[0].maxTokens = this.maxTokensDefaultValue
    // this.aiSettingsObject[0].temperature = this.temperatureDefaultValue;
    // this.aiSettingsObject[0].top_k = this.topkDefaultValue;
    // this.aiSettingsObject[0].advancedPrompt = this.advancedPromptDefaultValue;
    // this.aiSettingsObject[0].citations = this.citationsDefaultValue;

    this.aiSettingsObject[0].model = this.selectedModel;
    this.aiSettingsObject[0].maxTokens = this.max_tokens
    this.aiSettingsObject[0].temperature = this.temperature;
    this.aiSettingsObject[0].top_k = this.topK;
    this.aiSettingsObject[0].context = this.context
    this.aiSettingsObject[0].advancedPrompt = this.advancedPrompt;
    this.aiSettingsObject[0].citations = this.citations;
    this.aiSettingsObject[0].chunkOnly = this.chunkOnly;
    this.aiSettingsObject[0].reRanking = this.reRanking;
    this.aiSettingsObject[0].reRankingMultipler = this.reRankingMultipler;
    this.kbService.hasChagedAiSettings(this.aiSettingsObject)

  }

  resetToDefault() {
    // this.selectedModel = this.model_list[3].value;
    this.selectedModel = this.modelDefaultValue
    this.selectedNamespace.preview_settings.model = this.modelDefaultValue

    this.logger.log('[MODAL PREVIEW SETTINGS] RESET TO DEFAULT selectedModel', this.selectedModel)
    this.max_tokens = this.maxTokensDefaultValue;
    this.selectedNamespace.preview_settings.max_tokens = this.maxTokensDefaultValue;

    this.max_tokens_min = 10;

    this.temperature = this.temperatureDefaultValue;
    this.selectedNamespace.preview_settings.temperature = this.temperatureDefaultValue;

    this.alpha = this.alphaDefaultValue;
    this.selectedNamespace.preview_settings.alpha = this.alphaDefaultValue;

    this.topK = this.topkDefaultValue;
    this.selectedNamespace.preview_settings.top_k = this.topkDefaultValue;

    this.context = this.contextDefaultValue;
    this.selectedNamespace.preview_settings.context = this.contextDefaultValue;

    this.advancedPrompt = this.advancedPromptDefaultValue
    this.selectedNamespace.preview_settings.advancedPrompt = this.advancedPromptDefaultValue;

    this.citations = this.citationsDefaultValue
    this.selectedNamespace.preview_settings.citations = this.citationsDefaultValue;

    this.chunkOnly = this.chunksOnlyDefaultValue
    this.selectedNamespace.preview_settings.chunks_only = this.chunksOnlyDefaultValue
    
    this.reRanking = this.reRankigDefaultValue
    this.selectedNamespace.preview_settings.reranking = this.reRankigDefaultValue

    this.aiSettingsObject[0].model = this.modelDefaultValue;
    this.aiSettingsObject[0].maxTokens = this.maxTokensDefaultValue
    this.aiSettingsObject[0].temperature = this.temperatureDefaultValue;
    this.aiSettingsObject[0].top_k = this.topkDefaultValue;
    this.aiSettingsObject[0].context = this.contextDefaultValue;
    this.aiSettingsObject[0].chunkOnly = this.chunksOnlyDefaultValue;
    this.aiSettingsObject[0].reRanking = this.reRankigDefaultValue;
    this.aiSettingsObject[0].reRankingMultipler = this.reRankigMultiplerDefaultValue;
    this.kbService.hasChagedAiSettings(this.aiSettingsObject)

  }

  // onCloseBaseModal() { 
  //   this.closeBaseModal.emit();
  // }



  listenToOnClickedBackdrop() {
    document.addEventListener(
      "on-backdrop-clicked", (e: CustomEvent) => {
        //  this.logger.log("[MODAL PREVIEW SETTINGS] on-backdrop-clicked e:", e);
        //  this.logger.log("[MODAL PREVIEW SETTINGS] on-backdrop-clicked e.detail:", e.detail);
        if (e.detail && e.detail === true) {
          this.aiModel.close()
          this.maxTokens.close()
          this.aiModeltemperature.close()
          this.aiSearchType.close();
          this.chunkLimit.close()
          this.systemContext.close()
          this.advancedContext.close()
          this.contentsSources.close()
        }
      }
    );
  }
  // 
  listenToHasClickedInsideModalPreviewKb() {
    // this.logger.log('[MODAL PREVIEW SETTINGS] listenToHasClickedInsideModalPreviewKb',) 
    document.addEventListener(
      "has-clicked-inside-modal-preview-kb", (e: CustomEvent) => {
        //  this.logger.log("[MODAL PREVIEW SETTINGS] has-clicked-inside-modal-preview-kb e:", e);
        //  this.logger.log("[MODAL PREVIEW SETTINGS] has-clicked-inside-modal-preview-kb e.detail:", e.detail);
        if (e.detail && e.detail === true) {
          this.aiModel.close()
          this.maxTokens.close()
          this.aiModeltemperature.close()
          this.aiSearchType.close()
          this.chunkLimit.close()
          this.systemContext.close()
          this.advancedContext.close()
          this.contentsSources.close()
        }
      }
    );
  }


  handleClickInside(event: MouseEvent): void {
    // this.clickedInside = true;
    // this.clickedOutside = false;
    // this.logger.log('Clicked inside the div');
    this.aiModel.close()
    this.maxTokens.close()
    this.aiModeltemperature.close()
    this.aiSearchType.close()
    this.chunkLimit.close()
    this.systemContext.close()
    this.advancedContext.close()
    this.contentsSources.close()
  }

  // onMouseEnter(event: MouseEvent): void {
  //   this.logger.log('Mouse entered  event ', event);
  //   const hoveredElement = event.target as HTMLElement;
  //   this.logger.log('Mouse entered:', hoveredElement.tagName);
  // }

  // onMouseMove(event: MouseEvent): void {
  //   // if (this.isMouseInside) {
  //     // You can perform actions continuously while the mouse is inside
  //     this.logger.log(`Mouse is moving inside event: `, event.target['id']);
  //     this.logger.log(`Mouse is moving inside the div at (${event.clientX}, ${event.clientY})`);
  //     if (event.target['id'] !== "ai-settings-label")  {
  //       // this.aiModel.close()
  //       // this.maxTokens.close()
  //       // this.aiModeltemperature.close()
  //       // this.chunkLimit.close()
  //       // this.systemContext.close()
  //     }

  // }


  aiModelPopoverIsOpened() {
    this.logger.log('[MODAL PREVIEW SETTINGS] aiModelPopoverIsOpened')
    this.logger.log("[MODAL PREVIEW SETTINGS] aiModel sat popover", this.aiModel)
  }

  maxTokenPopoverIsOpened() {
    this.logger.log('[MODAL PREVIEW SETTINGS] maxTokenPopoverIsOpened')
    this.logger.log("[MODAL PREVIEW SETTINGS] maxTokens sat popover", this.maxTokens)
  }

  temperaturePopoverIsOpened() {
    this.logger.log('[MODAL PREVIEW SETTINGS] temperaturePopoverIsOpened')
    this.logger.log("[MODAL PREVIEW SETTINGS] aiModeltemperature sat popover", this.aiModeltemperature)
  }

  searchTypePopoverIsOpened() {
    this.logger.log('[MODAL PREVIEW SETTINGS] searchTypePopoverIsOpened')
    this.logger.log("[MODAL PREVIEW SETTINGS] searchTypePopoverIsOpened sat popover", this.aiSearchType)
  }

  chunkLimitPopoverIsOpened() {
    this.logger.log('[MODAL PREVIEW SETTINGS] chunkLimitPopoverIsOpened')
    this.logger.log("[MODAL PREVIEW SETTINGS] chunkLimit sat popover", this.chunkLimit
    )
  }

  systemContextPopoverIsOpened() {
    this.logger.log('[MODAL PREVIEW SETTINGS] systemContextPopoverIsOpened')
    this.logger.log("[MODAL PREVIEW SETTINGS] systemContext sat popover", this.systemContext)
  }

  advancedContextIsOpened() {
    this.logger.log('[MODAL PREVIEW SETTINGS] advancedContextIsOpened')
    this.logger.log("[MODAL PREVIEW SETTINGS] advancedPrompt sat popover", this.advancedPrompt)
  }

  contentsSourcesIsOpened() {
    this.logger.log('[MODAL PREVIEW SETTINGS] contentsSourcesIsOpened')
    this.logger.log("[MODAL PREVIEW SETTINGS] contentsSources sat popover", this.contentsSources)
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

  goToAdvancedContextDoc() {
    const url = URL_advanced_context_doc;
    window.open(url, '_blank');
  }

  goToContentsSourcesDoc() {
    const url = URL_contents_sources_doc;
    window.open(url, '_blank');
  }

  formatMaxTokens(value: number): string {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }
    return value.toString();
  }

}
