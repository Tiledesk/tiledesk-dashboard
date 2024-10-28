import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges, Inject } from '@angular/core';
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


@Component({
  selector: 'modal-preview-knowledge-base',
  templateUrl: './modal-preview-knowledge-base.component.html',
  styleUrls: ['./modal-preview-knowledge-base.component.scss']
})

export class ModalPreviewKnowledgeBaseComponent extends PricingBaseComponent implements OnInit {
  // @Input() selectedNamespace: any;
  @Output() deleteKnowledgeBase = new EventEmitter();
  @Output() closeBaseModal = new EventEmitter();

  selectedNamespace: any;
  namespaceid: string;
  selectedModel: string;
  maxTokens: number;
  temperature: number;
  topK: number;
  context: string;
  isopenasetting: boolean;
  hasStoredQuestion: boolean;
  private dialogRefAiSettings: MatDialogRef<any>;

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
  prompt_token_size: number
  public citations: boolean // = false;
  public advancedPrompt: boolean // = false;


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
  ) {
    super(prjctPlanService, notify);
    this.logger.log('[MODAL-PREVIEW-KB] data ', data)
    if (data && data.selectedNamespace) {
      this.selectedNamespace = data.selectedNamespace;
      this.namespaceid = this.selectedNamespace.id;
      this.selectedModel = this.selectedNamespace.preview_settings.model;
      this.maxTokens = this.selectedNamespace.preview_settings.max_tokens;
      this.temperature = this.selectedNamespace.preview_settings.temperature;
      this.topK = this.selectedNamespace.preview_settings.top_k;
      this.context = this.selectedNamespace.preview_settings.context;

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
      this.logger.log('[MODAL-PREVIEW-KB] namespaceid', this.namespaceid)
      this.logger.log('[MODAL-PREVIEW-KB] selectedModel', this.selectedModel)
    }
    if (data && data.askBody) {
      // console.log('[MODAL-PREVIEW-KB] askBody', data.askBody)
      // this.question = data.askBody.question
      // this.submitQuestion()
    }
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
    this.logger.log('[MODAL-PREVIEW-KB] presentDialogAiSettings topK to use for test', this.topK)
    this.logger.log('[MODAL-PREVIEW-KB] presentDialogAiSettings context to use for test', this.context)



    this.isopenasetting = isopenasetting
    this.dialogRefAiSettings = this.dialog.open(ModalPreviewSettingsComponent, {
      width: '300px',
      position: { left: 'calc(50% + 215px)', top: '138px' },
      hasBackdrop: false,
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


  closeDialogAiSettings(isopenasetting) {
    this.logger.log(`[MODAL-PREVIEW-KB] closeDialogAiSettings isopenasetting:`, isopenasetting);
    this.dialogRefAiSettings.close()
  }

  reuseLastQuestion() {
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
    // this.submitQuestion()
    this.onInputPreviewChange()
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
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges selectedModel to use for test', this.selectedModel)
        }
        if (editedAiSettings && editedAiSettings[0]['maxTokens']) {
          this.maxTokens = editedAiSettings[0]['maxTokens']
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges maxTokens to use for test', this.maxTokens)
        }
        if (editedAiSettings && editedAiSettings[0]['temperature']) {
          this.temperature = editedAiSettings[0]['temperature']
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges temperature to use for test', this.temperature)
        }
        if (editedAiSettings && editedAiSettings[0]['top_k']) {
          this.topK = editedAiSettings[0]['top_k']
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges topK to use for test', this.topK)
        }
        if (editedAiSettings && editedAiSettings[0]['context']) {
          this.context = editedAiSettings[0]['context']
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges context to use for test', this.context)
        }

        if (editedAiSettings && editedAiSettings[0]['advancedPrompt'] === true)  {
          this.advancedPrompt = editedAiSettings[0]['advancedPrompt']
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges advancedPrompt to use for test',  this.advancedPrompt)
        } else if (editedAiSettings && editedAiSettings[0]['advancedPrompt'] === false) {
          this.advancedPrompt = editedAiSettings[0]['advancedPrompt']
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges advancedPrompt to use for test',  this.advancedPrompt)
        }

        if (editedAiSettings && editedAiSettings[0]['citations'] === true)  {
          this.citations =  editedAiSettings[0]['citations']
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges citations to use for test', this.citations)
        } else if (editedAiSettings && editedAiSettings[0]['citations'] === false){
          this.citations =  editedAiSettings[0]['citations']
          this.logger.log('[MODAL-PREVIEW-KB] listenToAiSettingsChanges citations to use for test', this.citations)
        }
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
      "max_tokens": this.maxTokens,
      "top_k": this.topK,
      "system_context": this.context,
      'advancedPrompt': this.advancedPrompt,
      'citations': this.citations

    }
    // this.error_answer = false;

    this.localDbService.setInStorage(`last_question-${this.namespaceid}`, JSON.stringify(this.question))
    this.searching = true;
    this.show_answer = false;
    this.answer = '';
    this.source_url = '';
    this.logger.log("[MODAL-PREVIEW-KB] ask gpt preview body: ", this.body);
    const startTime = performance.now();
    this.openaiService.askGpt(this.body).subscribe((response: any) => {

      this.logger.log("[MODAL-PREVIEW-KB] ask gpt preview response: ", response)
      response['ai_model'] = this.selectedModel
      this.prompt_token_size = response.prompt_token_size;
      this.logger.log("[MODAL-PREVIEW-KB] ask gpt preview prompt_token_size: ", this.prompt_token_size)
      const endTime = performance.now();
      this.responseTime = Math.round((endTime - startTime) / 1000); 
      this.translateparam = { respTime: this.responseTime };
      this.qa = response;
      this.logger.log("[MODAL-PREVIEW-KB] ask gpt preview qa: ", this.qa)
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
      this.logger.log("ask gpt preview response error: ", err);
      // this.logger.log("ask gpt preview response error message: ", error.message);
      // this.logger.log("ask gpt preview response error error: ", error.error);
      if (err && err.error && err.error.error_code === 13001) {
        this.answer = this.translate.instant('KbPage.AiQuotaExceeded')
        this.aiQuotaExceeded = true
      } else if (err && err.error && err.error.message) {
        this.answer = err.error.message;
      } else if (err.error && err.error.error && err.error.error.answer)  {
        this.answer = err.error.error.answer;
        // && err.headers.statusText
        if (err.statusText) {
          this.logger.log("ask gpt preview  error h1 err.headers ", err.statusText);
          this.answer = this.answer + ' (' + err.statusText + ')'
        }
      }

      this.logger.error("ERROR ask gpt: ", err.message);

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


  onInputPreviewChange() {
    let element = document.getElementById('enter-button')
    if (this.question !== "") {
      element.style.display = 'inline-block';
    } else {
      element.style.display = 'none';
    }
  }

  onCloseBaseModal() {
    this.question = "";
    this.answer = "";
    this.source_url = null;
    this.searching = false;
    // this.error_answer = false;
    this.show_answer = false;
    let element = document.getElementById('enter-button')
    element.style.display = 'none';
    // this.closeBaseModal.emit();
    this.dialogRef.close();
    if (this.dialogRefAiSettings) { 
      this.dialogRefAiSettings.close()
    }
  }

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
