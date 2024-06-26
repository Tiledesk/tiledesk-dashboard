import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges, Inject } from '@angular/core';
import { KB } from 'app/models/kbsettings-model';
import { LoggerService } from 'app/services/logger/logger.service';
import { OpenaiService } from 'app/services/openai.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'modal-preview-knowledge-base',
  templateUrl: './modal-preview-knowledge-base.component.html',
  styleUrls: ['./modal-preview-knowledge-base.component.scss']
})

export class ModalPreviewKnowledgeBaseComponent implements OnInit {
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


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalPreviewKnowledgeBaseComponent>,
    private logger: LoggerService,
    private openaiService: OpenaiService,
    private translate: TranslateService,
  ) {
    this.logger.log('[MODAL-PREVIEW-KB] data ', data)
    if (data && data.selectedNaspace) {
      this.selectedNamespace = data.selectedNaspace;
      this.namespaceid = this.selectedNamespace.id;
      this.selectedModel = this.selectedNamespace.preview_settings.model;
      this.maxTokens = this.selectedNamespace.preview_settings.max_tokens;
      this.temperature = this.selectedNamespace.preview_settings.temperature;
      this.topK = this.selectedNamespace.preview_settings.top_k;
      this.context = this.selectedNamespace.preview_settings.context

      this.logger.log('[MODAL-PREVIEW-KB] selectedNamespace', this.selectedNamespace)
      this.logger.log('[MODAL-PREVIEW-KB] namespaceid', this.namespaceid)
      this.logger.log('[MODAL-PREVIEW-KB] selectedModel', this.selectedModel)
    }
    if (data && data.askBody) {
      this.logger.log('[MODAL-PREVIEW-KB] askBody', data.askBody)
      this.question = data.askBody.question
      this.submitQuestion()
    }
  }

  ngOnInit(): void {
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
      "system_context": this.context
    }
    // this.error_answer = false;
    this.searching = true;
    this.show_answer = false;
    this.answer = '';
    this.source_url = '';
    this.logger.log("[MODAL-PREVIEW-KB] ask gpt preview body: ", this.body);
    const startTime = performance.now();
    this.openaiService.askGpt(this.body).subscribe((response: any) => {
      
      // this.logger.log("[MODAL-PREVIEW-KB] ask gpt preview response: ", response)
      const endTime = performance.now();
      this.responseTime = Math.round((endTime - startTime) / 1000);
      this.translateparam = { respTime: this.responseTime };
      this.qa = response;
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
      // this.logger.log("ask gpt preview response error: ", err);
      // this.logger.log("ask gpt preview response error message: ", error.message);
      // this.logger.log("ask gpt preview response error error: ", error.error);
      if (err && err.error && err.error.error_code === 13001) {
        this.answer = this.translate.instant('KbPage.AiQuotaExceeded')
      } else {
        this.answer = err.error.message;
      }

      this.logger.error("ERROR ask gpt: ", err.message);

      // this.error_answer = true;
      this.show_answer = true;
      this.searching = false;
    }, () => {
      this.logger.log("ask gpt *COMPLETE*")
      this.searching = false;
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
    this.dialogRef.close({action: 'open-settings-modal', data: this.body});
  }

}
