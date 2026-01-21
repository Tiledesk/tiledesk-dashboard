import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges, Inject, ElementRef, ViewChild } from '@angular/core';
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


@Component({
  selector: 'modal-preview-knowledge-base',
  templateUrl: './modal-preview-knowledge-base.component.html',
  styleUrls: ['./modal-preview-knowledge-base.component.scss']
})

export class ModalPreviewKnowledgeBaseComponent extends PricingBaseComponent implements OnInit {
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
    chunkOnly: null,
    reRanking: null,
    reRankingMultipler: null,
  }]
  panelOpenState = false; 
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
  answer: string = "";
  source_url: any;
  responseTime: number = 0;

  searching: boolean = false;
  show_answer: boolean = false;
  // error_answer: boolean = false;
  translateparam: any;
  body: any;
  storedQuestionNoDoubleQuote: string;
  aiQuotaExceeded: boolean = false;
  prompt_token_size: number;
  public chunkOnly: boolean;
  public reRanking: boolean;
  public reRankingMultipler: number
  public citations: boolean // = false;
  public advancedPrompt: boolean // = false;
  contentChunks: string[] = [];

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
    private router: Router
  ) {
    super(prjctPlanService, notify);
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
      console.log('[MODAL-PREVIEW-KB] this.selectedNamespace.preview_settings ', this.selectedNamespace.preview_settings)

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

      this.logger.log('[MODAL-PREVIEW-KB] selectedNamespace', this.selectedNamespace)
      this.logger.log('[MODAL-PREVIEW-KB] selectedNamespace preview_settings', this.selectedNamespace.preview_settings)
      this.logger.log('[MODAL-PREVIEW-KB] namespaceid', this.namespaceid)
      this.logger.log('[MODAL-PREVIEW-KB] selectedModel', this.selectedModel)
    }
    if (data && data.askBody) {
      this.logger.log('[MODAL-PREVIEW-KB] askBody', data.askBody)
      // this.question = data.askBody.question
      // this.submitQuestion()
    }
    this.listenToCurrentURL()
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

  ngOnInit(): void {
    this.listenPreviewKbHasBeenCloseBackdropClicking()
    this.listenToAiSettingsChanges()
    const storedQuestion = this.localDbService.getFromStorage(`last_question-${this.namespaceid}`)
    if (storedQuestion) {
      this.hasStoredQuestion = true;
      this.logger.log("[MODAL-PREVIEW-KB] reuseLastQuestion hasStoredQuestion: ", this.hasStoredQuestion);
      this.logger.log("[MODAL-PREVIEW-KB] reuseLastQuestion storedQuestion: ", storedQuestion);
      this.storedQuestionNoDoubleQuote = storedQuestion.substring(1, storedQuestion.length - 1)

    } else {
      this.hasStoredQuestion = false;
      this.logger.log("[MODAL-PREVIEW-KB] reuseLastQuestion hasStoredQuestion: ", this.hasStoredQuestion);
    }
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
      width: '300px',
      position: { left: 'calc(50% + 215px)', top: '138px' },
      hasBackdrop: false,
      autoFocus: false,
      data: {
        selectedNamespace: this.selectedNamespace,
        calledBy: "modal-preview-kb"

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
    // console.log("[MODAL-PREVIEW-KB] reuseLastQuestion textarea: ", textarea);
    setTimeout(() => {
      this.onTextareaInput(textarea);
    }, 0);

    const storedQuestion = this.localDbService.getFromStorage(`last_question-${this.namespaceid}`)
    if (storedQuestion) {
      this.hasStoredQuestion = true;
      this.logger.log("[MODAL-PREVIEW-KB] reuseLastQuestion hasStoredQuestion: ", this.hasStoredQuestion);
      this.logger.log("[MODAL-PREVIEW-KB] reuseLastQuestion storedQuestion: ", storedQuestion);
      this.storedQuestionNoDoubleQuote = storedQuestion.substring(1, storedQuestion.length - 1)

    } else {
      this.hasStoredQuestion = false;
      this.logger.log("[MODAL-PREVIEW-KB] reuseLastQuestion hasStoredQuestion: ", this.hasStoredQuestion);
    }
    this.question = this.storedQuestionNoDoubleQuote;
  
   // this.onInputPreviewChange()
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
        if (editedAiSettings && editedAiSettings[0]['maxTokens']) {
          this.maxTokens = editedAiSettings[0]['maxTokens']
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

        if (editedAiSettings && editedAiSettings[0]['reRankingMultipler']) {
          this.reRankingMultipler = editedAiSettings[0]['reRankingMultipler']
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges reRankingMultipler to use for test from editedAiSettings 1', this.reRankingMultipler)
        } else {
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges reRankingMultipler to use for test from editedAiSettings 2', editedAiSettings[0]['reRankingMultipler'])
          this.reRankingMultipler = this.selectedNamespace.preview_settings.reranking_multiplier
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges reRankingMultipler to use for test from selectedNamespace ', this.reRankingMultipler)
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
          console.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges chunkOnly to use for test from editedAiSettings 1', this.chunkOnly)
        } else if (editedAiSettings && editedAiSettings[0]['chunkOnly'] === false) {
          this.chunkOnly = editedAiSettings[0]['chunkOnly']
          console.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges chunkOnly to use for test from editedAiSettings 2', this.chunkOnly)
        } else if ((editedAiSettings && editedAiSettings[0]['chunkOnly'] === null)) {
          this.chunkOnly = this.selectedNamespace.preview_settings.chunks_only
          console.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges chunkOnly to use for test from selectedNamespace ', this.chunkOnly , ' this.selectedNamespace.preview_settings' ,this.selectedNamespace.preview_settings )
        }

        if (editedAiSettings && editedAiSettings[0]['reRanking'] === true) {
          this.reRanking = editedAiSettings[0]['reRanking']
          console.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges reRanking to use for test from editedAiSettings 1', this.reRanking)
        } else if (editedAiSettings && editedAiSettings[0]['reRanking'] === false) {
          this.reRanking = editedAiSettings[0]['reRanking']
          console.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges reRanking to use for test from editedAiSettings 2', this.reRanking)
        } else if ((editedAiSettings && editedAiSettings[0]['reRanking'] === null)) {
          this.reRanking = this.selectedNamespace.preview_settings.reranking
          console.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges reRanking to use for test from selectedNamespace ', this.reRanking , ' this.selectedNamespace.preview_settings' ,this.selectedNamespace.preview_settings )
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

  submitQuestion() {
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
      "reranking_multiplier":  this.reRankingMultipler,
      "system_context": this.context,
      'advancedPrompt': this.advancedPrompt,
      'citations': this.citations,
      'llm': this.selectedNamespace.preview_settings.llm
    }
    // this.error_answer = false;

    this.localDbService.setInStorage(`last_question-${this.namespaceid}`, JSON.stringify(this.question))
    this.searching = true;
    this.show_answer = false;
    this.answer = '';
    this.source_url = '';
    this.logger.log("[MODAL-PREVIEW-KB] ask gpt preview body: ", this.body);
    const startTime = performance.now();
    this.askAI(this.body, startTime)

   
  }

  askAI(body, startTime) {
    this.openaiService.askGpt(body).subscribe((response: any) => {

      this.logger.log("[MODAL-PREVIEW-KB] ask gpt preview response: ", response)
      response['ai_model'] = this.selectedModel
      this.prompt_token_size = response.prompt_token_size;
      this.logger.log("[MODAL-PREVIEW-KB] ask gpt preview prompt_token_size: ", this.prompt_token_size)
      const endTime = performance.now();
      // this.responseTime = Math.round((endTime - startTime) / 1000);
      this.responseTime = response.duration
      this.translateparam = { respTime: this.responseTime };
      this.qa = response;
      this.logger.log("[MODAL-PREVIEW-KB] ask gpt preview qa: ", this.qa)
      // this.contentChunks = this.qa?.content_chunks
      if (this.qa?.content_chunks) {
        this.contentChunks = this.qa?.content_chunks 
      } else if (this.qa?.chunks)  {
        this.contentChunks = this.qa?.chunks
      }
   
      this.logger.log("ask gpt preview contentChunks: ", this.contentChunks);
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
      this.show_answer = true;
      this.searching = false;
    }, (err) => {
      console.log("ask gpt preview response error: ", err);
      // this.logger.log("ask gpt preview response error message: ", error.message);
      // this.logger.log("ask gpt preview response error error: ", error.error);
      if (err && err.error && err.error.error_code === 13001) {
        this.answer = this.translate.instant('KbPage.AiQuotaExceeded')
        this.aiQuotaExceeded = true
      } else if (err && err.error && err.error.message) {
        this.answer = err.error.message;
      } else if (err.error && err.error.error && err.error.error.answer) {
        this.answer = err.error.error.answer;
        // && err.headers.statusText
        // if (err.statusText) {
        if (err.error.error.error_message) {
          let errorString = err.error.error.error_message
          const match = errorString.match(/'message':\s*'([^']+)'/);
          const message = match ? match[1] : 'Error';
          this.logger.log("ask gpt preview  error h1 err.headers ", err.statusText);
          // this.answer = this.answer + ' (' + err.statusText + ')'
          this.answer = this.answer + ' (' + message + ')'
        } else if (!err.error.error.error_message) {
          if (err.statusText) { 
            this.answer = this.answer + ' (' + err.statusText + ')'
          }
        }
        
       // if (err.statusText) {
       //   this.logger.log("ask gpt preview  error h1 err.headers ", err.statusText);
       //   this.answer = this.answer + ' (' + err.statusText + ')'
       // }
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
      this.show_answer = true;
      this.searching = false;
    }, () => {
      this.logger.log("ask gpt *COMPLETE*")
      this.searching = false;
      this.aiQuotaExceeded = false

      const storedQuestion = this.localDbService.getFromStorage(`last_question-${this.namespaceid}`)
      if (storedQuestion) {
        this.hasStoredQuestion = true;
        this.logger.log("[MODAL-PREVIEW-KB] reuseLastQuestion hasStoredQuestion: ", this.hasStoredQuestion);
        this.logger.log("[MODAL-PREVIEW-KB] reuseLastQuestion storedQuestion: ", storedQuestion);
        this.storedQuestionNoDoubleQuote = storedQuestion.substring(1, storedQuestion.length - 1)

      } else {
        this.hasStoredQuestion = false;
        this.logger.log("[MODAL-PREVIEW-KB] reuseLastQuestion hasStoredQuestion: ", this.hasStoredQuestion);
      }
    })
  }

  private isValidURL(url) {
    var urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
    return urlPattern.test(url);
  }

  onTextareaInput(textarea: HTMLTextAreaElement): void { 
    // console.log('[MODAL-PREVIEW-KB] textarea', textarea ) 
    const minHeight = 37;
    const maxHeight = 52;

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
    this.searching = false;
    this.show_answer = false;
   // let element = document.getElementById('enter-button')
   // element.style.display = 'none';

    this.dialogRef.close();
    if (this.dialogRefAiSettings) {
      this.kbService.hasChagedAiSettings(this.aiSettingsObject)
      this.dialogRefAiSettings.close()
    }
  }

  closeDialogAiSettings(isopenasetting) {
    this.logger.log(`[MODAL-PREVIEW-KB] closeDialogAiSettings isopenasetting:`, isopenasetting);
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



}


