import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges, Inject, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { KB } from 'app/models/kbsettings-model';
import { LoggerService } from 'app/services/logger/logger.service';
import { OpenaiService } from 'app/services/openai.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { LocalDbService } from 'app/services/users-local-db.service';
import { ModalPreviewSettingsComponent } from '../modal-preview-settings/modal-preview-settings.component';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { PricingBaseComponent } from 'app/pricing/pricing-base/pricing-base.component';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { NotifyService } from 'app/core/notify.service';
import { NavigationEnd, Router } from '@angular/router';
import { BrandService } from 'app/services/brand.service';
import { AppConfigService } from 'app/services/app-config.service';
import { ConnectedPosition } from '@angular/cdk/overlay';
import {
  URL_kb_contents_tags,
  getLlmModelDefaultMaxTokens,
  getLlmModelTokenBounds,
  LLM_MAX_TOKENS_SLIDER_UI_CAP,
} from 'app/utils/util';




@Component({
  selector: 'modal-preview-knowledge-base',
  templateUrl: './modal-preview-knowledge-base.component.html',
  styleUrls: ['./modal-preview-knowledge-base.component.scss']
})



export class ModalPreviewKnowledgeBaseComponent extends PricingBaseComponent implements OnInit, AfterViewInit {
  private static readonly SERVER_LEGACY_MAX_TOKENS_SENTINEL = 256;

  // @Input() selectedNamespace: any;
  @Output() deleteKnowledgeBase = new EventEmitter();
  @Output() closeBaseModal = new EventEmitter();
  aiSettingsObject = [{
    model: null,
    maxTokens: null,
    temperature: null,
    alpha: null,
    top_k: null,
    context: null,
    advancedPrompt: null,
    citations: null,
    useHyde: null,
    reRanking: null,
    reRankingMultipler: null,
  }]
  panelOpenState = false;
  chunksPanelOpen = false;
  sourcesPanelOpen = false; 
  selectedNamespace: any;
  namespaceid: string;
  selectedModel: string;
  maxTokens: number;
  temperature: number;
  alpha: number;
  topK: number;
  context: string;
  isopenasetting: boolean;
  hasStoredQuestion: boolean;
  private dialogRefAiSettings: MatDialogRef<any>;
  @ViewChild('questionTextarea', { static: false }) questionTextarea: ElementRef<HTMLTextAreaElement>;


  // models_list = [
  //   { name: "GPT-3.5 Turbo (ChatGPT)", value: "gpt-3.5-turbo" }, 
  //   { name: "GPT-4 (ChatGPT)", value: "gpt-4" },
  //   { name: "GPT-4 Turbo Preview (ChatGPT)", value: "gpt-4-turbo-preview" }, 
  //   { name: "GPT-4o (ChatGPT)", value: "gpt-4o" }
  // ];
  // selectedModel: any = this.models_list[1].value;

  qa: any;

  question: string = "";
  /** Preview: risposta in streaming (default) vs risposta completa in un’unica richiesta. */
  previewUseStream = true;
  answer: string = "";
  source_url: any;
  responseTime: number | null = null;

  searching: boolean = false;
  /** Evita doppio finalize; sostituisce il guard su searching (stream vuoto può lasciare stati incoerenti). */
  private kbStreamFinalized = false;
  show_answer: boolean = false;
  // error_answer: boolean = false;
  translateparam: any;
  body: any;
  storedQuestionNoDoubleQuote: string;
  aiQuotaExceeded: boolean = false;
  prompt_token_size: number;
  public chunkOnly: boolean
  public reRanking: boolean;
  public reRankingMultipler: number;
  public citations: boolean // = false;
  public advancedPrompt: boolean // = false;
  public useHyde: boolean // = false;
  contentChunks: string[] = [];
  contentSources: { value: string; isUrl: boolean }[] = [];

  // KB Tags
  kbTag: string = '';
  kbTagsArray = []
  @ViewChild('kbTagsContainer') kbTagsContainer!: ElementRef;
  private observer!: MutationObserver;
  tagContainerElementHeight: any;
  public hideHelpLink: boolean;

  isOpen = false;
  private closeTimeout: any;

