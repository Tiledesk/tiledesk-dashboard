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

  qa: any;

  question: string = "";
  answer: string = "";
  source_url: any;

  searching: boolean = false;
  show_answer: boolean = false;
  error_answer: boolean = false;

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
      "model": "gpt-3.5-turbo"
    }
    this.error_answer = false;
    this.searching = true;
    this.show_answer = false;
    this.answer = null;
    this.source_url = null;
    this.openaiService.askGpt(data).subscribe((response: any) => {
      console.log("ask gpt preview response: ", response);
      this.qa = response;
      if (response.success == false) {
        this.error_answer = true;
      } else {
        this.answer = response.answer;
        if(this.isValidURL(response.source)){
          this.source_url = response.source;
        }
      }
      this.show_answer = true;
      this.searching = false;
      setTimeout(() => {
        let element = document.getElementById("answer");
        element.classList.add('answer-active');
      }, (200));
    }, (error) => {
      this.logger.error("ERROR ask gpt: ", error);
      this.error_answer = true;
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
    this.error_answer = false;
    this.show_answer = false;
    let element = document.getElementById('enter-button')
    element.style.display = 'none';
    this.closeBaseModal.emit();
  }

}
