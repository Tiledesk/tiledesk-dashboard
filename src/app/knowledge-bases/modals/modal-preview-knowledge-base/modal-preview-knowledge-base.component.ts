import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { KB } from 'app/models/kbsettings-model';
import { LoggerService } from 'app/services/logger/logger.service';
import { OpenaiService } from 'app/services/openai.service';

@Component({
  selector: 'modal-preview-knowledge-base',
  templateUrl: './modal-preview-knowledge-base.component.html',
  styleUrls: ['./modal-preview-knowledge-base.component.scss']
})

export class ModalPreviewKnowledgeBaseComponent implements OnInit {
  @Input() namespace: string;
  @Output() deleteKnowledgeBase = new EventEmitter();
  @Output() closeBaseModal = new EventEmitter();

  models_list = [
    { name: "GPT-3.5 Turbo (ChatGPT)", value: "gpt-3.5-turbo" }, 
    { name: "GPT-4 (ChatGPT)", value: "gpt-4" }
  ];
  selectedModel: any = this.models_list[1].value;

  qa: any;

  question: string = "";
  answer: string = "";
  source_url: any;
  responseTime: number = 0;

  searching: boolean = false;
  show_answer: boolean = false;
  // error_answer: boolean = false;
  translateparam: any;

  constructor(
    private logger: LoggerService,
    private openaiService: OpenaiService
  ) { }

  ngOnInit(): void {
  }

  submitQuestion(){
    let data = {
      "question": this.question,
      "namespace": this.namespace,
      "model": this.selectedModel
    }
    // this.error_answer = false;
    this.searching = true;
    this.show_answer = false;
    this.answer = '';
    this.source_url = '';
    // console.log("ask gpt preview response: ", data);
    const startTime = performance.now();
    this.openaiService.askGpt(data).subscribe((response: any) => {
      const endTime = performance.now();
      this.responseTime =  Math.round((endTime - startTime)/1000);
      this.translateparam = { respTime: this.responseTime };
      this.qa = response;
      // console.log("ask gpt preview response: ", response, startTime, endTime, this.responseTime);
      if(response.answer)this.answer = response.answer;
      if(response.source && this.isValidURL(response.source)){
        this.source_url = response.source;
      }

      if (response.success == false ) {
        // this.error_answer = true;
      } else {
        //this.answer = response.answer;
      }
      this.show_answer = true;
      this.searching = false;
    }, (error) => {
      this.logger.log("ask gpt preview response error: ", error.message);
      this.logger.error("ERROR ask gpt: ", error.message);
      this.answer = error.message;
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
    this.closeBaseModal.emit();
  }

}