  positions: ConnectedPosition[] = [
    {
      originX: 'start',
      originY: 'center',
      overlayX: 'end',
      overlayY: 'center',
      offsetX: -30
    }
  ];
  

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalPreviewKnowledgeBaseComponent>,
    private logger: LoggerService,
    private openaiService: OpenaiService,
    private translate: TranslateService,
    public localDbService: LocalDbService,
    public dialog: MatDialog,
    private kbService: KnowledgeBaseService,
    public prjctPlanService: ProjectPlanService,
    public notify: NotifyService,
    private router: Router,
    private brandService: BrandService,
    private cdr: ChangeDetectorRef,
    private appConfigService: AppConfigService
  ) {
    super(prjctPlanService, notify);
    const brand = brandService.getBrand();
    this.hideHelpLink = brand['DOCS'];
    this.logger.log('[MODAL-PREVIEW-KB] data ', data)
    if (data && data.selectedNamespace) {
      this.selectedNamespace = data.selectedNamespace;
      this.namespaceid = this.selectedNamespace.id;
      this.selectedModel = this.selectedNamespace.preview_settings.model;
      this.maxTokens = this.selectedNamespace.preview_settings.max_tokens;
      this.temperature = this.selectedNamespace.preview_settings.temperature;
      this.alpha = this.selectedNamespace.preview_settings.alpha;
      this.topK = this.selectedNamespace.preview_settings.top_k;
      this.context = this.selectedNamespace.preview_settings.context;
      this.reRankingMultipler = this.selectedNamespace.preview_settings.reranking_multiplier;
      this.logger.log('[MODAL-PREVIEW-KB] this.selectedNamespace.preview_settings ', this.selectedNamespace.preview_settings)

      
      if (!this.selectedNamespace.preview_settings.chunks_only) {
        this.chunkOnly = false
        this.selectedNamespace.preview_settings.chunks_only = this.chunkOnly
      } else {
        this.chunkOnly = this.selectedNamespace.preview_settings.chunks_only
        this.logger.log("[MODAL-PREVIEW-KB] chunkOnly ", this.chunkOnly)
      }

      if (!this.selectedNamespace.preview_settings.reranking) {
        this.reRanking = false
        this.selectedNamespace.preview_settings.reranking = this.reRanking
      } else {
        this.reRanking = this.selectedNamespace.preview_settings.reranking
        this.logger.log("[MODAL-PREVIEW-KB] reRanking ", this.reRanking)
      }

      if (!this.selectedNamespace.preview_settings.advancedPrompt) {
        this.advancedPrompt = false
        this.selectedNamespace.preview_settings.advancedPrompt = this.advancedPrompt
      } else {
        this.advancedPrompt = this.selectedNamespace.preview_settings.advancedPrompt
        this.logger.log("[MODAL-PREVIEW-KB] advancedPrompt ", this.advancedPrompt)
      }

      if (!this.selectedNamespace.preview_settings.citations) {
        this.citations = false
        this.selectedNamespace.preview_settings.citations = this.citations
      } else {
        this.citations = this.selectedNamespace.preview_settings.citations
        this.logger.log("[MODAL PREVIEW SETTINGS] citations ", this.citations)
      }

      if (!this.selectedNamespace.preview_settings.use_hyde) {
        this.useHyde = false
        this.selectedNamespace.preview_settings.use_hyde = this.useHyde
      } else {
        this.useHyde = this.selectedNamespace.preview_settings.use_hyde
        this.logger.log("[MODAL-PREVIEW-KB] useHyde ", this.useHyde)
      }

      this.logger.log('[MODAL-PREVIEW-KB] selectedNamespace', this.selectedNamespace)
      this.logger.log('[MODAL-PREVIEW-KB] selectedNamespace preview_settings', this.selectedNamespace.preview_settings)
      this.logger.log('[MODAL-PREVIEW-KB] namespaceid', this.namespaceid)
      this.logger.log('[MODAL-PREVIEW-KB] selectedModel', this.selectedModel)

      // Stessi limiti dello slider in modal-preview-settings: evita payload con max_tokens fuori range (es. valore vecchio sul namespace).
      this.applyPreviewMaxTokensClamp();
    }
    if (data && data.askBody) {
      this.logger.log('[MODAL-PREVIEW-KB] askBody', data.askBody)
      // this.question = data.askBody.question
      // this.submitQuestion()
    }
    this.listenToCurrentURL()
  }

  ngOnInit(): void {
    this.listenPreviewKbHasBeenCloseBackdropClicking()
    this.listenToAiSettingsChanges()
    this.checkStoredQuestion();
  }

  ngAfterViewInit() {
    this.initTagContainerObserver();
  }

  ngOnDestroy() { 
    this.logger.log('[MODALS-URLS] ngOnDestroy called');
    // Disconnettere l'observer per evitare memory leaks
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  // CDK methods
  open() {
    clearTimeout(this.closeTimeout);
    this.isOpen = true;
  }

  scheduleClose() {
    this.closeTimeout = setTimeout(() => {
      this.isOpen = false;
    }, 150);
  }

  cancelClose() {
    clearTimeout(this.closeTimeout);
  }

  /**
   * Helper method per controllare e parsare la question salvata
   * Gestisce sia il formato JSON che il formato vecchio
   */
  private checkStoredQuestion(): void {
    const storedQuestion = this.localDbService.getFromStorage(`last_question-${this.namespaceid}`)
    if (storedQuestion) {
      this.hasStoredQuestion = true;
      this.logger.log("[MODAL-PREVIEW-KB] checkStoredQuestion hasStoredQuestion: ", this.hasStoredQuestion);
      this.logger.log("[MODAL-PREVIEW-KB] checkStoredQuestion storedQuestion: ", storedQuestion);
      try {
        // Try to parse as JSON first (for new format)
        let parsed = JSON.parse(storedQuestion);
        // Even after JSON.parse, if the original string had literal \n, they might still be literal
        // Replace any remaining literal \n with real newlines
        this.storedQuestionNoDoubleQuote = typeof parsed === 'string' ? parsed.replace(/\\n/g, '\n') : parsed;
      } catch (e) {
        // If parsing fails, it might be an old format or already a string with literal \n
        // Replace literal \n with real newlines
        let cleaned = storedQuestion.replace(/\\n/g, '\n');
        // Remove surrounding quotes if present
        if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
          cleaned = cleaned.substring(1, cleaned.length - 1);
        }
        this.storedQuestionNoDoubleQuote = cleaned;
      }
    } else {
      this.hasStoredQuestion = false;
      this.logger.log("[MODAL-PREVIEW-KB] checkStoredQuestion hasStoredQuestion: ", this.hasStoredQuestion);
    }
  }

  /**
   * Stessi limiti dello slider in modal-preview-settings (`applyMaxTokenSliderFromUtil`), senza reset al default del modello.
   */
  private applyPreviewMaxTokensClamp(): void {
    if (!this.selectedNamespace?.preview_settings || !this.selectedModel) {
      return;
    }
    const modelValue = this.selectedModel;
    const bounds = getLlmModelTokenBounds(modelValue);
    const utilMin = bounds?.min_tokens ?? 1;
    const max_tokens_min = this.citations ? Math.max(utilMin, 1024) : utilMin;
    const catalogMax = bounds?.max_output_tokens ?? LLM_MAX_TOKENS_SLIDER_UI_CAP;
    let max_tokens_max = Math.min(catalogMax, LLM_MAX_TOKENS_SLIDER_UI_CAP);
    if (max_tokens_min > max_tokens_max) {
      max_tokens_max = max_tokens_min;
    }
    const clamp = (v: number) => Math.min(Math.max(v, max_tokens_min), max_tokens_max);
    const raw = this.maxTokens;
    if (raw != null && !Number.isNaN(Number(raw))) {
      let v = Number(raw);
      const modelNorm = (modelValue || '').trim().toLowerCase();
      if (modelNorm === 'gpt-4o' && v === ModalPreviewKnowledgeBaseComponent.SERVER_LEGACY_MAX_TOKENS_SENTINEL) {
        v = getLlmModelDefaultMaxTokens('gpt-4o');
      }
      this.maxTokens = clamp(v);
    } else {
      this.maxTokens = clamp(getLlmModelDefaultMaxTokens(modelValue));
    }
    this.selectedNamespace.preview_settings.max_tokens = this.maxTokens;
  }

  listenToCurrentURL() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.logger.log('[MODAL-PREVIEW-KB] - NavigationEnd event url ', event.url)
        const currentUrl: string = event.url;
            
        if (currentUrl.includes('/knowledge-bases')) {
          this.logger.log("✅ User is on the 'knowledge-bases' route.");
        } else {
          this.logger.log("❌ User is NOT on the 'knowledge-bases' route.");
            this.dialogRef.close();
            if (this.dialogRefAiSettings) {
              this.dialogRefAiSettings.close()
            }
        }
      }
    })
  }


  presentDialogAiSettings(isopenasetting) {

    this.logger.log('[MODAL-PREVIEW-KB] window.innerWidth', window.innerWidth);
    this.logger.log(`[MODAL-PREVIEW-KB] presentDialogAiSettings isopenasetting:`, isopenasetting);

    this.logger.log('[MODAL-PREVIEW-KB] presentDialogAiSettings selectedModel to use for test', this.selectedModel)
    this.logger.log('[MODAL-PREVIEW-KB] presentDialogAiSettings maxTokens to use for test', this.maxTokens)
    this.logger.log('[MODAL-PREVIEW-KB] presentDialogAiSettings temperature to use for test', this.temperature)
    this.logger.log('[MODAL-PREVIEW-KB] presentDialogAiSettings alpha to use for test', this.alpha)
   
    this.logger.log('[MODAL-PREVIEW-KB] presentDialogAiSettings topK to use for test', this.topK)
    this.logger.log('[MODAL-PREVIEW-KB] presentDialogAiSettings context to use for test', this.context)



    this.isopenasetting = isopenasetting
    this.dialogRefAiSettings = this.dialog.open(ModalPreviewSettingsComponent, {
      width: '320px',
      position: { left: 'calc(50% + 210px)', top: '60px' },
      autoFocus: false,
      hasBackdrop: false,
      data: {
        selectedNamespace: this.selectedNamespace,
        calledBy: "modal-preview-kb",
        pineconeReranking: this.appConfigService.getConfig().pineconeReranking
      },
    })
    this.dialogRefAiSettings.afterClosed().subscribe(result => {

      // this.dialogRefAiSettings = null;
      this.logger.log(`[MODAL-PREVIEW-KB] DIALOG AI SETTINGS after closed result:`, result);

      // this.logger.log(`[KNOWLEDGE-BASES-COMP] DIALOG HOOK BOT after closed getState:`,  dialogRef.getState());
      // dialogRef.getState()
      // if (result && result.deptId && result.botId) {
      // this.hookBotToDept(result.deptId, result.botId)
      // }
    });

  }

  handleClickInside(event: MouseEvent): void {
    const customevent = new CustomEvent("has-clicked-inside-modal-preview-kb", { detail: true });
    document.dispatchEvent(customevent);

  }




  reuseLastQuestion() {
    const textarea = this.questionTextarea.nativeElement;
    setTimeout(() => {
      this.onTextareaInput(textarea);
    }, 0);
    
    // Usa la funzione helper per controllare e parsare la question salvata
    this.checkStoredQuestion();
    
    // Imposta la question nel textarea
    if (this.hasStoredQuestion && this.storedQuestionNoDoubleQuote) {
      this.question = this.storedQuestionNoDoubleQuote;
    }
  }



  listenPreviewKbHasBeenCloseBackdropClicking() {
    this.kbService.previewKbClosed$.subscribe((previeKbHasBeenClosed: boolean) => {
      if (previeKbHasBeenClosed) {
        this.logger.log('[MODAL-PREVIEW-KB] listenPreviewKbHasBeenCloseBackdropClicking previeKbHasBeenClosed ', previeKbHasBeenClosed)
        if (previeKbHasBeenClosed) {
          this.logger.log('[MODAL-PREVIEW-KB] dialogRefAiSettings', this.dialogRefAiSettings)
          if (this.dialogRefAiSettings) {
            this.dialogRefAiSettings.close()
          }
        }
      }
    })
  }


  listenToAiSettingsChanges() {
    this.kbService.editedAiSettings$.subscribe((editedAiSettings: any) => {
      this.logger.log('[MODAL-PREVIEW-KB] editedAiSettings ', editedAiSettings)
      if (editedAiSettings && editedAiSettings.length > 0) {
        this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges current selectedModel', this.selectedModel)

        this.logger.log('[MODAL-PREVIEW-KB] editedAiSettings ', editedAiSettings)


        if (editedAiSettings && editedAiSettings[0]['model']) {
          this.selectedModel = editedAiSettings[0]['model']
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges selectedModel to use for test from editedAiSettings 1', this.selectedModel)
        } else {
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges selectedModel to use selectedNamespace > preview_settings', this.selectedNamespace.preview_settings)
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges selectedModel to use for test from editedAiSettings 2', editedAiSettings[0]['model'])
          this.selectedModel = this.selectedNamespace.preview_settings.model
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges selectedModel to use for test from selectedNamespace ', this.selectedModel)
        }
        const incomingMax = editedAiSettings[0]['maxTokens'];
        if (incomingMax != null && typeof incomingMax === 'number' && !Number.isNaN(incomingMax)) {
          this.maxTokens = incomingMax;
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges maxTokens to use for test from editedAiSettings 1', this.maxTokens)
        } else {
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges maxTokens to use for test from editedAiSettings 2', editedAiSettings[0]['maxTokens'])
          this.maxTokens = this.selectedNamespace.preview_settings.max_tokens
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges maxTokens to use for test from selectedNamespace ', this.maxTokens)
        }
        if (editedAiSettings && editedAiSettings[0]['temperature']) {
          this.temperature = editedAiSettings[0]['temperature']
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges temperature to use for test from editedAiSettings 1', this.temperature)
        } else {
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges temperature to use for test from editedAiSettings 2', editedAiSettings[0]['temperature'])
          this.temperature = this.selectedNamespace.preview_settings.temperature
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges temperature to use for test from selectedNamespace ', this.temperature)
        }

        if (editedAiSettings && editedAiSettings[0]['alpha']) {
          this.alpha = editedAiSettings[0]['alpha']
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges alpha to use for test from editedAiSettings 1', this.alpha)
        } else {
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges alpha to use for test from editedAiSettings 2', editedAiSettings[0]['alpha'])
          this.alpha = this.selectedNamespace.preview_settings.alpha
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges alpha to use for test from selectedNamespace ', this.alpha)
        }

        if (editedAiSettings && editedAiSettings[0]['top_k']) {
          this.topK = editedAiSettings[0]['top_k']
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges topK to use for test from editedAiSettings 1', this.topK)
        } else {
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges topK to use for test from editedAiSettings 2', editedAiSettings[0]['top_k'])
          this.topK = this.selectedNamespace.preview_settings.top_k
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges topK to use for test from selectedNamespace ', this.topK)
        }

        if (editedAiSettings && editedAiSettings[0]['context']) {
          this.context = editedAiSettings[0]['context']
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges context to use for test from editedAiSettings 1', this.context)
        } else {
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges context to use for test from editedAiSettings 2', editedAiSettings[0]['context'])
          this.context = this.selectedNamespace.preview_settings.context
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges context to use for test from selectedNamespace ', this.context)
        }

        if (editedAiSettings && editedAiSettings[0]['chunkOnly'] === true) {
          this.chunkOnly = editedAiSettings[0]['chunkOnly']
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges chunkOnly to use for test from editedAiSettings 1', this.chunkOnly)
        } else if (editedAiSettings && editedAiSettings[0]['chunkOnly'] === false) {
          this.chunkOnly = editedAiSettings[0]['chunkOnly']
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges chunkOnly to use for test from editedAiSettings 1', this.chunkOnly)
        } else if ((editedAiSettings && editedAiSettings[0]['chunkOnly'] === null)) {
          this.chunkOnly = this.selectedNamespace.preview_settings.chunkOnly
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges chunkOnly to use for test from selectedNamespace ', this.chunkOnly)
        }

        if (editedAiSettings && editedAiSettings[0]['reRanking'] === true) {
          this.reRanking = editedAiSettings[0]['reRanking']
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges reRanking to use for test from editedAiSettings 1', this.reRanking)
        } else if (editedAiSettings && editedAiSettings[0]['reRanking'] === false) {
          this.reRanking = editedAiSettings[0]['reRanking']
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges reRanking to use for test from editedAiSettings 2', this.reRanking)
        } else if ((editedAiSettings && editedAiSettings[0]['reRanking'] === null)) {
          this.reRanking = this.selectedNamespace.preview_settings.reranking
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges reRanking to use for test from selectedNamespace ', this.reRanking)
        }

        if (editedAiSettings && editedAiSettings[0]['reRankingMultipler']) {
          this.reRankingMultipler = editedAiSettings[0]['reRankingMultipler']
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges reRankingMultipler to use for test from editedAiSettings 1', this.reRankingMultipler)
        } else {
          this.reRankingMultipler = this.selectedNamespace.preview_settings.reranking_multiplier
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges reRankingMultipler to use for test from selectedNamespace ', this.reRankingMultipler)
        }

        if (editedAiSettings && editedAiSettings[0]['advancedPrompt'] === true) {
          this.advancedPrompt = editedAiSettings[0]['advancedPrompt']
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges advancedPrompt to use for test from editedAiSettings 1', this.advancedPrompt)
        } else if (editedAiSettings && editedAiSettings[0]['advancedPrompt'] === false) {
          this.advancedPrompt = editedAiSettings[0]['advancedPrompt']
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges advancedPrompt to use for test from editedAiSettings 1', this.advancedPrompt)
        } else if ((editedAiSettings && editedAiSettings[0]['advancedPrompt'] === null)) {
          this.advancedPrompt = this.selectedNamespace.preview_settings.advancedPrompt
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges advancedPrompt to use for test from selectedNamespace ', this.advancedPrompt)
        }

        if (editedAiSettings && editedAiSettings[0]['citations'] === true) {
          this.citations = editedAiSettings[0]['citations']
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges citations to use for test from editedAiSettings 1', this.citations)
        } else if (editedAiSettings && editedAiSettings[0]['citations'] === false) {
          this.citations = editedAiSettings[0]['citations']
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges citations to use for test from editedAiSettings 1', this.citations)
        } else if (editedAiSettings && editedAiSettings[0]['citations'] === null) {
          this.citations = this.selectedNamespace.preview_settings.citations;
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges citations to use for test from selectedNamespace ', this.citations)
        }

        if (editedAiSettings && editedAiSettings[0]['useHyde'] === true) {
          this.useHyde = editedAiSettings[0]['useHyde']
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges useHyde to use for test from editedAiSettings 1', this.useHyde)
        } else if (editedAiSettings && editedAiSettings[0]['useHyde'] === false) {
          this.useHyde = editedAiSettings[0]['useHyde']
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges useHyde to use for test from editedAiSettings 2', this.useHyde)
        } else if (editedAiSettings && editedAiSettings[0]['useHyde'] === null) {
          this.useHyde = this.selectedNamespace.preview_settings.use_hyde;
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges useHyde to use for test from selectedNamespace ', this.useHyde)
        }
      } else {
        this.logger.log('[MODAL-PREVIEW-KB] editedAiSettings are empty')
      }
    })

    // this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges current selectedModel', this.selectedModel)
  }



  // ngOnChanges(changes: SimpleChanges): void {
  //    this.logger.log('[MODAL-PREVIEW-KB] ngOnChanges namespace ', this.selectedNamespace)
  //   this.namespaceid = this.selectedNamespace.id;
  //    this.logger.log('[MODAL-PREVIEW-KB] ngOnChanges namespaceid ', this.namespaceid)
  // }

  // KB TAGS
  addsKbTag(kbTag) {
    if (kbTag && kbTag.trim() !== '') {
      const trimmedTag = kbTag.trim();
      // Verifica che il tag non sia già presente
      if (!this.kbTagsArray.includes(trimmedTag)) {
        this.kbTagsArray.push(trimmedTag);
        this.logger.log("[MODAL-PREVIEW-KB] addsKbTags kbTagsArray: ", this.kbTagsArray);
      }
      // Svuota l'input dopo aver aggiunto il tag
      this.kbTag = '';
    }
    // L'observer gestirà automaticamente l'aggiornamento dell'altezza
  }

  removeKbTag(kbTagName){
    const index =  this.kbTagsArray.findIndex((tag) => tag === kbTagName);
    this.logger.log("[MODAL-PREVIEW-KB] removeKbTags index: ", index);
    this.kbTagsArray.splice(index, 1)
    this.logger.log("[MMODAL-PREVIEW-KB] removeKbTags kbTagsArray: ", this.kbTagsArray);
    // L'observer gestirà automaticamente l'aggiornamento dell'altezza
  }

  submitQuestion() {
    if (!this.question || !this.question.trim()) {
      return;
    }
    this.body = {
      "question": this.question,
      "namespace": this.namespaceid,
      "model": this.selectedModel,
      "temperature": this.temperature,
      "alpha": this.alpha,
      "max_tokens": this.maxTokens,
      "top_k": this.topK,
      "chunks_only": this.chunkOnly,
      "reranking": this.reRanking,
      "reranking_multiplier": this.reRankingMultipler,
      "system_context": this.context,
      'advancedPrompt': this.advancedPrompt,
      'citations': this.citations,
      'use_hyde': this.useHyde,
      'llm': this.selectedNamespace.preview_settings.llm,
      'tags':this.kbTagsArray
    }
    // this.error_answer = false;

    // Salva la question solo se non è vuota
    if (this.question && this.question.trim() !== '') {
      this.localDbService.setInStorage(`last_question-${this.namespaceid}`, JSON.stringify(this.question))
      this.logger.log("[MODAL-PREVIEW-KB] Saved last question: ", this.question);
    }
    this.searching = true;
    this.kbStreamFinalized = false;
    this.show_answer = true;
    this.answer = '';
    this.qa = null;
    this.source_url = '';
    this.contentChunks = [];
    this.contentSources = [];
    this.responseTime = null;
    this.prompt_token_size = null;
    this.logger.log("[MODAL-PREVIEW-KB] ask gpt preview body: ", this.body);
    const startTime = performance.now();
    if (this.previewUseStream) {
      this.askAIStream(this.body, startTime);
    } else {
      this.askAI(this.body, startTime);
    }
  }

  askAI(body, startTime) {
    this.openaiService.askGpt(body).subscribe((response: any) => {

      this.logger.log("[MODAL-PREVIEW-KB] ask gpt preview response: ", response)
      response['ai_model'] = this.selectedModel
      this.prompt_token_size = response.prompt_token_size;
      this.logger.log("[MODAL-PREVIEW-KB] ask gpt preview prompt_token_size: ", this.prompt_token_size)
      const endTime = performance.now();
      // this.responseTime = Math.round((endTime - startTime) / 1000);
      this.responseTime = response.duration != null ? Math.round(response.duration * 100) / 100 : null;
      this.translateparam = { respTime: this.formatNumberUS(this.responseTime, true) };
      this.qa = response;
      this.logger.log("[MODAL-PREVIEW-KB] ask gpt preview qa: ", this.qa)
      this.logger.log("ask gpt preview this.qa?.content_chunks: ", this.qa?.content_chunks);
      this.logger.log("ask gpt preview this.qa?.chunks: ", this.qa?.chunks);
      if (this.qa?.content_chunks) {
        this.contentChunks = this.qa?.content_chunks 
      } else if (this.qa?.chunks)  {
        this.contentChunks = this.qa?.chunks
      }
     
      this.contentSources = this.extractAllSources(response);
      this.logger.log("ask gpt preview contentChunks: ", this.contentChunks);
      this.logger.log("ask gpt preview contentSources: ", this.contentSources);
      // this.logger.log("ask gpt preview response: ", response, startTime, endTime, this.responseTime);
      if (response.answer) {
        this.answer = response.answer;
      }

      if (response && response.source && this.isValidURL(response.source)) {
        this.source_url = response.source;
      }

      if (response.success == false) {
        // this.error_answer = true;
      } else {
        //this.answer = response.answer;
      }
      this.applyZeroMetricsWhenNoAnswer();
      this.show_answer = true;
      this.searching = false;
    }, (err) => {
      this.logger.log("ask gpt preview response error: ", err);
      
      // Gestione errori con error_message che contiene JSON (es. errori Anthropic API)
      if (err && err.error && err.error.error_message) {
        try {
          const errorMessage = err.error.error_message;
          this.logger.log("ask gpt preview error_message: ", errorMessage);
          
          // Cerca di estrarre il JSON dalla stringa (formato: BadRequestError("Error code: 400 - {...}"))
          const jsonMatch = errorMessage.match(/\{.*\}/);
          if (jsonMatch) {
            // Sostituisci le virgolette singole con doppie per rendere il JSON valido
            let jsonString = jsonMatch[0].replace(/'/g, '"');
            const parsedError = JSON.parse(jsonString);
            
            // Estrai il messaggio dall'oggetto error
            if (parsedError.error && parsedError.error.message) {
              this.answer = parsedError.error.message;
              this.logger.log("ask gpt preview extracted message: ", this.answer);
            } else if (parsedError.message) {
              this.answer = parsedError.message;
            } else {
              this.answer = errorMessage;
            }
          } else {
            // Se non c'è JSON, prova a estrarre il messaggio con regex
            const match = errorMessage.match(/'message':\s*'([^']+)'/);
            if (match) {
              this.answer = match[1];
            } else {
              this.answer = errorMessage;
            }
          }
        } catch (parseError) {
          this.logger.error("ask gpt preview error parsing error_message: ", parseError);
          // Fallback: usa il regex originale
          const match = err.error.error_message.match(/'message':\s*'([^']+)'/);
          this.answer = match ? match[1] : err.error.error_message;
        }
      } else if (err && err.error && err.error.error_code === 13001) {
        this.answer = this.translate.instant('KbPage.AiQuotaExceeded')
        this.aiQuotaExceeded = true
      } else if (err && err.error && err.error.message) {
        this.answer = err.error.message;
      } else if (err.error && err.error.error && err.error.error.answer) {
        this.answer = err.error.error.answer;
        if (err.error.error.error_message) {
          let errorString = err.error.error.error_message
          const match = errorString.match(/'message':\s*'([^']+)'/);
          const message = match ? match[1] : '';
          if (message) {
            this.answer = this.answer + ' (' + message + ')'
          }
        } else if (!err.error.error.error_message) {
          if (err.statusText) { 
            this.answer = this.answer + ' (' + err.statusText + ')'
          }
        }
      } else if (err && err.error && err.error.error) {
        this.answer = err.error.error
      } else if (err && err.message) {
        this.answer = err.message;
      } else {
        this.answer = 'An error occurred while processing your request.';
      }

      // this.logger.error("ERROR ask gpt err.message: ", err.message);
      // console.log("ERROR ask gpt err: ", err);
      // console.log("ERROR ask gpt err.error.error.error_message: ", err.error.error.error_message);
      // let errorString = err.error.error.error_message
      // // Estrai il messaggio dopo 'message': '
      // const match = errorString.match(/'message':\s*'([^']+)'/);
      // const message = match ? match[1] : '';
      // console.log("ERROR ask gpt message ",  message);

      // this.error_answer = true;
      this.responseTime = 0;
      this.prompt_token_size = 0;
      this.translateparam = { respTime: this.formatNumberUS(0, true) };
      this.show_answer = true;
      this.searching = false;
    }, () => {
      this.logger.log("ask gpt *COMPLETE*")
      this.searching = false;
      this.aiQuotaExceeded = false

      // Usa la funzione helper per controllare e parsare la question salvata
      this.checkStoredQuestion();
    })
  }

  /**
   * Gestisce la risposta a stream dal server: aggiorna this.answer man mano che arrivano i chunk.
   */
  askAIStream(body: any, startTime: number) {
    let lastResponse: any = null;
    this.openaiService.askGptStream(body).subscribe({
      next: (chunk: { text?: string; fullAnswer?: string; done?: boolean; response?: any }) => {
        if (chunk.fullAnswer !== undefined) {
          this.answer = chunk.fullAnswer;
          this.show_answer = true;
          this.cdr.detectChanges();
        } else if (chunk.text) {
          this.answer = (this.answer || '') + chunk.text;
          this.show_answer = true;
          this.cdr.detectChanges();
        }
        if (chunk.response) {
          lastResponse = chunk.response;
        }
        if (chunk.done) {
          this.finalizeStreamResponse(lastResponse, startTime);
        }
      },
      error: (err: any) => {
        this.kbStreamFinalized = true;
        this.searching = false;
        this.show_answer = true;
        this.handleAskAIError(err);
      },
      complete: () => {
        if (!this.kbStreamFinalized) {
          this.finalizeStreamResponse(lastResponse, startTime);
        }
      }
    });
  }

   private finalizeStreamResponse(response: any, _startTime: number) {
    if (this.kbStreamFinalized) {
      return;
    }
    this.kbStreamFinalized = true;
    if (response) {
      response['ai_model'] = this.selectedModel;
      this.prompt_token_size = response.prompt_token_size;
      this.responseTime = response.duration != null ? Math.round(response.duration * 100) / 100 : null;
      this.translateparam = { respTime: this.formatNumberUS(this.responseTime, true) };
      this.qa = response;
      this.contentChunks = this.qa?.content_chunks ?? [];
      this.contentSources = this.extractAllSources(response);
      this.logger.log('[MODAL-PREVIEW-KB] ask gpt preview contentChunks: ', this.contentChunks);
      this.logger.log('[MODAL-PREVIEW-KB] ask gpt preview contentSources: ', this.contentSources);
      if (response.source && this.isValidURL(response.source)) this.source_url = response.source;
      if (response.answer != null && String(response.answer).trim().length) {
        this.answer = response.answer;
      }
    } else {
      this.qa = {
        answer: '',
        ai_model: this.selectedModel,
        content_chunks: [],
      };
      this.contentChunks = [];
      this.contentSources = [];
    }
    this.show_answer = true;
    this.searching = false;
    this.aiQuotaExceeded = false;
    this.applyZeroMetricsWhenNoAnswer();
    this.logger.log('ask gpt *COMPLETE*');
    this.checkStoredQuestion();
    this.cdr.detectChanges();
    this.logger.log('[MODAL-PREVIEW-KB] askAIStream completed', { qa: this.qa, answerLength: this.answer?.length });
  }

  private handleAskAIError(err: any) {
    this.logger.log('ask gpt preview response error: ', err);
    if (err?.error && typeof err.error === 'string') {
      this.answer = err.error;
    } else if (err && err.error && err.error.error_message) {
      try {
        const errorMessage = err.error.error_message;
        const jsonMatch = errorMessage.match(/\{.*\}/);
        if (jsonMatch) {
          let jsonString = jsonMatch[0].replace(/'/g, '"');
          const parsedError = JSON.parse(jsonString);
          if (parsedError.error?.message) this.answer = parsedError.error.message;
          else if (parsedError.message) this.answer = parsedError.message;
          else this.answer = errorMessage;
        } else {
          const match = errorMessage.match(/'message':\s*'([^']+)'/);
          this.answer = match ? match[1] : errorMessage;
        }
      } catch {
        const match = err.error?.error_message?.match(/'message':\s*'([^']+)'/);
        this.answer = match ? match[1] : err.error?.error_message;
      }
    } else if (err?.error?.error_code === 13001) {
      this.answer = this.translate.instant('KbPage.AiQuotaExceeded');
      this.aiQuotaExceeded = true;
    } else if (err?.error?.message) {
      this.answer = err.error.message;
    } else if (err?.error?.error?.answer) {
      this.answer = err.error.error.answer;
      const msg = err.error.error.error_message?.match(/'message':\s*'([^']+)'/)?.[1];
      if (msg) this.answer = this.answer + ' (' + msg + ')';
    } else if (err?.error?.error) {
      this.answer = err.error.error;
    } else if (err?.message) {
      this.answer = err.message;
    } else {
      this.answer = 'An error occurred while processing your request.';
    }
    this.responseTime = 0;
    this.prompt_token_size = 0;
    this.translateparam = { respTime: this.formatNumberUS(0, true) };
    this.cdr.detectChanges();
  }

  private isValidURL(url) {
    var urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
    return urlPattern.test(url);
  }

    /** Formatta numero in US: virgola migliaia, punto decimali */
  private formatNumberUS(value: number | null | undefined, decimals = false): string {
    if (value == null) return '';
    return decimals
      ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : value.toLocaleString('en-US');
  }

  get formattedPromptTokenSize(): string {
    return this.formatNumberUS(this.prompt_token_size);
  }

  /** Stessa logica di KbPage.NoAnswerFound: tempi e token a 0 se non c'è risposta. */
  private applyZeroMetricsWhenNoAnswer(): void {
    if (
      this.qa &&
      (!this.answer || this.answer === '') &&
      (!this.qa.answer || this.qa.answer === '')
    ) {
      this.responseTime = 0;
      this.prompt_token_size = 0;
      this.translateparam = { respTime: this.formatNumberUS(0, true) };
    }
  }

  /**
   * Estrae tutte le fonti da response.sources (array) o response.source (stringa).
   * Supporta items come stringa o oggetto con .url, .href, .source.
   */
  private extractAllSources(response: any): { value: string; isUrl: boolean }[] {
    const out: { value: string; isUrl: boolean }[] = [];
    if (!response) return out;
    if (response.sources && Array.isArray(response.sources)) {
      for (const item of response.sources) {
        const value = typeof item === 'string' ? item : String(item?.url ?? item?.href ?? item?.source ?? item ?? '');
        if (value && value.trim()) {
          out.push({ value: value.trim(), isUrl: this.isValidURL(value.trim()) });
        }
      }
    } else if (response.source != null) {
      const value = typeof response.source === 'string' ? response.source : String(response.source);
      if (value && value.trim()) {
        out.push({ value: value.trim(), isUrl: this.isValidURL(value.trim()) });
      }
    }
    return out;
  }

  onTextareaInput(textarea: HTMLTextAreaElement): void { 
    // console.log('[MODAL-PREVIEW-KB] textarea', textarea ) 
    const minHeight = 37;
    const maxHeight = 132;

    // Reset per ricalcolare correttamente lo scrollHeight
    textarea.style.height = minHeight + 'px';

    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = newHeight + 'px';

    textarea.style.overflowY =
    textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }

  onEnterKeyDown(event: KeyboardEvent) {
    // Submit on Enter (without Shift), otherwise allow new line
    if (event.key === 'Enter' && !event.shiftKey) {
      if (!this.question?.trim()) {
        return;
      }
      event.preventDefault();
      this.submitQuestion();
    }
  }


  onInputPreviewChange() {
    let element = document.getElementById('enter-button')
    if (this.question !== "") {
      element.style.display = 'inline-block';
    } else {
      element.style.display = 'none';
    }
  }

  onCloseBaseModal() {
    this.logger.log('onCloseBaseModal')
    this.question = "";
    this.answer = "";
    this.source_url = null;
    this.contentChunks = [];
    this.contentSources = [];
    this.searching = false;
    this.show_answer = false;
    // let element = document.getElementById('enter-button')
    // element.style.display = 'none';

    this.dialogRef.close();
    if (this.dialogRefAiSettings) {
      this.aiSettingsObject[0].maxTokens = this.maxTokens;
      this.kbService.hasChagedAiSettings(this.aiSettingsObject)
      this.dialogRefAiSettings.close()
    }
  }

  closeDialogAiSettings(isopenasetting) {
    this.logger.log(`[MODAL-PREVIEW-KB] closeDialogAiSettings isopenasetting:`, isopenasetting);
    this.aiSettingsObject[0].maxTokens = this.maxTokens;
    this.kbService.hasChagedAiSettings(this.aiSettingsObject)
    this.dialogRefAiSettings.close()
  }

  // No more used
  closePreviewKBAndOpenSettingsModal() {
    // this.question = "";
    // this.answer = "";
    // this.source_url = null;
    // this.searching = false;
    // // this.error_answer = false;
    // this.show_answer = false;
    // let element = document.getElementById('enter-button')
    // element.style.display = 'none';
    this.dialogRef.close({ action: 'open-settings-modal', data: this.body });
  }
  
  /**
   * Inizializza l'observer per monitorare i cambiamenti nel container delle tag
   * L'observer viene creato una sola volta in ngAfterViewInit
   */
  private initTagContainerObserver() {
    if (!this.kbTagsContainer) return;

    // Calcola l'altezza iniziale
    this.updateTagContainerHeight();

    // Crea l'observer solo se non esiste già
    if (!this.observer) {
      this.observer = new MutationObserver(() => {
        this.updateTagContainerHeight();
      });

      this.observer.observe(this.kbTagsContainer.nativeElement, {
        childList: true, // osserva aggiunte/rimozioni di elementi
        subtree: false
      });
    }
  }

  


  /**
   * Aggiorna l'altezza del container delle tag
   * Rimuove temporaneamente l'altezza forzata per misurare correttamente l'altezza naturale
   */
  private updateTagContainerHeight() {
    if (!this.kbTagsContainer) return;

    // Se non ci sono tag, mantieni un'altezza minima fissa
    if (this.kbTagsArray.length === 0) {
      this.tagContainerElementHeight = '20px';
      return;
    }

    const element = this.kbTagsContainer.nativeElement as HTMLElement;
    
    // Salva l'altezza corrente se presente
    const currentHeight = element.style.height;
    
    // Rimuovi temporaneamente l'altezza forzata per misurare l'altezza naturale del contenuto
    element.style.height = 'auto';
    
    // Forza il reflow per assicurarsi che il browser calcoli l'altezza naturale
    void element.offsetHeight;
    
    // Misura l'altezza naturale del contenuto
    const naturalHeight = element.offsetHeight;
    
    // Ripristina l'altezza forzata (verrà aggiornata subito dopo)
    element.style.height = currentHeight;
    
    // Usa solo l'altezza naturale del contenuto
    this.tagContainerElementHeight = naturalHeight + 'px';
  }

 

 goToKbTagsDoc() {
    const docsUrl = URL_kb_contents_tags;
    window.open(docsUrl, '_blank');
  }

}
