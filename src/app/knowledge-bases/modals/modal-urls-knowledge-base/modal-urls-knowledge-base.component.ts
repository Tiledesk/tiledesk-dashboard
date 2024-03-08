import { Component, OnInit, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KB_LIMIT_CONTENT } from 'app/utils/util';

@Component({
  selector: 'modal-urls-knowledge-base',
  templateUrl: './modal-urls-knowledge-base.component.html',
  styleUrls: ['./modal-urls-knowledge-base.component.scss']
})
export class ModalUrlsKnowledgeBaseComponent implements OnInit {

  @Output() saveKnowledgeBase = new EventEmitter();
  @Output() closeBaseModal = new EventEmitter();

  KB_LIMIT_CONTENT = KB_LIMIT_CONTENT;
  kbForm: FormGroup;
  buttonDisabled: boolean = true;
  list = [];
  content: string;
  countSitemap: number;
  errorLimit: boolean = false;
  // kb: KB = {
  //   _id: null,
  //   type: '',
  //   name: '',
  //   url: '',
  //   content: ''
  // }
  constructor(
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.kbForm = this.createConditionGroup();
  }

  ngOnChanges(changes: SimpleChanges){
    // console.log('ModalSiteMapComponent changes: ', changes);
    // if(this.listSitesOfSitemap.length > 0){
    //   this.listOfUrls = this.listSitesOfSitemap.join('\n');
    //   this.countSitemap = this.listSitesOfSitemap.length;
    // } 
  }

  createConditionGroup(): FormGroup {
    // const contentPattern = /^[^&<>]{3,}$/;
    // const namePattern = /^[^&<>]{3,}$/;
    return this.formBuilder.group({
      content: ['', [Validators.required]],
      // name: ['', [Validators.required, Validators.pattern(namePattern)]]
    })
  }


  onChangeInput(event): void {
    // if (this.kbForm.valid) {
    //   this.buttonDisabled = false;
    // } else {
    //   this.buttonDisabled = true;
    // }
    
    let listSitesOfSitemap = this.content.split("\n").filter(function(row) {
      return row.trim() !== '';
    });

    var lines = this.content.split('\n');
    
    if (lines.length > KB_LIMIT_CONTENT) {
      this.errorLimit = true;
      this.buttonDisabled = true;
      // content = lines.slice(0, KB_LIMIT_CONTENT).join('\n');
    } else {
      this.errorLimit = false;
      this.buttonDisabled = false;
    }
    this.countSitemap = listSitesOfSitemap.length;
  }

  onSaveKnowledgeBase(){
    //const arrayURLS = this.content.split('\n');
    const arrayURLS = this.content.split("\n").filter(function(row) {
      return row.trim() !== '';
    });
    let body = {
      'list': arrayURLS
    }
    this.saveKnowledgeBase.emit(body);
  }

  onCloseBaseModal() {
    this.countSitemap = 0;
    this.closeBaseModal.emit();
  }
}
